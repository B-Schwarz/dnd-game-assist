const _ = require('lodash')

let master = []
let player = []
let round = 1

// set master
// REQUIRES MASTER
const setPlayer = (req, res) => {
    master = req.body.player
    setTurn()
    updatePlayerData()
    res.sendStatus(200)
}

// get master spieler
const getPlayerPlayer = (req, res) => {
    res.send(player)
}

// get master master
// REQUIRES MASTER
const getPlayerMaster = (req, res) => {
    res.send(master)
}

// clear master
// REQUIRES MASTER
const deleteAllMaster = (req, res) => {
    master = []
    updatePlayerData()
    res.sendStatus(200)
}

// delete master
// REQUIRES MASTER
const deleteMaster = (req, res) => {
    if (master.length > 0) {
        const p = req.params.id
        if (p) {
            master = master.filter(m => Number(m.turn) !== Number(p))
        }
    }
    updatePlayerData()
    res.sendStatus(200)
}

// update master
// REQUIRES MASTER
const updateMaster = (req, res) => {
    if (master.length > 0) {
        const p = req.body.player
        if (p) {
            try {
                for (let i = 0; i < master.length; i++) {
                    if (master[i].turn === p.turn) {
                        master[i] = p
                        master[i].isMaster = true
                        break
                    }
                }
            } catch (_) {
            }
        }
    }
    updatePlayerData()
    res.sendStatus(200)
}

// Add
// REQUIRES MASTER
const addMaster = (req, res) => {
    const p = req.body.player
    if (p) {
        try {
            p.isMaster = true

            if (master.length > 0) {
                let i = 1
                let a = false
                for (const m of master) {
                    if (m.character.name.startsWith(p.character.name) && m.character.name.endsWith(')')) {
                        i++
                        a = true
                    } else if (m.character.name === p.character.name) {
                        m.character.name += ' (' + i + ')'
                        i++
                        a = true
                    }
                }

                if (a) {
                    p.character.name += ' (' + i + ')'
                }
            }

            master.push(p)
            setTurn()
            updatePlayerData()
        } catch (_) {
        }
    }

    res.sendStatus(200)
}

// Sort
// REQUIRES MASTER
const sortPlayer = (req, res) => {
    setTurn()
    master = master.sort((f, s) => {
        if (Number(s.initiative) < Number(f.initiative) || (Number(s.initiative) === Number(f.initiative) && Number(s.turn) < Number(f.turn))) {
            return -1
        } else {
            return 1
        }
    })

    res.sendStatus(200)
}

// REQUIRES MASTER
const movePlayer = (req, res) => {
    const index = req.body.index
    const direction = req.body.direction

    try {
        if (Number(index) < master.length && Number(index) >= 0) {
            if (String(direction).toLowerCase() === 'up' && Number(index) > 0) {
                [master[index], master[index-1]] = [master[index-1], master[index]]
                updatePlayerData()
                res.sendStatus(200)
            } else if (String(direction).toLowerCase() === 'down' && Number(index) < master.length-1) {
                [master[index], master[index+1]] = [master[index+1], master[index]]
                updatePlayerData()
                res.sendStatus(200)
            } else {
                res.sendStatus(400)
            }
        } else {
            res.sendStatus(400)
        }
    } catch (_) {
    }

}

// REQUIES MASTER
const setRound = (req, res) => {
    let r = req.body.round

    try {
        r = Number(r)
        round = r
        res.sendStatus(200)
    } catch (_) {
        res.sendStatus(400)
    }
}

const getRound = (req, res) => {
    res.send({round: round})
}

const setTurn = () => {
    let maxTurn = 0
    master.forEach(p => {
        if (Boolean(p.isTurnSet) && Number(p.turn) > maxTurn) {
            maxTurn = p.turn
        }
    })

    master.forEach((p, i) => {
        if (!Boolean(p.isTurnSet)) {
            p.isTurnSet = true
            p.turn = maxTurn + i
        }
    })
}

const updatePlayerData = () => {
    const temp = _.cloneDeep(master)

    // Set whos turn it is + master to false
    for (let i = 0; i < temp.length; i++) {
        const p = temp[i]
        p.isMaster = false
        if (Boolean(p.isTurn) && Boolean(p.hidden)) {
            p.isTurn = false
            for (let j = 0; j < temp.length; j++) {
                const p2 = temp[(j+i) % temp.length]
                if (!Boolean(p2.hidden)) {
                    p2.isTurn = true
                    break
                }
            }
        }
    }
    player = _.cloneDeep(temp)
}

module.exports = {
    setPlayer,
    sortPlayer,
    getPlayerMaster,
    getPlayerPlayer,
    addMaster,
    updateMaster,
    deleteMaster,
    deleteAllMaster,
    movePlayer,
    getRound,
    setRound
}
