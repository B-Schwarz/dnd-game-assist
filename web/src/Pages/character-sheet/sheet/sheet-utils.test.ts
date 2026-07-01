import {Color} from './dnd-character'
import {
    abilityModifierValue,
    COLOR_HEX,
    contrastInk,
    formatModifier,
    hpPercent,
    withProficiency,
} from './sheet-utils'

describe('abilityModifierValue', () => {
    it('computes the 5e ability modifier', () => {
        expect(abilityModifierValue('10')).toBe(0)
        expect(abilityModifierValue('11')).toBe(0) // floor((11-10)/2)
        expect(abilityModifierValue('12')).toBe(1)
        expect(abilityModifierValue('20')).toBe(5)
        expect(abilityModifierValue('1')).toBe(-5) // floor((1-10)/2)
        expect(abilityModifierValue('8')).toBe(-1)
    })

    it('accepts numbers as well as strings', () => {
        expect(abilityModifierValue(14)).toBe(2)
    })

    it('returns null for missing or non-numeric input', () => {
        expect(abilityModifierValue(undefined)).toBeNull()
        expect(abilityModifierValue('')).toBeNull()
        expect(abilityModifierValue('abc')).toBeNull()
    })
})

describe('formatModifier', () => {
    it('prefixes non-negative modifiers with +', () => {
        expect(formatModifier('10')).toBe('+0')
        expect(formatModifier('14')).toBe('+2')
        expect(formatModifier('20')).toBe('+5')
    })

    it('keeps the minus sign for negative modifiers', () => {
        expect(formatModifier('8')).toBe('-1')
        expect(formatModifier('1')).toBe('-5')
    })

    it('returns empty string when the score is invalid', () => {
        expect(formatModifier('')).toBe('')
        expect(formatModifier(undefined)).toBe('')
        expect(formatModifier('nope')).toBe('')
    })
})

describe('withProficiency', () => {
    const pb = 3

    it('returns the base unchanged when not proficient', () => {
        expect(withProficiency(2, undefined, pb)).toBe(2)
        expect(withProficiency(2, 'none', pb)).toBe(2)
    })

    it('adds the proficiency bonus once when proficient', () => {
        expect(withProficiency(2, 'normal', pb)).toBe(5)
    })

    it('adds the proficiency bonus twice for expertise', () => {
        expect(withProficiency(2, 'expert', pb)).toBe(8)
    })

    it('works with a negative base', () => {
        expect(withProficiency(-1, 'normal', pb)).toBe(2)
    })
})

describe('hpPercent', () => {
    it('returns the ratio of current to max HP as a percentage', () => {
        expect(hpPercent('5', '10')).toBe(50)
        expect(hpPercent('10', '10')).toBe(100)
        expect(hpPercent(3, 12)).toBe(25)
    })

    it('clamps to the 0..100 range', () => {
        expect(hpPercent('15', '10')).toBe(100) // overhealed
        expect(hpPercent('-5', '10')).toBe(0)   // below zero
    })

    it('returns 0 when max HP is missing or zero', () => {
        expect(hpPercent('5', '0')).toBe(0)
        expect(hpPercent('5', '')).toBe(0)
        expect(hpPercent('5', undefined)).toBe(0)
    })

    it('returns 0 when current HP is not a number', () => {
        expect(hpPercent('abc', '10')).toBe(0)
    })
})

describe('contrastInk', () => {
    it('returns white ink for dark backgrounds', () => {
        expect(contrastInk('#000000')).toBe('#fff')
        expect(contrastInk('#2980b9')).toBe('#fff') // blue
    })

    it('returns black ink for light backgrounds', () => {
        expect(contrastInk('#ffffff')).toBe('#000')
        expect(contrastInk('#f1c40f')).toBe('#000') // yellow
    })

    it('returns empty string for an empty hex', () => {
        expect(contrastInk('')).toBe('')
    })
})

describe('COLOR_HEX', () => {
    it('maps NONE to an empty string so the picker stays neutral', () => {
        expect(COLOR_HEX[Color.NONE]).toBe('')
    })

    it('provides a hex value for every concrete colour', () => {
        const concrete = [
            Color.BLACK, Color.GREY, Color.PURPLE, Color.RED, Color.PINK,
            Color.ORANGE, Color.YELLOW, Color.GREEN, Color.BLUE, Color.WHITE,
        ]
        concrete.forEach((c) => {
            expect(COLOR_HEX[c]).toMatch(/^#[0-9a-f]{6}$/)
        })
    })

    it('pairs each colour with a readable ink', () => {
        // every concrete colour should yield a defined contrast ink
        expect(contrastInk(COLOR_HEX[Color.BLACK])).toBe('#fff')
        expect(contrastInk(COLOR_HEX[Color.WHITE])).toBe('#000')
    })
})

describe('Color enum shape', () => {
    it('keeps NONE at 0 so an unset colour is falsy/neutral', () => {
        expect(Color.NONE).toBe(0)
    })

    it('has a stable order (persisted as numbers in stored characters)', () => {
        expect({
            NONE: Color.NONE,
            BLACK: Color.BLACK,
            GREY: Color.GREY,
            PURPLE: Color.PURPLE,
            RED: Color.RED,
            PINK: Color.PINK,
            ORANGE: Color.ORANGE,
            YELLOW: Color.YELLOW,
            GREEN: Color.GREEN,
            BLUE: Color.BLUE,
            WHITE: Color.WHITE,
        }).toEqual({
            NONE: 0, BLACK: 1, GREY: 2, PURPLE: 3, RED: 4, PINK: 5,
            ORANGE: 6, YELLOW: 7, GREEN: 8, BLUE: 9, WHITE: 10,
        })
    })
})
