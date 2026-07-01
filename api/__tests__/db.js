// Integration-test harness: an isolated in-memory Mongo + the real Express app.
//
// Env vars that `server.js` reads at require-time (DB_URI for the session store,
// CORS_URL, the cookie secret) must be set BEFORE the app is required, so call
// `connect()` first and only then `getApp()`.
const {MongoMemoryServer} = require('mongodb-memory-server')
const mongoose = require('mongoose')
const request = require('supertest')

let mem

const connect = async () => {
    mem = await MongoMemoryServer.create()
    const uri = mem.getUri()
    process.env.DB_URI = uri
    process.env.CORS_URL = 'http://localhost:3000'
    process.env.DND_COOKIE_SECRET = 'test-secret'
    process.env.NODE_ENV = 'test'
    await mongoose.connect(uri)
}

const getApp = () => require('../server').app

const clear = async () => {
    const collections = mongoose.connection.collections
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({})
    }
}

const disconnect = async () => {
    await mongoose.disconnect()
    if (mem) {
        await mem.stop()
    }
}

// --- user / auth helpers ---------------------------------------------------
const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')

// Create a Character document and (optionally) assign it to an owner by
// pushing its id onto the owner's `character` array.
const makeCharacter = async ({owner, character = {name: 'Hero', hp: 10, maxHp: 10}, npc = false} = {}) => {
    const doc = await Character.create({character, npc})
    if (owner) {
        owner.character.push(doc._id)
        await owner.save()
    }
    return doc
}

// Create a user directly through the model (password gets hashed by the
// pre-save hook). Roles default to a plain user.
const makeUser = async ({name, password = 'password123', master = false, admin = false}) => {
    const user = new User({name, password, master, admin})
    await user.save()
    return user
}

// Return a supertest agent that persists the session cookie after logging in.
const loginAgent = async (app, name, password = 'password123') => {
    const agent = request.agent(app)
    const res = await agent.post('/api/auth/login').send({username: name, password})
    if (res.statusCode !== 200) {
        throw new Error(`login failed for ${name}: ${res.statusCode}`)
    }
    return agent
}

module.exports = {connect, getApp, clear, disconnect, makeUser, makeCharacter, loginAgent, request}
