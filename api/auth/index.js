const { User } = require('../db/models/user.model')

const login = (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if (username && password) {
        User.findByCredentials(username, password)
            .then(async (user) => {
                if (user) {

                    req.session.token = await user.generateSession()

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

const register = async (req, res) => {
    if (req.body.username && req.body.password) {
        let newUser = new User({
            name: req.body.username,
            password: req.body.password,
            master: false,
            admin: false
        })
        await newUser.save()
            .then(() => {
                res.sendStatus(200)
            })
            .catch((e) => {
                console.log(e)
                res.sendStatus(400)
            })
    } else {
        res.sendStatus(400)
    }
}

const logout = async (req, res) => {
    await User.updateOne({_id: req.user._id}, {
        $pull: {
            session: {token: req.session.token}
        }
    })
    await req.user.save()

    req.session.destroy()
    res.sendStatus(200)
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
    logout,
    register,
    isAuth
}
