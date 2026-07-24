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
        return
    }
    res.sendStatus(200)
}

const getMonsterList = async (req, res) => {
    const monList = await Monster.find().sort({'monster.name': 1})
    res.send(filterMonsterListe(monList))
}

// Lean list for the initiative "add monster" modal and the encounter monster
// picker: those only read the name + combat subset (monsterToCharacter) and a
// name search. The full doc carries long text blobs (actions, senses,
// languages, …) that made 400 monsters a heavy payload. Project at the DB so
// the weight never leaves Mongo. The editor still uses the full /list.
const getMonsterListLean = async (req, res) => {
    const monList = await Monster.find({}, {
        'monster.name': 1, 'monster.ac': 1, 'monster.hp': 1,
        'monster.speed': 1, 'monster.stats.dex': 1, 'monster.saving': 1
    }).sort({'monster.name': 1})
    res.send(monList)
}

// REQUIRES MASTER OR ADMIN
const deleteMonster = async (req, res) => {
    const charID = req.params.id

    await Monster.deleteOne({_id: charID})

    res.sendStatus(200)
}

const getMonster = async (req, res) => {
    const charID = req.params.id

    const monster = await Monster.findOne({_id: charID})
    res.send(monster)
}

//
//  HELPER
//

const filterMonsterListe = (liste) => {
    return liste.map((item) => filterMonster(item))
}

const filterMonster = (char) => {
    const {__v, ...rest} = char.toObject()
    return rest
}

module.exports = {
    createMonster,
    getMonsterList,
    getMonsterListLean,
    deleteMonster,
    saveMonster,
    getMonster
}
