const { User } = require('../db/models/user.model')

const login = (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if (username && password) {
        User.findByCredentials(username, password)
            .then(async (user) => {
                if (user) {

                    req.session.token = await user.generateSession()
                    console.log(req.session)
                    req.session.save()
                    res.sendStatus(200)

                } else {
                    res.sendStatus(401)
                }
            })
            .catch(() => {
                res.sendStatus(401)
            })
    } else {
        res.sendStatus(400)
    }
}

const isAuth = (req, res, next) => {
    if (req.session.token) {
        User.findOne({
            'session.token': req.session.token
        }).then(user => {
            if (user) {
                req.user = user
                next()
            } else {
                res.sendStatus(401)
            }
        })
    } else {
        res.sendStatus(401)
    }
}

module.exports = {
    login,
    isAuth
}
