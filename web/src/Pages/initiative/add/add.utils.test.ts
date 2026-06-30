import {
    abilityModifier,
    applyHidden,
    buildEncounterInstances,
    colorToMarker,
    filterByName,
    npcEntries,
    playableEntries,
    rollD20,
} from './add.utils'
import {Color} from '../../character-sheet/sheet/dnd-character'

const char = (name: string) => ({character: {name}})

describe('filterByName', () => {
    const list = [char('Goblin'), char('Goblin Boss'), char('Orc')]

    it('filters case-insensitively', () => {
        expect(filterByName(list, 'gob').map(c => c.character.name)).toEqual(['Goblin', 'Goblin Boss'])
        expect(filterByName(list, 'ORC').map(c => c.character.name)).toEqual(['Orc'])
    })

    it('returns the full list for an empty query', () => {
        expect(filterByName(list, '')).toHaveLength(3)
    })

    it('does not mutate the source list', () => {
        const copy = [...list]
        filterByName(list, 'orc')
        expect(list).toEqual(copy)
    })

    it('tolerates entries without a name', () => {
        expect(filterByName([{character: {}}], 'x')).toEqual([])
    })
})

describe('rollD20', () => {
    it('is Math.floor(random*20) → 0..19', () => {
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.95)
        expect(rollD20()).toBe(19)
        spy.mockReturnValue(0)
        expect(rollD20()).toBe(0)
        spy.mockRestore()
    })
})

describe('abilityModifier', () => {
    it('computes the 5e modifier', () => {
        expect(abilityModifier('14')).toBe(2)
        expect(abilityModifier('10')).toBe(0)
        expect(abilityModifier('8')).toBe(-1)
        expect(abilityModifier(20)).toBe(5)
    })

    it('is NaN for non-numeric dex (callers apply `|| 0`)', () => {
        expect(Number.isNaN(abilityModifier('abc'))).toBe(true)
        expect(abilityModifier('abc') || 0).toBe(0)
    })
})

describe('colorToMarker', () => {
    it('maps a character colour onto a marker number', () => {
        expect(colorToMarker(Color.RED)).toBe(Color.RED)
        expect(colorToMarker('3')).toBe(3)
    })
})

describe('playableEntries / npcEntries', () => {
    const raw = [
        {character: {name: 'Hero'}, _id: 'a', npc: false},
        {character: {name: 'Goblin'}, _id: 'b', npc: true},
    ]

    it('playableEntries keeps only non-NPC characters', () => {
        const out = playableEntries(raw)
        expect(out.map(p => p.id)).toEqual(['a'])
        expect(out[0].isMaster).toBe(false)
        expect(out[0].initiative).toBe(0)
    })

    it('npcEntries keeps only NPCs and flags them', () => {
        const out = npcEntries(raw)
        expect(out.map(p => p.id)).toEqual(['b'])
        expect(out[0].npc).toBe(true)
        expect(out[0].hidden).toBe(false)
    })
})

describe('applyHidden', () => {
    it('stamps the hidden flag onto an entry', () => {
        const entry = {hidden: false}
        expect(applyHidden(entry, true).hidden).toBe(true)
        expect(entry.hidden).toBe(true)
    })
})

describe('buildEncounterInstances', () => {
    const encounter: any = {
        _id: 'e', name: 'Ambush',
        encounter: [
            {monster: 'm1', amount: 2, hidden: false, data: {character: {name: 'Goblin', dex: '14'}, initiative: 0}},
        ],
    }

    it('creates one entry per monster per amount', () => {
        const out = buildEncounterInstances(encounter, () => 5)
        expect(out).toHaveLength(2)
    })

    it('rolls initiative independently per instance (deep-cloned, not shared)', () => {
        let n = 0
        const out = buildEncounterInstances(encounter, () => (n++ === 0 ? 3 : 10))
        // dexMod for 14 = +2, so initiatives are 5 and 12
        expect(out[0].initiative).toBe(5)
        expect(out[1].initiative).toBe(12)
        expect(out[0]).not.toBe(out[1]) // distinct objects
    })

    it('adds nothing when amount is 0', () => {
        const zero: any = {...encounter, encounter: [{...encounter.encounter[0], amount: 0}]}
        expect(buildEncounterInstances(zero)).toEqual([])
    })
})
