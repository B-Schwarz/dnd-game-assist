const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')

const deleteOwnAccount = async (req, res) => {
    const chars = req.user.character

    if (chars.length > 0) {
        await Character.deleteMany({
            _id: {
                $in: chars
            }
        }, () => {
        }).catch(() => {
        })
    }


    await User.deleteOne({_id: req.user._id}, () => {
    }).catch(() => {})
    req.session.destroy()

    res.sendStatus(200)
}

// REQUIRES ADMIN
const deleteAccount = async (req, res) => {
    const userID = req.body.userID

    if (userID) {
        try {
            const user = await User.findOne({_id: userID})

            const chars = user.character

            if (chars.length > 0) {
                await Character.deleteMany({
                    _id: {
                        $in: chars
                    }
                }, () => {
                }).catch(() => {})
            }

            await User.deleteOne({_id: userID}, () => {
            }).catch(() => {})

            res.sendStatus(200)
        } catch (_) {
            res.sendStatus(500)
        }
    } else {
        res.sendStatus(400)
    }
}

module.exports = {
    deleteOwnAccount,
    deleteAccount
}
