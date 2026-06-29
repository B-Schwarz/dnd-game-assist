const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')
const _ = require('lodash')
const mongoose = require('mongoose')

// Current hit points are managed on their own channel (see *CharacterHp below)
// so the initiative tracker can push HP without a bulk save clobbering it, and an
// open sheet can poll for HP changes. A bulk save must therefore preserve the
// stored current HP instead of overwriting it.
const preserveHp = async (char, charID) => {
    const existing = await Character.findOne({_id: charID})
    if (existing && existing.character) {
        char.hp = existing.character.hp
    }
    return char
}

// REQUIRES MASTER OR ADMIN
const saveCharacter = async (req, res) => {
    const char = req.body.character
    const charID = req.body.charID

    try {
        await preserveHp(char, charID)
        await Character.findOneAndUpdate({
            _id: charID
        }, {character: char})
    } catch (_) {
        return res.sendStatus(404)
    }
    res.sendStatus(200)
}

const saveOwnCharacter = async (req, res) => {
    const char = req.body.character
    const charID = req.body.charID

    if (isOwnedByUser(req.user.character, charID)) {
        try {
            await preserveHp(char, charID)
            await Character.findOneAndUpdate({
                _id: charID
            }, {character: char})

            res.sendStatus(200)
        } catch (_) {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(401)
    }
}

// ----- current HP, decoupled from the bulk character document -----

const setHp = async (charID, hp) => {
    await Character.findOneAndUpdate({_id: charID}, {$set: {'character.hp': hp}})
}

const readHp = async (charID) => {
    const char = await Character.findOne({_id: charID})
    if (!char) return null
    return {hp: char.character ? char.character.hp : undefined}
}

// REQUIRES MASTER OR ADMIN
const saveCharacterHp = async (req, res) => {
    const {charID, hp} = req.body
    if (!charID) return res.sendStatus(400)
    try {
        await setHp(charID, hp)
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(404)
    }
}

const saveOwnCharacterHp = async (req, res) => {
    const {charID, hp} = req.body
    if (!charID) return res.sendStatus(400)
    if (isOwnedByUser(req.user.character, charID)) {
        try {
            await setHp(charID, hp)
            res.sendStatus(200)
        } catch (_) {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(401)
    }
}

// REQUIRES MASTER — push current HP for many characters at once (initiative tracker).
// Invalid / non-character ids (e.g. monsters) are skipped silently.
const saveCharacterHpBulk = async (req, res) => {
    const updates = req.body.updates
    if (!Array.isArray(updates)) return res.sendStatus(400)
    await Promise.all(updates.map(async (u) => {
        if (!u || !mongoose.Types.ObjectId.isValid(u.charID)) return
        try {
            await setHp(u.charID, u.hp)
        } catch (_) {
        }
    }))
    res.sendStatus(200)
}

// REQUIRES MASTER OR ADMIN
const getCharacterHp = async (req, res) => {
    if (!req.params.id) return res.sendStatus(400)
    try {
        const hp = await readHp(req.params.id)
        hp ? res.send(hp) : res.sendStatus(404)
    } catch (_) {
        res.sendStatus(404)
    }
}

const getOwnCharacterHp = async (req, res) => {
    if (!req.params.id) return res.sendStatus(400)
    if (isOwnedByUser(req.user.character, req.params.id)) {
        try {
            const hp = await readHp(req.params.id)
            hp ? res.send(hp) : res.sendStatus(404)
        } catch (_) {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(404)
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

// REQUIRES MASTER
const setNPC = async (req, res) => {
    const charID = req.body.charID

    if (charID) {
        await Character.findOne({
            _id: mongoose.Types.ObjectId(charID)
        })
            .then((char) => {
                char.npc = !char.npc
                char.save()
            })
            .catch(() => res.sendStatus(500))

        res.sendStatus(200)
    } else {
        res.sendStatus(400)
    }
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
    const charList = await Character.find({
        _id: {
            "$nin": req.user.character
        }
    })
    res.send(filterCharacterListe(charList))
}

const getOwnCharacterList = async (req, res) => {
    let charList = []

    for (let charID of req.user.character) {
        charList.push(await Character.findOne({_id: charID}))
    }

    res.send(filterCharacterListe(charList))
}

const getNPCList = async (req, res) => {
    const charList = await Character.find({
        _id: {
            "$in": req.user.character
        },
        npc: true
    })
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
    return _.pick(char, ['_id', 'character', 'npc'])
}

const isOwnedByUser = (character, id) => {
    return (character.filter(c => c.toString() === id).length > 0)
}

module.exports = {
    saveCharacter,
    saveOwnCharacter,
    saveCharacterHp,
    saveOwnCharacterHp,
    saveCharacterHpBulk,
    getCharacterHp,
    getOwnCharacterHp,
    getCharacter,
    getOwnCharacter,
    getCharacterList,
    getOwnCharacterList,
    createCharacter,
    deleteCharacter,
    deleteOwnCharacter,
    setNPC,
    getNPCList
}
