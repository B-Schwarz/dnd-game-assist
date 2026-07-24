const fs = require('fs')
const path = require('path')
const multer = require('multer')

const BOOK_DIR = path.resolve('books/pdf')

// Make sure the book directory exists (it may not on a fresh checkout, and
// multer's disk storage will not create it on upload).
if (!fs.existsSync(BOOK_DIR)) {
  fs.mkdirSync(BOOK_DIR, {recursive: true})
}

// Upload PDFs straight into the book directory, keeping the original file name
// (basename only, to prevent path traversal). Only PDFs are accepted.
// Keep the original name (basename only → no path traversal) but strip it to a
// safe character set so a crafted filename can't carry markup into any future
// HTML sink (the list is returned as JSON today, so this is defence-in-depth).
const safeBookName = (original) => {
  const base = path.basename(original).replace(/[^\w.\- ]+/g, '_')
  return base.toLowerCase().endsWith('.pdf') ? base : base + '.pdf'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BOOK_DIR),
  filename: (req, file, cb) => cb(null, safeBookName(file.originalname))
})

const bookUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')
    cb(null, isPdf)
  }
})

const getBookList = (req, res) => {
  const books = fs.readdirSync(BOOK_DIR)

  res.send(books)
}

// REQUIRES ADMIN (multer middleware runs first)
const uploadBook = (req, res) => {
  if (!req.file) {
    return res.sendStatus(400)
  }
  res.sendStatus(200)
}

// REQUIRES ADMIN
const deleteBook = (req, res) => {
  const name = path.basename(req.params.name || '')
  const file = path.join(BOOK_DIR, name)

  if (!name || !file.startsWith(BOOK_DIR)) {
    return res.sendStatus(400)
  }

  fs.unlink(file, (err) => {
    if (err) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  })
}

module.exports = {
  getBookList,
  uploadBook,
  deleteBook,
  bookUpload
}
