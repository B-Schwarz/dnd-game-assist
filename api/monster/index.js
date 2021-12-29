const _ = require("lodash");
const {Monster} = require("../db/models/monster.model");
const {Character} = require("../db/models/character.model");

// REQUIRES MASTER OR ADMIN
const createMonster = async (req, res) => {
    await Monster.create({})

    res.sendStatus(200)
}

// REQUIRES MASTER OR ADMIN
const saveMonster = async (req, res) => {
    const monster = req.body.monster
    const charID = req.body.charID

    try {
        await Monster.findOneAndUpdate({
            _id: charID
        }, {monster: monster})
    } catch (_) {
        res.sendStatus(404)
    }
    res.sendStatus(200)
}

const getMonsterList = async (req, res) => {
    const monList = await Monster.find()
    res.send(filterMonsterListe(monList))
}

// REQUIRES MASTER OR ADMIN
const deleteMonster = async (req, res) => {
    const charID = req.params.id

    Monster.deleteOne({_id: charID}, () => {
    })

    res.sendStatus(200)
}

//
//  HELPER
//

const filterMonsterListe = (liste) => {
    return _.map(liste, (item) => {
        return filterMonster(item)
    })
}

const filterMonster = (char) => {
    return _.omit(char.toObject(), ['__v'])
}

module.exports = {
    createMonster,
    getMonsterList,
    deleteMonster,
    saveMonster
}
