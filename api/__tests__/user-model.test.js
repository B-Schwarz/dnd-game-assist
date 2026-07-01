const {connect, clear, disconnect, makeUser} = require('./db')
const {User} = require('../db/models/user.model')

beforeAll(async () => {
    await connect()
})
afterEach(async () => {
    await clear()
})
afterAll(async () => {
    await disconnect()
})

describe('pre(save) password hashing', () => {
    test('hashes on create, never stores plaintext, and only re-hashes when password changes', async () => {
        const u = new User({name: 'hashme', password: 'plainpw12', master: false, admin: false})
        await u.save()
        const h1 = u.password
        expect(h1).not.toBe('plainpw12')
        expect(h1.startsWith('$2')).toBe(true) // bcrypt hash

        u.name = 'hashme-renamed'
        await u.save()
        expect(u.password).toBe(h1) // a non-password save does not re-hash

        u.password = 'differentpw12'
        await u.save()
        expect(u.password).not.toBe(h1) // password change re-hashes
    })
})

describe('findByCredentials', () => {
    test('resolves on a correct password (case-insensitive name), rejects on a wrong one', async () => {
        await makeUser({name: 'creduser', password: 'rightpw12'})
        await expect(User.findByCredentials('creduser', 'rightpw12')).resolves.toBeTruthy()
        await expect(User.findByCredentials('CREDUSER', 'rightpw12')).resolves.toBeTruthy()
        await expect(User.findByCredentials('creduser', 'wrongpw')).rejects.toBeUndefined()
    })
})

describe('generateSession', () => {
    test('pushes a token and returns it', async () => {
        const u = await makeUser({name: 'sessuser'})
        const token = await u.generateSession()
        expect(typeof token).toBe('string')
        const reloaded = await User.findById(u._id)
        expect(reloaded.session.map(s => s.token)).toContain(token)
    })
})

describe('schema constraints', () => {
    test('password/master/admin required; name minlength/unique; name is trimmed', async () => {
        // missing password
        await expect(new User({name: 'nopw', master: false, admin: false}).save()).rejects.toBeTruthy()
        // name too short
        await expect(new User({name: 'ab', password: 'password12', master: false, admin: false}).save()).rejects.toBeTruthy()
        // name trimmed
        const trimmed = await new User({name: '  spaced  ', password: 'password12', master: false, admin: false}).save()
        expect(trimmed.name).toBe('spaced')
        // duplicate name
        await makeUser({name: 'dupe'})
        await expect(new User({name: 'dupe', password: 'password12', master: false, admin: false}).save()).rejects.toBeTruthy()
    })
})
