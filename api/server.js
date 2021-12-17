const express = require('express');
const app = express();
const {connectDB} = require('./db')
const {mongoose} = require('mongoose')
const {Character} = require('./db/models/character.model')
const {User} = require('./db/models/user.model')
const {login, isAuth} = require('./auth')

const session = require('express-session')
const MongoStore = require('connect-mongo')
const {isMaster, getCharacterList, getOwnCharacterList} = require("./character");

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

app.post('/api/auth/register', async (req, res) => {
    if (req.body.username && req.body.password) {
        let newUser = new User({
            name: req.body.username,
            password: req.body.password,
            master: false,
            admin: false
        })
        await newUser.save()
            .catch(() => {
                res.sendStatus(400)
            })
            .then(() => {
                res.sendStatus(200)
            })
    } else {
        res.sendStatus(400)
    }
})

app.post('/api/auth/login', login)

app.get('/api/auth/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

app.get('/api/charlist', isAuth, isMaster, getCharacterList)
app.get('/api/charlist/me', isAuth, getOwnCharacterList)

app.post('/api/test', isAuth, async (req, res) => {
    const newChar = new Character();
    newChar.character = req.body.character
    await newChar.save()
    req.user.character.push(newChar._id)
    req.user.save()
    res.sendStatus(200)
})

app.get('/api/test', isAuth, async (req, res) => {
    console.log(req.user)
    if (req.user.character[0]) {
        // const char = await Character.findOne({
        //     _id: req.user.character[0]
        // })
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

app.get('/api/auth/debug', (req, res) => {
    res.send('<h1>Hello</h1>')
})

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


