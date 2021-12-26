const _ = require('lodash')

let master = []
let player = []
let round = 0

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
const getPlayerMaster = (req, res) => {
    res.send(master)
}

// delete master
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
const updateMaster = (req, res) => {
    if (master.length > 0) {
        const p = req.body.player
        if (p) {
            for (let i = 0; i < master.length; i++) {
                if (master[i].turn === p.turn) {
                    master[i] = p
                    master[i].isMaster = true
                    break
                }
            }
        }
    }
    updatePlayerData()
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

// REQUIRES MASTER
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
    updateMaster,
    deleteMaster,
    movePlayer,
    getRound,
    setRound
}
