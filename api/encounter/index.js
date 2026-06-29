const _ = require("lodash");
const {Monster} = require("../db/models/monster.model");
const {Encounter} = require("../db/models/encounter.model");
const mongoose = require("mongoose");

// REQUIRES MASTER OR ADMIN
const createEncounter = async (req, res) => {
    await Encounter.create({
        name: 'New Encounter',
        encounter: [],
        user: req.user._id
    })

    res.sendStatus(200)
}

// REQUIRES MASTER OR ADMIN
const saveEncounter = async (req, res) => {
    const encounter = req.body.encounter
    const encounterID = req.body.encounterID
    const name = req.body.name

    Encounter.findOneAndUpdate({
        _id: encounterID
    }, {
        "encounter": encounter.encounter,
        "name": name
    })
        .then((encounter) => {res.sendStatus(200)})
        .catch((_) => {res.sendStatus(400)});
}

const getEncounterList = async (req, res) => {
    const encounterList = await Encounter.find({user: req.user._id})
    res.send(encounterList)
}

// REQUIRES MASTER OR ADMIN
const deleteEncounter = async (req, res) => {
    const encounterID = req.params.id

    try {
        // Scope the delete to the requester so a master cannot remove
        // another user's encounter (encounters are per-user, see getEncounterList).
        const result = await Encounter.deleteOne({_id: encounterID, user: req.user._id})
        res.sendStatus(result.deletedCount > 0 ? 200 : 404)
    } catch (_) {
        res.sendStatus(404)
    }
}

module.exports = {
    createEncounter,
    getEncounterList,
    deleteEncounter,
    saveEncounter
}
