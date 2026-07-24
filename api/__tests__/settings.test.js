const {connect, getApp, clear, disconnect, makeUser, makeCharacter, loginAgent, request} = require('./db')
const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')
const mongoose = require('mongoose')

let app
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

describe('changeOwnPassword', () => {
    test('correct current password → 200 and the new password works', async () => {
        await makeUser({name: 'user1', password: 'currentpw1'})
        const agent = await loginAgent(app, 'user1', 'currentpw1')
        const res = await agent.put('/api/me/password').send({currPass: 'currentpw1', newPass: 'Str0ngPass2026'})
        expect(res.statusCode).toBe(200)
        expect((await request(app).post('/api/auth/login').send({username: 'user1', password: 'Str0ngPass2026'})).statusCode).toBe(200)
    })

    test('wrong current password → 401', async () => {
        await makeUser({name: 'user1', password: 'currentpw1'})
        const agent = await loginAgent(app, 'user1', 'currentpw1')
        expect((await agent.put('/api/me/password').send({currPass: 'wrong', newPass: 'Str0ngPass2026'})).statusCode).toBe(401)
    })

    test('missing fields → 400; a new password shorter than 8 chars → 400', async () => {
        await makeUser({name: 'user1', password: 'currentpw1'})
        const agent = await loginAgent(app, 'user1', 'currentpw1')
        expect((await agent.put('/api/me/password').send({currPass: 'currentpw1'})).statusCode).toBe(400)
        expect((await agent.put('/api/me/password').send({currPass: 'currentpw1', newPass: 'short'})).statusCode).toBe(400)
    })
})

describe('deleteOwnAccount', () => {
    test('removes the user and all of their characters', async () => {
        const user = await makeUser({name: 'gone'})
        const c = await makeCharacter({owner: user, character: {name: 'C'}})
        const agent = await loginAgent(app, 'gone')
        const res = await agent.delete('/api/me/delete')
        expect(res.statusCode).toBe(200)
        await new Promise(r => setTimeout(r, 50))
        expect(await User.findOne({name: 'gone'})).toBeNull()
        expect(await Character.findById(c._id)).toBeNull()
    })
})

describe('deleteAccount (admin)', () => {
    test('deletes a target user and their characters; missing userID → 400; unknown user → 404', async () => {
        await makeUser({name: 'root', admin: true})
        const admin = await loginAgent(app, 'root')
        const target = await makeUser({name: 'target'})
        const c = await makeCharacter({owner: target, character: {name: 'C'}})

        expect((await admin.delete('/api/account/delete').send({})).statusCode).toBe(400)
        expect((await admin.delete('/api/account/delete').send({userID: new mongoose.Types.ObjectId().toString()})).statusCode).toBe(404)

        const res = await admin.delete('/api/account/delete').send({userID: target._id.toString()})
        expect(res.statusCode).toBe(200)
        await new Promise(r => setTimeout(r, 50))
        expect(await User.findOne({name: 'target'})).toBeNull()
        expect(await Character.findById(c._id)).toBeNull()
    })
})
