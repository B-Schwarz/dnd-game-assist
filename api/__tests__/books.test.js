const {connect, getApp, clear, disconnect, makeUser, loginAgent, request} = require('./db')
const {deleteBook} = require('../books')
const {mockRes} = require('./helpers')
const fs = require('fs')
const path = require('path')

const BOOK_DIR = path.resolve('books/pdf')

let app, admin
beforeAll(async () => {
    await connect()
    app = getApp()
    await makeUser({name: 'root', admin: true})
    await makeUser({name: 'plain'})
    admin = await loginAgent(app, 'root')
})
afterAll(async () => {
    await disconnect()
    // remove any files this suite created
    for (const f of fs.readdirSync(BOOK_DIR)) {
        if (f.startsWith('ut-')) fs.unlinkSync(path.join(BOOK_DIR, f))
    }
})

describe('getBookList', () => {
    test('returns an array of file names', async () => {
        const res = await admin.get('/api/books')
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })
})

describe('uploadBook', () => {
    test('a non-admin cannot upload (401, before multer runs)', async () => {
        const agent = await loginAgent(app, 'plain')
        const res = await agent.post('/api/books')
            .attach('book', Buffer.from('%PDF-1.4'), {filename: 'ut-x.pdf', contentType: 'application/pdf'})
        expect(res.statusCode).toBe(401)
    })

    test('a PDF is accepted (200) and shows up in the list', async () => {
        const res = await admin.post('/api/books')
            .attach('book', Buffer.from('%PDF-1.4 hello'), {filename: 'ut-book.pdf', contentType: 'application/pdf'})
        expect(res.statusCode).toBe(200)
        expect((await admin.get('/api/books')).body).toContain('ut-book.pdf')
    })

    test('a non-PDF is rejected by the filter (no req.file → 400)', async () => {
        const res = await admin.post('/api/books')
            .attach('book', Buffer.from('just text'), {filename: 'ut-note.txt', contentType: 'text/plain'})
        expect(res.statusCode).toBe(400)
    })
})

describe('deleteBook', () => {
    test('removes an existing book (200) and a missing one → 404', async () => {
        await admin.post('/api/books')
            .attach('book', Buffer.from('%PDF-1.4'), {filename: 'ut-del.pdf', contentType: 'application/pdf'})
        expect((await admin.delete('/api/books/ut-del.pdf')).statusCode).toBe(200)
        expect((await admin.get('/api/books')).body).not.toContain('ut-del.pdf')
        expect((await admin.delete('/api/books/ut-nope.pdf')).statusCode).toBe(404)
    })

    test('an empty name is rejected (400) — path safety guard', async () => {
        const res = mockRes()
        deleteBook({params: {name: ''}}, res)
        expect(res.statusCode).toBe(400)
    })

    test('a traversal attempt is reduced to a basename and cannot escape the book dir', async () => {
        // basename('../../../etc/passwd') === 'passwd', which does not exist in
        // the book dir → 404 (and crucially never touches anything outside it).
        const res = mockRes()
        deleteBook({params: {name: '../../../etc/passwd'}}, res)
        await new Promise(r => setTimeout(r, 30))
        expect(res.statusCode).toBe(404)
        expect(fs.existsSync('/etc/passwd')).toBe(true) // untouched
    })
})
