const { User } = require('../db/models/user.model')
const { Character } = require('../db/models/character.model')
const _ = require('lodash')

const saveCharacter = async (req, res) => {
    const newChar = new Character();
    newChar.character = req.body.character
    await newChar.save()
    req.user.character.push(newChar._id)
    req.user.save()
    res.sendStatus(200)
}

// REQUIRES MASTER
const getCharacter = async (req, res) => {
    if (req.body.characterid) {
        const char = await Character.findOne({
            _id: req.body.characterid
        })

        if (char) {
            res.send(char)
        } else {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(400)
    }
}

const getOwnCharacter = async (req, res) => {
    if (req.body.characterid) {
        if (req.user.character.filter(c => c === req.body.characterid).length > 0) {
            const char = await Character.findOne({
                _id: req.body.characterid
            })

            if (char) {
                res.send(char)
            } else {
                res.sendStatus(404)
            }
        } else {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(400)
    }
}

// REQUIRES MASTER
const getCharacterList = async (req, res) => {
    const charList = await Character.find()
    res.send(filterCharacter(charList))
}

const getOwnCharacterList = async (req, res) => {
    let charList = []

    for (let charID of req.user.character) {
        charList.push(await Character.findOne({_id: charID}))
    }

    res.send(filterCharacter(charList))
}

const filterCharacter = (liste) => {
    return _.map(liste, (item) => {
        return _.pick(item, ['character'])
    })
}

const isMaster = (req, res, next) => {
    if (req.user.master || req.user.admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}

module.exports = {
    saveCharacter,
    getCharacter,
    getOwnCharacter,
    getCharacterList,
    getOwnCharacterList,
    isMaster
}
