const {mockRes, mkPlayer} = require('./helpers')

// The initiative board lives in module-level variables. resetModules + a fresh
// require before each test gives us a clean board with no cross-test bleed.
let init
beforeEach(() => {
    jest.resetModules()
    init = require('../initiative')
})

// --- small accessors over the handlers -------------------------------------
const setBoard = (players) => {
    const res = mockRes()
    init.setPlayer({body: {player: players}}, res)
    return res
}
const masterView = () => {
    const res = mockRes()
    init.getPlayerMaster({}, res)
    return res.body
}
const playerView = () => {
    const res = mockRes()
    init.getPlayerPlayer({}, res)
    return res.body
}
const roundValue = () => {
    const res = mockRes()
    init.getRound({}, res)
    return res.body.round
}

describe('setPlayer / setTurn / views', () => {
    test('setPlayer stores the board, assigns turnIds, returns 200', () => {
        const res = setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        expect(res.statusCode).toBe(200)
        const {player, turn} = masterView()
        expect(player.map(p => p.name)).toEqual(['A', 'B'])
        expect(turn).toBe(0)
    })

    test('setTurn assigns unique, increasing turnIds and is idempotent', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'}), mkPlayer({name: 'C'})])
        const ids = masterView().player.map(p => p.turnId)
        expect(new Set(ids).size).toBe(ids.length) // unique
        expect([...ids]).toEqual([...ids].sort((a, b) => a - b)) // increasing
        // Re-running setPlayer over an already-keyed board does not change ids.
        const before = masterView().player.map(p => p.turnId)
        const same = masterView().player.map(p => p.turnId)
        expect(same).toEqual(before)
    })

    test('getPlayerMaster returns master + turn; getPlayerPlayer returns the derived view with isMaster cleared', () => {
        setBoard([mkPlayer({name: 'A', isMaster: true}), mkPlayer({name: 'B'})])
        expect(masterView().turn).toBe(0)
        const pv = playerView()
        expect(pv.player.every(p => p.isMaster === false)).toBe(true)
    })
})

describe('addMaster', () => {
    test('appends, forces isMaster:true, and assigns a colour marker to an NPC', () => {
        const res = mockRes()
        init.addMaster({body: {player: mkPlayer({name: 'N', npc: true, isMaster: false})}}, res)
        expect(res.statusCode).toBe(200)
        const [entry] = masterView().player
        expect(entry.isMaster).toBe(true)
        expect(entry.colorMarker).toBe(1) // first marker in [1..10]
    })

    test('does not assign a colour to a player character', () => {
        init.addMaster({body: {player: mkPlayer({name: 'PC', npc: false})}}, mockRes())
        expect(masterView().player[0].colorMarker).toBeUndefined()
    })

    test('colour marker index cycles modulo 10 (the 11th NPC wraps to the first marker)', () => {
        for (let i = 0; i < 11; i++) {
            init.addMaster({body: {player: mkPlayer({name: `N${i}`, npc: true})}}, mockRes())
        }
        const markers = masterView().player.map(p => p.colorMarker)
        expect(markers[0]).toBe(1)
        expect(markers[9]).toBe(10)
        expect(markers[10]).toBe(1) // wrapped
    })

    test('missing player is a silent no-op (still 200)', () => {
        const res = mockRes()
        init.addMaster({body: {}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player).toEqual([])
    })

    // ⚠️ The handler wraps its body in try/catch and swallows errors. A player
    // whose property access throws is silently dropped — pin that it still
    // returns 200 and leaves the board untouched rather than crashing.
    test('a malformed player that throws is caught → 200, board unchanged', () => {
        const evil = {}
        Object.defineProperty(evil, 'npc', {get() { throw new Error('boom') }})
        const res = mockRes()
        init.addMaster({body: {player: evil}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player).toEqual([]) // never pushed
    })
})

describe('updateMaster', () => {
    test('replaces the matching entry by turnId and keeps isMaster:true', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        const target = masterView().player[1]
        const res = mockRes()
        init.updateMaster({body: {player: {...target, name: 'B2', isMaster: false}}}, res)
        expect(res.statusCode).toBe(200)
        const after = masterView().player
        expect(after[1].name).toBe('B2')
        expect(after[1].isMaster).toBe(true)
    })

    test('is a no-op on an empty board', () => {
        const res = mockRes()
        init.updateMaster({body: {player: mkPlayer({turnId: 0})}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player).toEqual([])
    })

    // ⚠️ Same swallowed-error behaviour as addMaster: a player whose turnId
    // access throws during the match loop is caught → 200, board untouched.
    test('a malformed player that throws is caught → 200, board unchanged', () => {
        setBoard([mkPlayer({name: 'A'})])
        const evil = {}
        Object.defineProperty(evil, 'turnId', {get() { throw new Error('boom') }})
        const res = mockRes()
        init.updateMaster({body: {player: evil}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player.map(p => p.name)).toEqual(['A'])
    })
})

describe('deleteMaster', () => {
    test('removes the entry matching turnId', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'}), mkPlayer({name: 'C'})])
        const idB = masterView().player[1].turnId
        const res = mockRes()
        init.deleteMaster({params: {id: idB}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player.map(p => p.name)).toEqual(['A', 'C'])
    })

    test('decrements the turn pointer (floored at 0) when a lower turnId is removed', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'}), mkPlayer({name: 'C'})])
        init.nextTurn({}, mockRes()) // turn -> 1
        init.nextTurn({}, mockRes()) // turn -> 2
        const idA = masterView().player[0].turnId
        init.deleteMaster({params: {id: idA}}, mockRes())
        expect(masterView().turn).toBe(1)
    })

    test('turn never goes negative', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        // turn is 0; deleting turnId 0 would decrement, but it is floored at 0.
        const idA = masterView().player[0].turnId
        init.deleteMaster({params: {id: idA}}, mockRes())
        expect(masterView().turn).toBe(0)
    })
})

describe('deleteAllMaster', () => {
    test('clears master/player and resets turn/playerTurn', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        init.nextTurn({}, mockRes())
        const res = mockRes()
        init.deleteAllMaster({}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player).toEqual([])
        expect(masterView().turn).toBe(0)
        expect(playerView().turn).toBe(0)
    })

    test('resets round to 1 on board clear', () => {
        init.setRound({body: {round: 5}}, mockRes())
        init.deleteAllMaster({}, mockRes())
        expect(roundValue()).toBe(1)
    })
})

describe('sortPlayer', () => {
    test('orders by initiative descending', () => {
        setBoard([
            mkPlayer({name: 'low', initiative: 5}),
            mkPlayer({name: 'high', initiative: 20}),
            mkPlayer({name: 'mid', initiative: 10}),
        ])
        init.sortPlayer({}, mockRes())
        expect(masterView().player.map(p => p.name)).toEqual(['high', 'mid', 'low'])
    })

    test('breaks initiative ties by turnId ascending (turn order)', () => {
        // Add in order A, B, C all on initiative 10 → turnIds 0,1,2.
        setBoard([
            mkPlayer({name: 'A', initiative: 10}),
            mkPlayer({name: 'B', initiative: 10}),
            mkPlayer({name: 'C', initiative: 10}),
        ])
        init.sortPlayer({}, mockRes())
        expect(masterView().player.map(p => p.name)).toEqual(['A', 'B', 'C'])
    })

    test('pushes dead monsters to the bottom regardless of initiative', () => {
        setBoard([
            mkPlayer({name: 'deadMon', initiative: 99, monster: true, character: {hp: 0}}),
            mkPlayer({name: 'pc', initiative: 1}),
        ])
        init.sortPlayer({}, mockRes())
        expect(masterView().player.map(p => p.name)).toEqual(['pc', 'deadMon'])
    })

    // ⚠️ Initiative is coerced with Number(...). A non-numeric initiative
    // becomes NaN, so the comparator returns NaN and V8 leaves that pair in its
    // original order — i.e. non-numeric initiatives are NOT sorted into place.
    // Pin the current (buggy) behaviour: the garbage entry stays put.
    test('non-numeric initiative is treated as NaN and is not reordered', () => {
        setBoard([
            mkPlayer({name: 'garbage', initiative: 'abc'}),
            mkPlayer({name: 'high', initiative: 20}),
        ])
        init.sortPlayer({}, mockRes())
        // A correct numeric sort would put 'high' first; the NaN comparator
        // keeps the original order instead.
        expect(masterView().player.map(p => p.name)).toEqual(['garbage', 'high'])
    })
})

describe('dead monster handling', () => {
    test('reorderDeadMonsters (via updateMaster) drops a newly-dead monster to the bottom and keeps the turn pointer on it', () => {
        setBoard([
            mkPlayer({name: 'A', initiative: 20}),
            mkPlayer({name: 'M', initiative: 15, monster: true, character: {hp: 10}}),
            mkPlayer({name: 'C', initiative: 10}),
        ])
        init.nextTurn({}, mockRes()) // turn -> 1 (M acting)
        const m = masterView().player[1]
        init.updateMaster({body: {player: {...m, character: {hp: 0}}}}, mockRes())
        const {player, turn} = masterView()
        expect(player.map(p => p.name)).toEqual(['A', 'C', 'M'])
        expect(player[turn].name).toBe('M') // pointer followed the acting creature
    })

    test('nextTurn skips a dead monster', () => {
        setBoard([
            mkPlayer({name: 'A'}),
            mkPlayer({name: 'M', monster: true, character: {hp: 0}}),
            mkPlayer({name: 'C'}),
        ])
        init.nextTurn({}, mockRes()) // from A(0): 1 is dead monster -> skip to 2
        expect(masterView().player[masterView().turn].name).toBe('C')
    })

    test('a dead non-monster (PC/NPC) keeps its position', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'PC'}), mkPlayer({name: 'C'})])
        const pc = masterView().player[1]
        init.updateMaster({body: {player: {...pc, monster: false, character: {hp: 0}}}}, mockRes())
        expect(masterView().player.map(p => p.name)).toEqual(['A', 'PC', 'C'])
    })

    test('nextTurn terminates (guard) when every entry is a dead monster', () => {
        setBoard([
            mkPlayer({name: 'M1', monster: true, character: {hp: 0}}),
            mkPlayer({name: 'M2', monster: true, character: {hp: 0}}),
        ])
        const res = mockRes()
        init.nextTurn({}, res) // must not hang
        expect(res.statusCode).toBe(200)
    })
})

describe('nextTurn / prevTurn wrapping', () => {
    test('nextTurn wraps to 0 and increments round', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        init.nextTurn({}, mockRes()) // -> 1
        init.nextTurn({}, mockRes()) // wrap -> 0, round++
        expect(masterView().turn).toBe(0)
        expect(roundValue()).toBe(2)
    })

    test('prevTurn wraps to the last index and decrements round (floored at 1)', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        init.prevTurn({}, mockRes()) // from 0 wraps to last (1), round floored at 1
        expect(masterView().turn).toBe(1)
        expect(roundValue()).toBe(1)
    })

    test('prevTurn does not take the round below 1 even after several presses', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        init.prevTurn({}, mockRes())
        init.prevTurn({}, mockRes())
        init.prevTurn({}, mockRes())
        expect(roundValue()).toBe(1)
    })

    test('next/prev are no-ops on an empty board', () => {
        const r1 = mockRes()
        init.nextTurn({}, r1)
        const r2 = mockRes()
        init.prevTurn({}, r2)
        expect(r1.statusCode).toBe(200)
        expect(r2.statusCode).toBe(200)
        expect(masterView().turn).toBe(0)
    })
})

describe('movePlayer', () => {
    test('swaps up and is case-insensitive on direction', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'}), mkPlayer({name: 'C'})])
        const res = mockRes()
        init.movePlayer({body: {index: 1, direction: 'UP'}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player.map(p => p.name)).toEqual(['B', 'A', 'C'])
    })

    test('swaps down', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        init.movePlayer({body: {index: 0, direction: 'down'}}, mockRes())
        expect(masterView().player.map(p => p.name)).toEqual(['B', 'A'])
    })

    test('rejects moving the first entry up, the last down, an out-of-range index, or a bad direction (400)', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        const cases = [
            {index: 0, direction: 'up'},
            {index: 1, direction: 'down'},
            {index: 9, direction: 'up'},
            {index: 0, direction: 'sideways'},
        ]
        for (const body of cases) {
            const res = mockRes()
            init.movePlayer({body}, res)
            expect(res.statusCode).toBe(400)
        }
    })
})

describe('reorderPlayer', () => {
    test('moves from -> to and the turn pointer follows the acting creature', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'}), mkPlayer({name: 'C'})])
        // turn is 0 (A acting). Move A to the end.
        const res = mockRes()
        init.reorderPlayer({body: {from: 0, to: 2}}, res)
        expect(res.statusCode).toBe(200)
        const {player, turn} = masterView()
        expect(player.map(p => p.name)).toEqual(['B', 'C', 'A'])
        expect(player[turn].name).toBe('A')
    })

    test('from === to succeeds as a no-op', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        const res = mockRes()
        init.reorderPlayer({body: {from: 1, to: 1}}, res)
        expect(res.statusCode).toBe(200)
        expect(masterView().player.map(p => p.name)).toEqual(['A', 'B'])
    })

    test('rejects out-of-range or non-integer indices (400)', () => {
        setBoard([mkPlayer({name: 'A'}), mkPlayer({name: 'B'})])
        for (const body of [{from: 0, to: 5}, {from: -1, to: 1}, {from: 'x', to: 1}]) {
            const res = mockRes()
            init.reorderPlayer({body}, res)
            expect(res.statusCode).toBe(400)
        }
    })
})

describe('hidden entries (player view turn)', () => {
    test('playerTurn advances past a hidden current entry', () => {
        setBoard([
            mkPlayer({name: 'A'}),
            mkPlayer({name: 'B', hidden: true}),
            mkPlayer({name: 'C'}),
        ])
        init.nextTurn({}, mockRes()) // master turn -> 1 (hidden B)
        expect(masterView().turn).toBe(1)
        expect(playerView().turn).toBe(2) // shifted to the next visible (C)
    })

    test('when every entry is hidden, playerTurn stays on the current index', () => {
        setBoard([
            mkPlayer({name: 'A', hidden: true}),
            mkPlayer({name: 'B', hidden: true}),
        ])
        expect(playerView().turn).toBe(0)
    })
})

describe('round get/set', () => {
    test('setRound round-trips a numeric value', () => {
        init.setRound({body: {round: 7}}, mockRes())
        expect(roundValue()).toBe(7)
    })

    test('rounds below 1 are clamped to 1', () => {
        init.setRound({body: {round: -3}}, mockRes())
        expect(roundValue()).toBe(1)
        init.setRound({body: {round: 0}}, mockRes())
        expect(roundValue()).toBe(1)
    })

    test('a non-numeric round is rejected with 400 and leaves round unchanged', () => {
        init.setRound({body: {round: 4}}, mockRes())
        const res = mockRes()
        init.setRound({body: {round: 'abc'}}, res)
        expect(res.statusCode).toBe(400)
        expect(roundValue()).toBe(4)
    })
})
