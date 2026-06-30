import {StatusEffectsEnum} from './status-effects.enum'
import {ColorMarkerEnum} from './color-marker.enum'

// These enums are persisted as numbers on board entries and shared with the
// add-modals, so their order must stay stable.

describe('StatusEffectsEnum', () => {
    it('contains every supported condition in a stable order', () => {
        const named = Object.fromEntries(
            Object.entries(StatusEffectsEnum).filter(([, v]) => typeof v === 'number')
        )
        expect(named).toEqual({
            PRONE: 0, POISONED: 1, BLIND: 2, CHARMED: 3, DEAFENED: 4,
            FRIGHTENED: 5, GRAPPLED: 6, INCAPACITATED: 7, INVISIBLE: 8,
            PARALYZED: 9, PETRIFIED: 10, RESTRAINED: 11, STUNNED: 12,
            UNCONSCIOUS: 13, HEX: 14, HEXBLADE: 15, UNARMED: 16,
            RAGE: 17, CONCENTRATION: 18,
        })
    })
})

describe('ColorMarkerEnum', () => {
    it('runs NONE..WHITE with NONE at 0', () => {
        const named = Object.fromEntries(
            Object.entries(ColorMarkerEnum).filter(([, v]) => typeof v === 'number')
        )
        expect(named).toEqual({
            NONE: 0, BLACK: 1, GREY: 2, PURPLE: 3, RED: 4, PINK: 5,
            ORANGE: 6, YELLOW: 7, GREEN: 8, BLUE: 9, WHITE: 10,
        })
    })
})
