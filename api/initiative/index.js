const _ = require('lodash')

let master = []
let player = []
let round = 1
let turn = 0
let playerTurn = 0

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
    res.send({player: player, turn: playerTurn})
}

// get master master
// REQUIRES MASTER
const getPlayerMaster = (req, res) => {
    res.send({player: master, turn: turn})
}

// clear master
// REQUIRES MASTER
const deleteAllMaster = (req, res) => {
    master = []
    turn = 0
    player = []
    playerTurn = 0
    res.sendStatus(200)
}

// delete master
// REQUIRES MASTER
const deleteMaster = (req, res) => {
    if (master.length > 0) {
        const turnId = req.params.id
        if (turnId) {
            master = master.filter(m => Number(m.turn) !== Number(turnId))
        }
        if (turnId < turn) {
            turn -= 1
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
                    if (master[i].turnId === p.turnId) {
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
        if (Boolean(p.isTurnSet) && Number(p.turnId) > maxTurn) {
            maxTurn = p.turnId
        }
    })

    master.forEach((p, i) => {
        if (!Boolean(p.isTurnSet)) {
            p.isTurnSet = true
            p.turnId = maxTurn + i
        }
    })
}

const nextTurn = (req, res) => {
    if (master.length > 0) {
        turn += 1
        if (turn + 1 > master.length) {
            turn = 0
            round += 1
        }
        updatePlayerData()
    }
    res.sendStatus(200)
}

const prevTurn = (req, res) => {
    if (turn > 0) {
        turn -= 1
    } else {
        turn = Math.max(0, master.length - 1)
        round = Math.max(0, round - 1)
    }
    updatePlayerData()
    res.sendStatus(200)
}

const updatePlayerData = () => {
    const temp = _.cloneDeep(master)
    playerTurn = turn
    // Set whos turn it is + master to false
    for (let i = 0; i < temp.length; i++) {
        const p = temp[i]
        p.isMaster = false
        if (i === turn && Boolean(p.hidden)) {
            for (let j = 0; j < temp.length; j++) {
                const p2 = temp[(j+i) % temp.length]
                if (!Boolean(p2.hidden)) {
                    playerTurn = (turn + j) % temp.length
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
    setRound,
    nextTurn,
    prevTurn
}
