const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')
const _ = require('lodash')
const mongoose = require('mongoose')

// REQUIRES MASTER OR ADMIN
const saveCharacter = async (req, res) => {
    const char = req.body.character
    const charID = req.body.charID

    await Character.findOneAndUpdate({
        _id: charID
    }, {character: char})

    res.sendStatus(200)
}

const saveOwnCharacter = async (req, res) => {
    const char = req.body.character
    const charID = req.body.charID

    if (isOwnedByUser(req.user.character, charID)) {
        await Character.findOneAndUpdate({
            _id: charID
        }, {character: char})

        res.sendStatus(200)
    } else {
        res.sendStatus(401)
    }
}

const createCharacter = async (req, res) => {
    const char = await Character.create({
        character: {
            name: ''
        }
    })

    req.user.character.push(char._id)
    req.user.save()

    res.send({id: char._id})
}

// REQUIRES MASTER OR ADMIN
const getCharacter = async (req, res) => {
    if (req.params.id) {
        try {
            const char = await Character.findOne({
                _id: req.params.id
            })

            if (char) {
                res.send(filterCharacter(char))
            } else {
                res.sendStatus(404)
            }
        } catch (_) {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(400)
    }
}

const getOwnCharacter = async (req, res) => {
    if (req.params.id) {
        if (isOwnedByUser(req.user.character, req.params.id)) {
            try {
                const char = await Character.findOne({
                    _id: req.params.id
                })

                if (char) {
                    res.send(filterCharacter(char))
                } else {
                    res.sendStatus(404)
                }
            } catch (_) {
                res.sendStatus(404)
            }
        } else {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(400)
    }
}

// REQUIRES MASTER OR ADMIN
const getCharacterList = async (req, res) => {
    const charList = await Character.find()
    res.send(filterCharacterListe(charList))
}

const getOwnCharacterList = async (req, res) => {
    let charList = []

    for (let charID of req.user.character) {
        charList.push(await Character.findOne({_id: charID}))
    }

    res.send(filterCharacterListe(charList))
}

// REQUIRES MASTER OR ADMIN
const deleteCharacter = async (req, res) => {
    const charID = req.params.id

    User.updateOne({character: mongoose.Types.ObjectId(charID)}, {
        $pullAll: {
            character: [mongoose.Types.ObjectId(charID)]
        }
    }, () => {
    })

    Character.deleteOne({_id: charID}, () => {
    })

    res.sendStatus(200)
}

const deleteOwnCharacter = async (req, res) => {
    const charID = req.params.id

    User.updateOne({_id: req.user._id, character: mongoose.Types.ObjectId(charID)}, {
        $pullAll: {
            character: [mongoose.Types.ObjectId(charID)]
        }
    }, () => {
    })

    Character.deleteOne({_id: charID}, () => {
    })

    res.sendStatus(200)
}

const filterCharacterListe = (liste) => {
    return _.map(liste, (item) => {
        return filterCharacter(item)
    })
}

const filterCharacter = (char) => {
    return _.pick(char, ['_id', 'character'])
}

const isOwnedByUser = (character, id) => {
    return (character.filter(c => c.toString() === id).length > 0)
}

const isMaster = (req, res, next) => {
    if (req.user.master) {
        next()
    } else {
        res.sendStatus(401)
    }
}

const isAdmin = (req, res, next) => {
    if (req.user.admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}

const isMasterOrAdmin = (req, res, next) => {
    if (req.user.master || req.user.admin) {
        next()
    } else {
        res.sendStatus(401)
    }
}

module.exports = {
    saveCharacter,
    saveOwnCharacter,
    getCharacter,
    getOwnCharacter,
    getCharacterList,
    getOwnCharacterList,
    createCharacter,
    deleteCharacter,
    deleteOwnCharacter,
    isMaster,
    isAdmin,
    isMasterOrAdmin
}
