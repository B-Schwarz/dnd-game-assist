const express = require('express');
const app = express();
const {connectDB} = require('./db')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const {login, logout, isAuth, register, isMaster, isMasterOrAdmin, isAdmin} = require('./auth')
const {
    getCharacterList, getOwnCharacterList, getCharacter,
    getOwnCharacter, saveCharacter, saveOwnCharacter, createCharacter, deleteCharacter,
    deleteOwnCharacter
} = require("./character");
const {deleteOwnAccount, deleteAccount, changeOwnPassword} = require("./settings");
const {
    setPlayer, getPlayerPlayer, getPlayerMaster, sortPlayer, movePlayer,
    setRound, getRound, deleteMaster, updateMaster
} = require("./initiative");

const port = 4000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.disable('x-powered-by');

// CORS Header
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true")

    next();
});

const store = MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/dnd',
    collectionName: 'sessions'
})

const sess = session({
    name: 'dnd.sid',
    secret: 'safesecret',
    saveUninitialized: false,
    resave: true,
    store: store,
    cookie: {
        httpOnly: true,
        maxAge: 99999999999999,
        sameSite: 'lax',
        secure: false
    }
})

app.use(sess)

app.post('/api/auth/register', register)

app.post('/api/auth/login', login)

app.get('/api/auth/logout', isAuth, logout)

app.get('/api/charlist', isAuth, isMasterOrAdmin, getCharacterList)
app.get('/api/charlist/me', isAuth, getOwnCharacterList)

app.get('/api/char/new', isAuth, createCharacter)

app.get('/api/char/get/:id', isAuth, isMasterOrAdmin, getCharacter)
app.get('/api/char/me/get/:id', isAuth, getOwnCharacter)

app.post('/api/char', isAuth, isMasterOrAdmin, saveCharacter)
app.post('/api/char/me', isAuth, saveOwnCharacter)

app.delete('/api/char/:id', isAuth, isMasterOrAdmin, deleteCharacter)
app.delete('/api/char/me/:id', isAuth, deleteOwnCharacter)

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

app.put('/api/initiative', isAuth, isMaster, setPlayer)
app.get('/api/initiative', isAuth, getPlayerPlayer)
app.get('/api/initiative/master', isAuth, isMaster, getPlayerMaster)
app.get('/api/initiative/sort', isAuth, isMaster, sortPlayer)
app.put('/api/initiative/player', isAuth, isMaster, updateMaster)
app.delete('/api/initiative/player/:id', isAuth, isMaster, deleteMaster)
app.put('/api/initiative/move', isAuth, isMaster, movePlayer)
app.put('/api/initiative/round', isAuth, isMaster, setRound)
app.get('/api/initiative/round', isAuth, isMaster, getRound)

const start = async () => {
    try {
        await connectDB();
        await app.listen(port);
    } catch (e) {
        console.log(e);
    }
}

start().then(() => {
    console.log(`Der Server wurde gestartet! http://localhost:${port}`);
});


