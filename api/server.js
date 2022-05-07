const express = require('express');
const app = express();
const {connectDB} = require('./db')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const RateLimit = require('express-rate-limit')

const {login, logout, isAuth, register, isMaster, isMasterOrAdmin, isAdmin} = require('./auth')
const {
    getCharacterList, getOwnCharacterList, getCharacter,
    getOwnCharacter, saveCharacter, saveOwnCharacter, createCharacter, deleteCharacter,
    deleteOwnCharacter, setNPC, getNPCList
} = require("./character");
const {deleteOwnAccount, deleteAccount, changeOwnPassword} = require("./settings");
const {
    setPlayer, getPlayerPlayer, getPlayerMaster, sortPlayer, movePlayer,
    setRound, getRound, deleteMaster, updateMaster, addMaster, deleteAllMaster
} = require("./initiative");
const {createMonster, getMonsterList, saveMonster, deleteMonster} = require("./monster");
const {getUserList, setAdmin, setMaster} = require("./admin");
const {getBookList, getBook} = require("./books");
const path = require("path");

const port = 4000;

app.use(express.json({limit: '2mb'}));
app.use(express.urlencoded({extended: false}));

app.disable('x-powered-by');

// CORS Header
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CORS_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true")

    next();
});

const store = MongoStore.create({
    mongoUrl: process.env.DB_URI,
    collectionName: 'sessions'
})

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
}

const sess = session({
    name: 'dnd.sid',
    secret: process.env.DND_COOKIE_SECRET,
    saveUninitialized: false,
    resave: true,
    store: store,
    proxy: (process.env.NODE_ENV === 'production'),
    cookie: {
        httpOnly: true,
        maxAge: 99999999999999,
        sameSite: 'lax',
        secure: (process.env.NODE_ENV === 'production')
    }
})

app.use(sess)

const limiter = RateLimit({
    windowMs: 1*60*1000,
    max: 10000,
    standardHeaders: true
})

app.use('/api', limiter)

//
//  CHARACTER LIST
//
app.get('/api/charlist', isAuth, isMasterOrAdmin, getCharacterList)
app.get('/api/charlist/me', isAuth, getOwnCharacterList)
app.get('/api/charlist/npc', isAuth, isMaster, getNPCList)

//
//  CHARACTER
//
app.get('/api/char/new', isAuth, createCharacter)
app.get('/api/char/get/:id', isAuth, isMasterOrAdmin, getCharacter)
app.get('/api/char/me/get/:id', isAuth, getOwnCharacter)
app.put('/api/char/npc/toggle', isAuth, isMaster, setNPC)
app.post('/api/char', isAuth, isMasterOrAdmin, saveCharacter)
app.post('/api/char/me', isAuth, saveOwnCharacter)
app.delete('/api/char/:id', isAuth, isMasterOrAdmin, deleteCharacter)
app.delete('/api/char/me/:id', isAuth, deleteOwnCharacter)

//
//  AUTH
//
app.post('/api/auth/register', isAuth, isAdmin, register)
app.post('/api/auth/login', login)
app.get('/api/auth/logout', isAuth, logout)

//
//  ACCOUNT
//
app.delete('/api/me/delete', isAuth, deleteOwnAccount)
app.delete('/api/account/delete', isAuth, isAdmin, deleteAccount)
app.put('/api/me/password', isAuth, changeOwnPassword)

app.get('/api/me', isAuth, (req, res) => {
    res.sendStatus(200)
})
app.get('/api/me/admin', isAuth, isAdmin, (req, res) => {
    res.sendStatus(200)
})
app.get('/api/me/master', isAuth, isMaster, (req, res) => {
    res.sendStatus(200)
})
app.get('/api/me/admin/master', isAuth, isMasterOrAdmin, (req, res) => {
    res.sendStatus(200)
})

//
//  ADMIN
//

app.get('/api/user', isAuth, isAdmin, getUserList)
app.put('/api/user/admin', isAuth, isAdmin, setAdmin)
app.put('/api/user/master', isAuth, isAdmin, setMaster)

//
//  INITIATIVE
//
app.put('/api/initiative', isAuth, isMaster, setPlayer)
app.get('/api/initiative', isAuth, getPlayerPlayer)
app.get('/api/initiative/master', isAuth, isMaster, getPlayerMaster)
app.get('/api/initiative/sort', isAuth, isMaster, sortPlayer)
app.put('/api/initiative/player', isAuth, isMaster, updateMaster)
app.post('/api/initiative/player', isAuth, isMaster, addMaster)
app.delete('/api/initiative/player/:id', isAuth, isMaster, deleteMaster)
app.delete('/api/initiative/player', isAuth, isMaster, deleteAllMaster)
app.put('/api/initiative/move', isAuth, isMaster, movePlayer)
app.put('/api/initiative/round', isAuth, isMaster, setRound)
app.get('/api/initiative/round', isAuth, isMaster, getRound)

//
//  MONSTER
//
app.get('/api/monster/new', isAuth, isMasterOrAdmin, createMonster)
app.get('/api/monster/list', isAuth, getMonsterList)
app.put('/api/monster', isAuth, isMasterOrAdmin, saveMonster)
app.delete('/api/monster/:id', isAuth, isMasterOrAdmin, deleteMonster)

//
//  BOOKS
//
app.get('/api/books', isAuth, getBookList)
app.use('/api/books/', isAuth, express.static('books/pdf'))

const start = async () => {
    try {
        await connectDB();
        await app.listen(port);
    } catch (e) {
        console.log(e);
    }
}

//
//  HOST REACT
//
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('build')))
    app.get('*', limiter, (req, res) => {
        res.sendFile(path.resolve('build/index.html'))
    })
}

start().then(() => {
    console.log(`Der Server wurde gestartet!`);
});


