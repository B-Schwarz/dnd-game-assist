const {connect, getApp, clear, disconnect, makeUser, loginAgent, request} = require('./db')
const {User} = require('../db/models/user.model')
const mongoose = require('mongoose')

let app, admin
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

const seedAdmin = async () => {
    await makeUser({name: 'root', admin: true})
    admin = await loginAgent(app, 'root')
}

describe('getUserList', () => {
    test('returns only _id/name/master/admin/character (no password/session)', async () => {
        await seedAdmin()
        await makeUser({name: 'someone'})
        const res = await admin.get('/api/user')
        expect(res.statusCode).toBe(200)
        const target = res.body.find(u => u.name === 'someone')
        expect(Object.keys(target).sort()).toEqual(['_id', 'admin', 'character', 'master', 'name'])
        expect(target.password).toBeUndefined()
        expect(target.session).toBeUndefined()
    })
})

describe('setAdmin / setMaster', () => {
    test('flip the respective flag; missing or invalid userID → 400', async () => {
        await seedAdmin()
        const u = await makeUser({name: 'target'})
        expect((await admin.put('/api/user/admin').send({userID: u._id.toString(), admin: true})).statusCode).toBe(200)
        expect((await User.findById(u._id)).admin).toBe(true)
        expect((await admin.put('/api/user/master').send({userID: u._id.toString(), master: true})).statusCode).toBe(200)
        expect((await User.findById(u._id)).master).toBe(true)
        expect((await admin.put('/api/user/admin').send({userID: 'not-an-id', admin: true})).statusCode).toBe(400)
        expect((await admin.put('/api/user/admin').send({admin: true})).statusCode).toBe(400)
        expect((await admin.put('/api/user/master').send({master: true})).statusCode).toBe(400)
    })
})

describe('setPassword', () => {
    test('sets a new password (login works with new, fails with old)', async () => {
        await seedAdmin()
        const u = await makeUser({name: 'victim', password: 'oldpassword'})
        const res = await admin.put('/api/user/password').send({userID: u._id.toString(), password: 'Str0ngPass2026'})
        expect(res.statusCode).toBe(200)
        expect((await request(app).post('/api/auth/login').send({username: 'victim', password: 'Str0ngPass2026'})).statusCode).toBe(200)
        expect((await request(app).post('/api/auth/login').send({username: 'victim', password: 'oldpassword'})).statusCode).toBe(401)
    })

    test('rejects short/missing password (400) and an unknown user (404)', async () => {
        await seedAdmin()
        const u = await makeUser({name: 'victim'})
        expect((await admin.put('/api/user/password').send({userID: u._id.toString(), password: 'short'})).statusCode).toBe(400)
        expect((await admin.put('/api/user/password').send({userID: u._id.toString()})).statusCode).toBe(400)
        expect((await admin.put('/api/user/password').send({password: 'longenough1'})).statusCode).toBe(400)
        expect((await admin.put('/api/user/password').send({userID: new mongoose.Types.ObjectId().toString(), password: 'longenough1'})).statusCode).toBe(404)
    })
})
