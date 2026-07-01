import {newEncounterRow, removeMonsterAt} from './encounter.utils'
import {EncounterType} from './encounter.type'
import {Monster} from '../monster/monster.type'

const monster = (id: string, name: string): Monster => ({
    _id: id,
    // only `name` is read by the helper; the rest of the shape is irrelevant here
    monster: {name} as Monster['monster'],
})

const monsterList = [monster('m1', 'Goblin'), monster('m2', 'Orc')]

describe('newEncounterRow', () => {
    // Regression: a freshly added row must carry the resolved name so it shows
    // immediately instead of only after the next save/reload (Bugs.md,
    // Encounter #1) — including when the row is hidden.
    it('resolves the monster name from the list', () => {
        expect(newEncounterRow('m1', monsterList, false, 3)).toEqual({
            monster: 'm1', name: 'Goblin', hidden: false, amount: 3,
        })
    })

    it('keeps the name even for a hidden row', () => {
        expect(newEncounterRow('m2', monsterList, true, 1)).toEqual({
            monster: 'm2', name: 'Orc', hidden: true, amount: 1,
        })
    })

    it('falls back to an empty name for an unknown id', () => {
        expect(newEncounterRow('nope', monsterList, false, 1).name).toBe('')
    })
})

describe('removeMonsterAt', () => {
    const encounter: EncounterType = {
        _id: 'e', name: 'Ambush',
        encounter: [
            {monster: 'm1', name: 'Goblin', hidden: false, amount: 1},
            {monster: 'm2', name: 'Orc', hidden: false, amount: 1},
            {monster: 'm3', name: 'Ogre', hidden: false, amount: 1},
        ],
    }

    // Regression: deleting must rebuild the rows array (new state → re-render)
    // rather than mutating in place, so no stale row is left behind (Bugs.md,
    // Encounter #2).
    it('removes the row at the given index', () => {
        const out = removeMonsterAt(encounter, 1)
        expect(out.encounter.map(e => e.monster)).toEqual(['m1', 'm3'])
    })

    it('returns a new object and does not mutate the source', () => {
        const before = encounter.encounter.length
        const out = removeMonsterAt(encounter, 0)
        expect(out).not.toBe(encounter)
        expect(out.encounter).not.toBe(encounter.encounter)
        expect(encounter.encounter).toHaveLength(before)
    })

    it('removing every row in turn leaves nothing behind', () => {
        let e = encounter
        e = removeMonsterAt(e, 0)
        e = removeMonsterAt(e, 0)
        e = removeMonsterAt(e, 0)
        expect(e.encounter).toEqual([])
    })
})
