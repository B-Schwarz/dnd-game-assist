const fs = require('fs')
const path = require('path')

const getBookList = (req, res) => {
  const books = fs.readdirSync(path.resolve('books/pdf'))

  res.send(books)
}

module.exports = {
  getBookList
}
