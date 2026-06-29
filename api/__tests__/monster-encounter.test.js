const {connect, getApp, clear, disconnect, makeUser, loginAgent} = require('./db')
const {Monster} = require('../db/models/monster.model')
const {Encounter} = require('../db/models/encounter.model')

let app, gm, plain
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

const seed = async () => {
    await makeUser({name: 'gms', master: true, admin: true})
    await makeUser({name: 'plain'})
    gm = await loginAgent(app, 'gms')
    plain = await loginAgent(app, 'plain')
}

describe('monster', () => {
    test('create / list / get / save / delete', async () => {
        await seed()
        expect((await gm.get('/api/monster/new')).statusCode).toBe(200)
        const created = await Monster.findOne()
        expect(created).not.toBeNull()

        // save (rename), then read it back
        const save = await gm.put('/api/monster').send({charID: created._id.toString(), monster: {name: 'Goblin'}})
        expect(save.statusCode).toBe(200)
        const got = await gm.get(`/api/monster/${created._id}`)
        expect(got.body.monster.name).toBe('Goblin')

        // list is available to any authed user and omits __v
        const list = await plain.get('/api/monster/list')
        expect(list.statusCode).toBe(200)
        expect(list.body[0].__v).toBeUndefined()

        expect((await gm.delete(`/api/monster/${created._id}`)).statusCode).toBe(200)
        await new Promise(r => setTimeout(r, 50))
        expect(await Monster.findById(created._id)).toBeNull()
    })

    test('saveMonster with an invalid id → 404', async () => {
        await seed()
        expect((await gm.put('/api/monster').send({charID: 'bad-id', monster: {}})).statusCode).toBe(404)
    })

    test('list is sorted by monster.name ascending', async () => {
        await seed()
        await Monster.create({monster: {name: 'Zombie'}})
        await Monster.create({monster: {name: 'Aboleth'}})
        const list = (await gm.get('/api/monster/list')).body
        const names = list.map(m => m.monster.name)
        expect(names).toEqual([...names].sort())
    })

    test('a plain user cannot create a monster (401)', async () => {
        await seed()
        expect((await plain.get('/api/monster/new')).statusCode).toBe(401)
    })
})

describe('encounter', () => {
    test('create defaults (owned, name, empty list) and list is scoped to the owner', async () => {
        await seed()
        expect((await gm.get('/api/encounter/new')).statusCode).toBe(200)
        const enc = await Encounter.findOne()
        expect(enc.name).toBe('New Encounter')
        expect(enc.encounter).toEqual([])

        const list = (await gm.get('/api/encounter/list')).body
        expect(list).toHaveLength(1)
    })

    test('saveEncounter updates name + entries; an invalid id → 400', async () => {
        await seed()
        await gm.get('/api/encounter/new')
        const enc = await Encounter.findOne()
        const monsterId = new (require('mongoose').Types.ObjectId)().toString()
        const res = await gm.put('/api/encounter').send({
            encounterID: enc._id.toString(),
            name: 'Ambush',
            encounter: {encounter: [{monster: monsterId, amount: 2, hidden: false}]},
        })
        expect(res.statusCode).toBe(200)
        const after = await Encounter.findById(enc._id)
        expect(after.name).toBe('Ambush')
        expect(after.encounter).toHaveLength(1)
        // An un-castable id rejects in findOneAndUpdate → 400.
        expect((await gm.put('/api/encounter').send({encounterID: 'bad-id', encounter: {encounter: []}})).statusCode).toBe(400)
        // A missing id or a missing body → 400 (no 500 throw).
        expect((await gm.put('/api/encounter').send({encounter: {encounter: []}})).statusCode).toBe(400)
        expect((await gm.put('/api/encounter').send({encounterID: enc._id.toString()})).statusCode).toBe(400)
    })

    test('deleteEncounter is scoped to the owner: own → 200, another user’s → 404', async () => {
        await seed()
        // gms creates an encounter
        await gm.get('/api/encounter/new')
        const enc = await Encounter.findOne()
        // a different master cannot delete it
        await makeUser({name: 'gm2', master: true})
        const other = await loginAgent(app, 'gm2')
        expect((await other.delete(`/api/encounter/${enc._id}`)).statusCode).toBe(404)
        expect(await Encounter.findById(enc._id)).not.toBeNull()
        // the owner can
        expect((await gm.delete(`/api/encounter/${enc._id}`)).statusCode).toBe(200)
        expect(await Encounter.findById(enc._id)).toBeNull()
    })

    test('a plain user cannot list encounters (401)', async () => {
        await seed()
        expect((await plain.get('/api/encounter/list')).statusCode).toBe(401)
    })
})
