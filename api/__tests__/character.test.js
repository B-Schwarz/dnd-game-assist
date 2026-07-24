const {connect, getApp, clear, disconnect, makeUser, makeCharacter, loginAgent, request} = require('./db')
const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

let app, gm, player, other
beforeAll(async () => {
    await connect()
    app = getApp()
})
afterEach(async () => {
    await clear()
})
afterAll(async () => {
    await disconnect()
})

// gm: master + admin (satisfies every role gate). player/other: plain users.
const seedActors = async () => {
    await makeUser({name: 'gms', master: true, admin: true})
    player = await makeUser({name: 'player'})
    other = await makeUser({name: 'other'})
    gm = await loginAgent(app, 'gms')
}
const reload = async (name) => User.findOne({name})

describe('createCharacter', () => {
    test('creates a doc, links it to the user, defaults name:"" and npc:false', async () => {
        await seedActors()
        const agent = await loginAgent(app, 'player')
        const res = await agent.get('/api/char/new')
        expect(res.statusCode).toBe(200)
        expect(res.body.id).toBeDefined()
        const doc = await Character.findById(res.body.id)
        expect(doc.character.name).toBe('')
        expect(doc.npc).toBe(false)
        expect((await reload('player')).character.map(String)).toContain(res.body.id)
    })
})

describe('saveCharacter + preserveHp', () => {
    test('persists the sheet but preserves the stored current HP', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'Orig', hp: 7, maxHp: 20}})
        const res = await gm.post('/api/char').send({
            charID: doc._id.toString(),
            character: {name: 'Renamed', hp: 999, maxHp: 20},
        })
        expect(res.statusCode).toBe(200)
        const after = await Character.findById(doc._id)
        expect(after.character.name).toBe('Renamed') // sheet updated
        expect(after.character.hp).toBe(7) // HP preserved, not 999
    })

    test('missing charID → 400; invalid charID → 404', async () => {
        await seedActors()
        expect((await gm.post('/api/char').send({character: {}})).statusCode).toBe(400)
        // An un-castable id throws in preserveHp → 404.
        expect((await gm.post('/api/char').send({charID: 'not-an-id', character: {}})).statusCode).toBe(404)
    })

    test('a plain user cannot use the privileged save (401)', async () => {
        await seedActors()
        const doc = await makeCharacter({})
        const agent = await loginAgent(app, 'player')
        expect((await agent.post('/api/char').send({charID: doc._id.toString(), character: {}})).statusCode).toBe(401)
    })
})

describe('saveOwnCharacter', () => {
    test('owned → 200 and preserves HP; not owned → 401', async () => {
        await seedActors()
        const owned = await makeCharacter({owner: player, character: {name: 'Mine', hp: 5}})
        const foreign = await makeCharacter({character: {name: 'NotMine', hp: 5}})
        const agent = await loginAgent(app, 'player')
        expect((await agent.post('/api/char/me').send({charID: owned._id.toString(), character: {name: 'X', hp: 100}})).statusCode).toBe(200)
        expect((await Character.findById(owned._id)).character.hp).toBe(5)
        expect((await agent.post('/api/char/me').send({charID: foreign._id.toString(), character: {}})).statusCode).toBe(401)
    })
})

describe('HP endpoints', () => {
    test('saveCharacterHp updates only HP; missing charID → 400', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'H', hp: 10}})
        expect((await gm.put('/api/char/hp').send({charID: doc._id.toString(), hp: 3})).statusCode).toBe(200)
        expect((await Character.findById(doc._id)).character.hp).toBe(3)
        expect((await gm.put('/api/char/hp').send({hp: 3})).statusCode).toBe(400)
    })

    test('getCharacterHp reads HP back; unknown char → 404', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'H', hp: 8}})
        const res = await gm.get(`/api/char/hp/${doc._id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.hp).toBe(8)
        expect((await gm.get(`/api/char/hp/${new mongoose.Types.ObjectId()}`)).statusCode).toBe(404)
    })

    test('saveOwnCharacterHp: owned → 200, not owned → 401; getOwnCharacterHp not owned → 404', async () => {
        await seedActors()
        const owned = await makeCharacter({owner: player, character: {name: 'M', hp: 10}})
        const foreign = await makeCharacter({character: {name: 'F', hp: 10}})
        const agent = await loginAgent(app, 'player')
        expect((await agent.put('/api/char/me/hp').send({charID: owned._id.toString(), hp: 2})).statusCode).toBe(200)
        expect((await agent.put('/api/char/me/hp').send({charID: foreign._id.toString(), hp: 2})).statusCode).toBe(401)
        expect((await agent.get(`/api/char/me/hp/${foreign._id}`)).statusCode).toBe(404)
    })

    test('saveCharacterHpBulk: non-array → 400, empty → 200, mixed valid/invalid applies the valid ones', async () => {
        await seedActors()
        const a = await makeCharacter({character: {name: 'A', hp: 10}})
        const b = await makeCharacter({character: {name: 'B', hp: 10}})
        expect((await gm.post('/api/char/hp/bulk').send({updates: 'nope'})).statusCode).toBe(400)
        expect((await gm.post('/api/char/hp/bulk').send({updates: []})).statusCode).toBe(200)
        const res = await gm.post('/api/char/hp/bulk').send({
            updates: [
                {charID: a._id.toString(), hp: 1},
                {charID: 'garbage', hp: 5}, // invalid id → skipped
                {charID: new mongoose.Types.ObjectId().toString(), hp: 5}, // valid id, no such char → skipped
                {charID: b._id.toString(), hp: 2},
            ],
        })
        expect(res.statusCode).toBe(200)
        expect((await Character.findById(a._id)).character.hp).toBe(1)
        expect((await Character.findById(b._id)).character.hp).toBe(2)
    })
})

describe('character lists', () => {
    test('getCharacterList excludes the requester’s own; getOwnCharacterList returns only theirs', async () => {
        await seedActors()
        const mine = await makeCharacter({owner: player, character: {name: 'Mine', hp: 12, playerName: 'Owner', appearance: 'data:image/png;base64,AAAA'}})
        const theirs = await makeCharacter({owner: other, character: {name: 'Theirs'}})
        const agent = await loginAgent(app, 'player')
        // player is a plain user, so use gm (master/admin) for the privileged list,
        // assigning a char to gm to prove exclusion.
        const gmUser = await reload('gms')
        const gmChar = await makeCharacter({character: {name: 'GMs'}})
        gmUser.character.push(gmChar._id); await gmUser.save()
        const list = (await gm.get('/api/charlist')).body
        const names = list.map(c => c.character.name)
        expect(names).toContain('Mine')
        expect(names).toContain('Theirs')
        expect(names).not.toContain('GMs') // requester's own excluded
        list.forEach(c => expect(Object.keys(c).sort()).toEqual(['_id', 'character', 'npc', 'primary']))
        // list keeps the board subset + the list-view display fields, but never
        // the heavy base64 image
        const mineOut = list.find(c => c.character.name === 'Mine')
        expect(mineOut.character.hp).toBe(12)
        expect(mineOut.character.playerName).toBe('Owner') // character-list "Spieler" column
        expect(mineOut.character).not.toHaveProperty('appearance')

        const own = (await agent.get('/api/charlist/me')).body
        expect(own.map(c => c.character.name)).toEqual(['Mine'])
    })

    test('getNPCList returns only the caller’s NPCs', async () => {
        await seedActors()
        const gmUser = await reload('gms')
        await makeCharacter({owner: gmUser, character: {name: 'pc'}, npc: false})
        const npcDoc = await makeCharacter({character: {name: 'npc'}, npc: true})
        gmUser.character.push(npcDoc._id); await gmUser.save()
        const list = (await gm.get('/api/charlist/npc')).body
        expect(list.map(c => c.character.name)).toEqual(['npc'])
    })
})

describe('get / delete + ownership', () => {
    test('getCharacter (privileged) sees any; getOwnCharacter 404 when not owned', async () => {
        await seedActors()
        const foreign = await makeCharacter({character: {name: 'F'}})
        expect((await gm.get(`/api/char/get/${foreign._id}`)).statusCode).toBe(200)
        const agent = await loginAgent(app, 'player')
        expect((await agent.get(`/api/char/me/get/${foreign._id}`)).statusCode).toBe(404)
    })

    test('deleteCharacter removes the doc and unlinks it from its owner', async () => {
        await seedActors()
        const doc = await makeCharacter({owner: other, character: {name: 'Doomed'}})
        expect((await gm.delete(`/api/char/${doc._id}`)).statusCode).toBe(200)
        // give the fire-and-forget callbacks a tick
        await new Promise(r => setTimeout(r, 50))
        expect(await Character.findById(doc._id)).toBeNull()
        expect((await reload('other')).character.map(String)).not.toContain(doc._id.toString())
    })

    test('deleteOwnCharacter only affects the caller’s character', async () => {
        await seedActors()
        const mine = await makeCharacter({owner: player, character: {name: 'Mine'}})
        const agent = await loginAgent(app, 'player')
        expect((await agent.delete(`/api/char/me/${mine._id}`)).statusCode).toBe(200)
        await new Promise(r => setTimeout(r, 50))
        expect(await Character.findById(mine._id)).toBeNull()
    })
})

describe('setNPC', () => {
    test('toggles the npc flag; missing id → 400; unknown id → 404', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'T'}, npc: false})
        expect((await gm.put('/api/char/npc/toggle').send({charID: doc._id.toString()})).statusCode).toBe(200)
        expect((await Character.findById(doc._id)).npc).toBe(true)
        expect((await gm.put('/api/char/npc/toggle').send({})).statusCode).toBe(400)
        expect((await gm.put('/api/char/npc/toggle').send({charID: 'bad'})).statusCode).toBe(404)
    })
})

describe('setPrimary', () => {
    test('toggles the primary flag; missing id → 400; unknown id → 404', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'P'}})
        expect((await Character.findById(doc._id)).primary).toBe(false)
        expect((await gm.put('/api/char/primary/toggle').send({charID: doc._id.toString()})).statusCode).toBe(200)
        expect((await Character.findById(doc._id)).primary).toBe(true)
        // toggles back off
        expect((await gm.put('/api/char/primary/toggle').send({charID: doc._id.toString()})).statusCode).toBe(200)
        expect((await Character.findById(doc._id)).primary).toBe(false)
        expect((await gm.put('/api/char/primary/toggle').send({})).statusCode).toBe(400)
        expect((await gm.put('/api/char/primary/toggle').send({charID: 'bad'})).statusCode).toBe(404)
    })
})

describe('setOwnPrimary', () => {
    test('a player toggles their OWN primary flag; not owned → 401; missing id → 400', async () => {
        await seedActors()
        const owned = await makeCharacter({owner: player, character: {name: 'Mine'}})
        const foreign = await makeCharacter({owner: other, character: {name: 'Theirs'}})
        const agent = await loginAgent(app, 'player')

        expect((await agent.put('/api/char/me/primary/toggle').send({charID: owned._id.toString()})).statusCode).toBe(200)
        expect((await Character.findById(owned._id)).primary).toBe(true)
        // toggles back off
        expect((await agent.put('/api/char/me/primary/toggle').send({charID: owned._id.toString()})).statusCode).toBe(200)
        expect((await Character.findById(owned._id)).primary).toBe(false)
        // cannot touch someone else's character
        expect((await agent.put('/api/char/me/primary/toggle').send({charID: foreign._id.toString()})).statusCode).toBe(401)
        expect((await Character.findById(foreign._id)).primary).toBe(false)
        // missing id → 400
        expect((await agent.put('/api/char/me/primary/toggle').send({})).statusCode).toBe(400)
    })
})

describe('export / import / reassign', () => {
    test('exportCharacters resolves owner (or null when unowned)', async () => {
        await seedActors()
        const owned = await makeCharacter({owner: other, character: {name: 'Owned'}})
        const orphan = await makeCharacter({character: {name: 'Orphan'}})
        const out = (await gm.get('/api/char/export')).body
        const byName = Object.fromEntries(out.map(c => [c.character.name, c]))
        expect(byName.Owned.owner.name).toBe('other')
        expect(byName.Orphan.owner).toBeNull()
    })

    test('importCharacters creates unowned docs; coerces npc; rejects non-array', async () => {
        await seedActors()
        expect((await gm.post('/api/char/import').send({characters: 'nope'})).statusCode).toBe(400)
        const res = await gm.post('/api/char/import').send({
            characters: [
                {character: {name: 'I1'}, npc: 'true', primary: 'yes'}, // truthy strings → true
                {character: {name: 'I2'}},               // npc/primary undefined → false
                {npc: true},                              // no character → skipped
            ],
        })
        expect(res.statusCode).toBe(200)
        expect(res.body.created).toBe(2)
        const i1 = await Character.findOne({'character.name': 'I1'})
        expect(i1.npc).toBe(true)
        expect(i1.primary).toBe(true)
        const i2 = await Character.findOne({'character.name': 'I2'})
        expect(i2.primary).toBe(false)
        // imported docs are unowned
        const owners = await User.find({character: i1._id})
        expect(owners).toHaveLength(0)
    })

    test('reassignCharacter moves ownership; rejects missing fields, NPCs, and unknown target', async () => {
        await seedActors()
        const pc = await makeCharacter({owner: other, character: {name: 'PC'}})
        const npc = await makeCharacter({character: {name: 'NPC'}, npc: true})
        const target = await reload('player')

        expect((await gm.put('/api/char/reassign').send({charID: pc._id.toString()})).statusCode).toBe(400)
        expect((await gm.put('/api/char/reassign').send({charID: npc._id.toString(), toUserID: target._id.toString()})).statusCode).toBe(400)
        expect((await gm.put('/api/char/reassign').send({charID: pc._id.toString(), toUserID: new mongoose.Types.ObjectId().toString()})).statusCode).toBe(404)

        const ok = await gm.put('/api/char/reassign').send({charID: pc._id.toString(), toUserID: target._id.toString()})
        expect(ok.statusCode).toBe(200)
        expect((await reload('player')).character.map(String)).toContain(pc._id.toString())
        expect((await reload('other')).character.map(String)).not.toContain(pc._id.toString())
    })
})

describe('backstory attachment', () => {
    const ATTACH_DIR = path.resolve('attachments')
    const storedFile = (id) => path.join(ATTACH_DIR, id)
    // Uploads land on disk under attachments/<id>; wipe them between tests.
    afterEach(() => {
        if (fs.existsSync(ATTACH_DIR)) {
            for (const f of fs.readdirSync(ATTACH_DIR)) fs.unlinkSync(path.join(ATTACH_DIR, f))
        }
    })

    test('gm uploads, downloads and deletes any character document', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'Hero'}})
        const id = doc._id.toString()

        const up = await gm.post(`/api/char/${id}/attachment`)
            .attach('file', Buffer.from('backstory text'), {filename: 'lore.txt', contentType: 'text/plain'})
        expect(up.statusCode).toBe(200)
        const stored = await Character.findById(id)
        expect(stored.attachment.name).toBe('lore.txt')
        expect(stored.attachment.mime).toBe('text/plain')
        expect(fs.existsSync(storedFile(id))).toBe(true)

        const dl = await gm.get(`/api/char/${id}/attachment`)
        expect(dl.statusCode).toBe(200)
        expect(dl.headers['content-disposition']).toContain('lore.txt')
        expect(dl.text).toBe('backstory text')

        // the metadata rides along on the character GET
        const got = await gm.get(`/api/char/get/${id}`)
        expect(got.body.attachment.name).toBe('lore.txt')

        const del = await gm.delete(`/api/char/${id}/attachment`)
        expect(del.statusCode).toBe(200)
        expect((await Character.findById(id)).attachment.name).toBeFalsy()
        expect(fs.existsSync(storedFile(id))).toBe(false)
    })

    test('owner manages their own document via /me; a non-owner is blocked (401)', async () => {
        await seedActors()
        const mine = await makeCharacter({owner: player, character: {name: 'Mine'}})
        const id = mine._id.toString()
        const agent = await loginAgent(app, 'player')

        expect((await agent.post(`/api/char/me/${id}/attachment`)
            .attach('file', Buffer.from('x'), {filename: 'mine.txt', contentType: 'text/plain'})).statusCode).toBe(200)
        expect((await agent.get(`/api/char/me/${id}/attachment`)).statusCode).toBe(200)

        const outsider = await loginAgent(app, 'other')
        expect((await outsider.post(`/api/char/me/${id}/attachment`)
            .attach('file', Buffer.from('x'), {filename: 'hack.txt', contentType: 'text/plain'})).statusCode).toBe(401)
        expect((await outsider.get(`/api/char/me/${id}/attachment`)).statusCode).toBe(401)
        expect((await outsider.delete(`/api/char/me/${id}/attachment`)).statusCode).toBe(401)
        // the owner's file is untouched
        expect((await Character.findById(id)).attachment.name).toBe('mine.txt')
    })

    test('a plain user cannot use the privileged upload (401)', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'X'}})
        const agent = await loginAgent(app, 'player')
        expect((await agent.post(`/api/char/${doc._id}/attachment`)
            .attach('file', Buffer.from('x'), {filename: 'a.txt', contentType: 'text/plain'})).statusCode).toBe(401)
    })

    test('rejects a disallowed file type (nothing stored → 400)', async () => {
        await seedActors()
        const doc = await makeCharacter({character: {name: 'X'}})
        const id = doc._id.toString()
        const res = await gm.post(`/api/char/${id}/attachment`)
            .attach('file', Buffer.from('PNG'), {filename: 'pic.png', contentType: 'image/png'})
        expect(res.statusCode).toBe(400)
        expect((await Character.findById(id)).attachment.name).toBeFalsy()
        expect(fs.existsSync(storedFile(id))).toBe(false)
    })

    test('invalid id → 400; download with no attachment → 404', async () => {
        await seedActors()
        expect((await gm.post('/api/char/not-an-id/attachment')
            .attach('file', Buffer.from('x'), {filename: 'a.txt', contentType: 'text/plain'})).statusCode).toBe(400)
        const doc = await makeCharacter({character: {name: 'X'}})
        expect((await gm.get(`/api/char/${doc._id}/attachment`)).statusCode).toBe(404)
    })

    test('uploading to a valid but non-existent id → 404 and leaves no orphan file', async () => {
        await seedActors()
        const ghost = new mongoose.Types.ObjectId().toString()
        const res = await gm.post(`/api/char/${ghost}/attachment`)
            .attach('file', Buffer.from('x'), {filename: 'a.txt', contentType: 'text/plain'})
        expect(res.statusCode).toBe(404)
        expect(fs.existsSync(storedFile(ghost))).toBe(false)
    })
})
