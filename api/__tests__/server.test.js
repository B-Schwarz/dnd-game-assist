const {connect, getApp, clear, disconnect, makeUser, request} = require('./db')
const {connectDB} = require('../db')
const {User} = require('../db/models/user.model')
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

describe('CORS / preflight', () => {
    test('an OPTIONS preflight short-circuits to 204 with the CORS headers', async () => {
        const res = await request(app).options('/api/char/new')
        expect(res.statusCode).toBe(204)
        expect(res.headers['access-control-allow-credentials']).toBe('true')
        expect(res.headers['access-control-allow-methods']).toBe('GET, POST, PUT, DELETE')
        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    })
})

describe('security headers / rate limiter', () => {
    test('x-powered-by is disabled and the rate-limit headers are present on /api', async () => {
        const res = await request(app).get('/api/me') // 401, but headers still apply
        expect(res.headers['x-powered-by']).toBeUndefined()
        expect(res.headers['ratelimit-limit']).toBeDefined()
    })
})

describe('session cookie', () => {
    test('login sets the httpOnly dnd.sid cookie', async () => {
        await makeUser({name: 'cookieuser'})
        const res = await request(app).post('/api/auth/login').send({username: 'cookieuser', password: 'password123'})
        const setCookie = (res.headers['set-cookie'] || []).join(';')
        expect(setCookie).toMatch(/dnd\.sid/)
        expect(setCookie).toMatch(/HttpOnly/i)
    })
})

describe('static book mount', () => {
    test('serving PDFs is gated behind isAuth (unauthenticated → 401)', async () => {
        const res = await request(app).get('/api/books/whatever.pdf')
        expect(res.statusCode).toBe(401)
    })
})

describe('DB bootstrap (connectDB)', () => {
    test('seeds a default admin when the users collection is empty, and sets strictQuery:false', async () => {
        await User.deleteMany({})
        await connectDB()
        await new Promise(r => setTimeout(r, 100)) // seeding is fire-and-forget
        const admin = await User.findOne({name: 'admin'})
        expect(admin).not.toBeNull()
        expect(admin.admin).toBe(true)
        expect(admin.master).toBe(false)
        expect(mongoose.get('strictQuery')).toBe(false)
    })

    test('does not seed when users already exist', async () => {
        await User.deleteMany({})
        await makeUser({name: 'existing'})
        await connectDB()
        await new Promise(r => setTimeout(r, 100))
        expect(await User.findOne({name: 'admin'})).toBeNull()
    })
})
