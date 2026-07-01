const {connect, getApp, clear, disconnect, makeUser, loginAgent, request} = require('./db')
const {User} = require('../db/models/user.model')

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

describe('login', () => {
    test('valid credentials → 200 and a session token is stored', async () => {
        await makeUser({name: 'alice'})
        const agent = request.agent(app)
        const res = await agent.post('/api/auth/login').send({username: 'alice', password: 'password123'})
        expect(res.statusCode).toBe(200)
        const user = await User.findOne({name: 'alice'})
        expect(user.session).toHaveLength(1)
        // token is a UUID v4
        expect(user.session[0].token).toMatch(/^[0-9a-f-]{36}$/)
    })

    test('wrong password → 401', async () => {
        await makeUser({name: 'bob'})
        const res = await request(app).post('/api/auth/login').send({username: 'bob', password: 'nope'})
        expect(res.statusCode).toBe(401)
    })

    test('unknown user → 401', async () => {
        const res = await request(app).post('/api/auth/login').send({username: 'ghost', password: 'whatever'})
        expect(res.statusCode).toBe(401)
    })

    test('missing username or password → 400', async () => {
        expect((await request(app).post('/api/auth/login').send({username: 'x'})).statusCode).toBe(400)
        expect((await request(app).post('/api/auth/login').send({password: 'x'})).statusCode).toBe(400)
    })

    test('username match is case-insensitive', async () => {
        await makeUser({name: 'Carol'})
        const res = await request(app).post('/api/auth/login').send({username: 'carol', password: 'password123'})
        expect(res.statusCode).toBe(200)
    })

    test('a second login adds a second token (multiple active sessions)', async () => {
        await makeUser({name: 'dora'})
        await loginAgent(app, 'dora')
        await loginAgent(app, 'dora')
        const user = await User.findOne({name: 'dora'})
        expect(user.session).toHaveLength(2)
        const tokens = user.session.map(s => s.token)
        expect(new Set(tokens).size).toBe(2)
    })
})

describe('logout', () => {
    test('removes only the current session token and ends that session', async () => {
        await makeUser({name: 'erin'})
        const a1 = await loginAgent(app, 'erin')
        const a2 = await loginAgent(app, 'erin')
        expect((await User.findOne({name: 'erin'})).session).toHaveLength(2)

        const out = await a1.get('/api/auth/logout')
        expect(out.statusCode).toBe(200)

        expect((await User.findOne({name: 'erin'})).session).toHaveLength(1)
        // a1's session is gone, a2 still works
        expect((await a1.get('/api/me')).statusCode).toBe(401)
        expect((await a2.get('/api/me')).statusCode).toBe(200)
    })
})

describe('register (admin-gated)', () => {
    test('admin creates a user with master:false, admin:false', async () => {
        await makeUser({name: 'root', admin: true})
        const admin = await loginAgent(app, 'root')
        const res = await admin.post('/api/auth/register').send({username: 'newbie', password: 'password123'})
        expect(res.statusCode).toBe(200)
        const u = await User.findOne({name: 'newbie'})
        expect(u.master).toBe(false)
        expect(u.admin).toBe(false)
    })

    test('a non-admin cannot register users (401)', async () => {
        await makeUser({name: 'plain'})
        const agent = await loginAgent(app, 'plain')
        const res = await agent.post('/api/auth/register').send({username: 'x2', password: 'password123'})
        expect(res.statusCode).toBe(401)
    })

    test('missing fields → 400', async () => {
        await makeUser({name: 'root', admin: true})
        const admin = await loginAgent(app, 'root')
        expect((await admin.post('/api/auth/register').send({username: 'x'})).statusCode).toBe(400)
    })

    test('username shorter than 3 chars → 400', async () => {
        await makeUser({name: 'root', admin: true})
        const admin = await loginAgent(app, 'root')
        const res = await admin.post('/api/auth/register').send({username: 'ab', password: 'password123'})
        expect(res.statusCode).toBe(400)
    })

    test('duplicate username → 400', async () => {
        await makeUser({name: 'root', admin: true})
        await makeUser({name: 'taken'})
        const admin = await loginAgent(app, 'root')
        const res = await admin.post('/api/auth/register').send({username: 'taken', password: 'password123'})
        expect(res.statusCode).toBe(400)
    })
})

describe('isAuth + role gates (via the /api/me probes)', () => {
    test('isAuth: no/invalid session → 401, valid session → 200', async () => {
        await makeUser({name: 'frank'})
        expect((await request(app).get('/api/me')).statusCode).toBe(401)
        const agent = await loginAgent(app, 'frank')
        expect((await agent.get('/api/me')).statusCode).toBe(200)
    })

    test('isMaster allows master, denies a plain user and a pure admin', async () => {
        await makeUser({name: 'mst', master: true})
        await makeUser({name: 'adm', admin: true})
        await makeUser({name: 'usr'})
        expect((await (await loginAgent(app, 'mst')).get('/api/me/master')).statusCode).toBe(200)
        expect((await (await loginAgent(app, 'adm')).get('/api/me/master')).statusCode).toBe(401)
        expect((await (await loginAgent(app, 'usr')).get('/api/me/master')).statusCode).toBe(401)
    })

    test('isAdmin allows admin, denies a plain user and a pure master', async () => {
        await makeUser({name: 'adm', admin: true})
        await makeUser({name: 'mst', master: true})
        expect((await (await loginAgent(app, 'adm')).get('/api/me/admin')).statusCode).toBe(200)
        expect((await (await loginAgent(app, 'mst')).get('/api/me/admin')).statusCode).toBe(401)
    })

    test('isMasterOrAdmin allows either flag, denies a plain user', async () => {
        await makeUser({name: 'mst', master: true})
        await makeUser({name: 'adm', admin: true})
        await makeUser({name: 'usr'})
        expect((await (await loginAgent(app, 'mst')).get('/api/me/admin/master')).statusCode).toBe(200)
        expect((await (await loginAgent(app, 'adm')).get('/api/me/admin/master')).statusCode).toBe(200)
        expect((await (await loginAgent(app, 'usr')).get('/api/me/admin/master')).statusCode).toBe(401)
    })
})
