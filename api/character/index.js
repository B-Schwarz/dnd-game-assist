const {User} = require('../db/models/user.model')
const {Character} = require('../db/models/character.model')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

// ----- backstory document attachment (one file per character) --------------
// Files are stored on disk under attachments/<charID>; only the metadata
// (original name + mime) is kept on the Character document. Storing the file
// out-of-band keeps large uploads clear of MongoDB's 16 MB document limit.
const ATTACH_DIR = path.resolve('attachments')
if (!fs.existsSync(ATTACH_DIR)) {
    fs.mkdirSync(ATTACH_DIR, {recursive: true})
}

const ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
])
const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.txt']

const attachUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, ATTACH_DIR),
        // one attachment per character, named by its (validated) id
        filename: (req, file, cb) => cb(null, path.basename(req.params.id))
    }),
    limits: {fileSize: 100 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.includes(ext))
    }
})

const attachmentPath = (id) => path.join(ATTACH_DIR, path.basename(id))

const removeAttachmentFile = (id) => {
    try {
        const p = attachmentPath(id)
        if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch (_) {
    }
}

// Guard middlewares (run before multer so an unauthorized upload never touches
// disk): reject a malformed id, and — for the /me routes — enforce ownership.
const validCharParam = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.sendStatus(400)
    next()
}

const requireOwnChar = (req, res, next) => {
    if (!isOwnedByUser(req.user.character, req.params.id)) return res.sendStatus(401)
    next()
}

// Role/ownership are enforced by the route middleware, so a single handler
// serves both the privileged and the self-scoped route of each pair.
const uploadAttachment = async (req, res) => {
    if (!req.file) return res.sendStatus(400)
    try {
        const updated = await Character.findByIdAndUpdate(req.params.id, {
            attachment: {name: req.file.originalname, mime: req.file.mimetype}
        })
        if (!updated) {
            removeAttachmentFile(req.params.id) // no such character — drop the orphan file
            return res.sendStatus(404)
        }
        res.sendStatus(200)
    } catch (_) {
        removeAttachmentFile(req.params.id)
        res.sendStatus(404)
    }
}

const getAttachment = async (req, res) => {
    try {
        const char = await Character.findById(req.params.id)
        if (!char || !char.attachment || !char.attachment.name) return res.sendStatus(404)
        const filePath = attachmentPath(req.params.id)
        if (!fs.existsSync(filePath)) return res.sendStatus(404)
        const safeName = char.attachment.name.replace(/["\r\n]/g, '')
        res.setHeader('Content-Type', char.attachment.mime || 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
        res.sendFile(filePath)
    } catch (_) {
        res.sendStatus(404)
    }
}

const deleteAttachment = async (req, res) => {
    try {
        const char = await Character.findById(req.params.id)
        if (!char) return res.sendStatus(404)
        removeAttachmentFile(req.params.id)
        char.attachment = undefined
        await char.save()
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(404)
    }
}

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

    if (!charID) {
        return res.sendStatus(400)
    }

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

    if (!charID) {
        return res.sendStatus(400)
    }

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

    if (!charID) {
        return res.sendStatus(400)
    }

    try {
        const char = await Character.findById(charID)
        if (!char) {
            return res.sendStatus(404)
        }
        char.npc = !char.npc
        await char.save()
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(404)
    }
}

// REQUIRES MASTER OR ADMIN — flag/unflag a character as a "primary" (main party)
// character. Primaries are listed first when adding players to the initiative.
const setPrimary = async (req, res) => {
    const charID = req.body.charID

    if (!charID) {
        return res.sendStatus(400)
    }

    try {
        const char = await Character.findById(charID)
        if (!char) {
            return res.sendStatus(404)
        }
        char.primary = !char.primary
        await char.save()
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(404)
    }
}

// Self-scoped variant: a player marks one of their OWN characters as a primary
// (main party) character from the character sheet. Ownership is enforced.
const setOwnPrimary = async (req, res) => {
    const charID = req.body.charID

    if (!charID) {
        return res.sendStatus(400)
    }

    if (!isOwnedByUser(req.user.character, charID)) {
        return res.sendStatus(401)
    }

    try {
        const char = await Character.findById(charID)
        if (!char) {
            return res.sendStatus(404)
        }
        char.primary = !char.primary
        await char.save()
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(404)
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

    await User.updateOne({character: new mongoose.Types.ObjectId(charID)}, {
        $pullAll: {
            character: [new mongoose.Types.ObjectId(charID)]
        }
    })

    await Character.deleteOne({_id: charID})
    removeAttachmentFile(charID)

    res.sendStatus(200)
}

const deleteOwnCharacter = async (req, res) => {
    const charID = req.params.id

    await User.updateOne({_id: req.user._id, character: new mongoose.Types.ObjectId(charID)}, {
        $pullAll: {
            character: [new mongoose.Types.ObjectId(charID)]
        }
    })

    await Character.deleteOne({_id: charID})
    removeAttachmentFile(charID)

    res.sendStatus(200)
}

// List views only render a small slice of the sheet. Shipping the whole opaque
// `character` here drags along `appearance` — a base64 image data URL up to
// 2 MB per character — which bloated /api/charlist and, once added, every
// initiative board poll. Trim to the fields the list actually reads: the
// combat subset the initiative board uses (see CLAUDE.md) plus the columns the
// character-list page shows (classLevel/race/level/playerName).
const LIST_CHAR_FIELDS = [
    'name', 'ac', 'hp', 'maxHp', 'tempHp', 'dex', 'speed', 'color',
    'strSave', 'dexSave', 'conSave', 'intSave', 'wisSave', 'chaSave',
    'classLevel', 'race', 'level', 'playerName'
]
const trimCharacter = (character) => {
    const out = {}
    for (const k of LIST_CHAR_FIELDS) if (character && k in character) out[k] = character[k]
    return out
}
const filterCharacterListe = (liste) => {
    return liste.map((item) => ({
        _id: item._id, character: trimCharacter(item.character), npc: item.npc, primary: item.primary
    }))
}

const filterCharacter = (char) => {
    return {
        _id: char._id, character: char.character, npc: char.npc,
        primary: char.primary, attachment: char.attachment
    }
}

const isOwnedByUser = (character, id) => {
    return (character.filter(c => c.toString() === id).length > 0)
}

// Export every character with its current owner (ownership lives in the user's
// `character` array). Shape is import-friendly.
// REQUIRES ADMIN
const exportCharacters = async (req, res) => {
    try {
        const chars = await Character.find()
        const users = await User.find({}, {name: 1, character: 1})

        const ownerByChar = {}
        users.forEach((u) => {
            (u.character || []).forEach((cid) => {
                ownerByChar[cid.toString()] = {userID: u._id, name: u.name}
            })
        })

        const out = chars.map((c) => ({
            _id: c._id,
            character: c.character,
            npc: c.npc,
            primary: c.primary,
            owner: ownerByChar[c._id.toString()] || null
        }))

        res.send(out)
    } catch (_) {
        res.sendStatus(500)
    }
}

// Import characters from an exported list. Each character is recreated as a
// new, unowned document; an admin assigns owners afterwards via reassign.
// REQUIRES ADMIN
const importCharacters = async (req, res) => {
    const list = req.body.characters

    if (!Array.isArray(list)) {
        return res.sendStatus(400)
    }

    try {
        let created = 0
        for (const item of list) {
            if (item && item.character) {
                await Character.create({character: item.character, npc: Boolean(item.npc), primary: Boolean(item.primary)})
                created += 1
            }
        }
        res.send({created})
    } catch (_) {
        res.sendStatus(400)
    }
}

// Move a character to another user: pull it from any current owner, then add
// it to the target user.
// REQUIRES ADMIN
const reassignCharacter = async (req, res) => {
    const charID = req.body.charID
    const toUserID = req.body.toUserID

    if (!charID || !toUserID) {
        return res.sendStatus(400)
    }

    try {
        const char = await Character.findOne({_id: charID})
        const target = await User.findOne({_id: toUserID})
        if (!char || !target) {
            return res.sendStatus(404)
        }
        if (char.npc) {
            return res.sendStatus(400)
        }

        await User.updateMany(
            {character: new mongoose.Types.ObjectId(charID)},
            {$pull: {character: new mongoose.Types.ObjectId(charID)}}
        )
        await User.updateOne(
            {_id: toUserID},
            {$addToSet: {character: new mongoose.Types.ObjectId(charID)}}
        )

        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(400)
    }
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
    setPrimary,
    setOwnPrimary,
    getNPCList,
    exportCharacters,
    importCharacters,
    reassignCharacter,
    attachUpload,
    validCharParam,
    requireOwnChar,
    uploadAttachment,
    getAttachment,
    deleteAttachment
}
