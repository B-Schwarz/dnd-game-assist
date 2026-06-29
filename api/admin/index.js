const {User} = require('../db/models/user.model')
const _ = require("lodash");

// REQUIRES ADMIN
const getUserList = async (req, res) => {
    const u = await User.find()

    const filtered = []
    _.forEach(u, function (val) {
        filtered.push(_.pick(val, ['_id', 'name', 'master', 'admin', 'character']))
    })

    res.send(filtered)
}

// REQUIRES ADMIN
const setAdmin = async (req, res) => {
    const userID = req.body.userID
    const admin = req.body.admin

    await User.findOneAndUpdate({
        _id: userID
    }, {admin: admin})
        .then(() => {
            res.sendStatus(200)
        })
        .catch(() => {
            res.sendStatus(400)
        })
}

// REQUIRES ADMIN
const setMaster = async (req, res) => {
    const userID = req.body.userID
    const master = req.body.master

    await User.findOneAndUpdate({
        _id: userID
    }, {master: master})
        .then(() => {
            res.sendStatus(200)
        })
        .catch(() => {
            res.sendStatus(400)
        })
}

// Set another user's password. The User pre('save') hook hashes it.
// REQUIRES ADMIN
const setPassword = async (req, res) => {
    const userID = req.body.userID
    const password = req.body.password

    if (!userID || !password || String(password).length < 8) {
        return res.sendStatus(400)
    }

    try {
        const user = await User.findOne({_id: userID})
        if (!user) {
            return res.sendStatus(404)
        }
        user.password = password
        await user.save()
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(400)
    }
}

module.exports = {
    getUserList,
    setAdmin,
    setMaster,
    setPassword
}
