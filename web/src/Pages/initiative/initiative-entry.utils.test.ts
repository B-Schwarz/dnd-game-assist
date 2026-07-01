import {
    accordionIndexOnTurn,
    acDisplay,
    applyDamage,
    applyHeal,
    calcHp,
    calcMaxHp,
    canSeeHp,
    formatSave,
    isDead,
    isRowHiddenFromPlayer,
    markerColor,
} from './initiative-entry.utils'
import {ColorMarkerEnum} from './color-marker.enum'

describe('accordionIndexOnTurn', () => {
    // Regression: entries must default to closed and only auto-open once the
    // turn is actually advanced, so a freshly added player does not open with
    // its panel expanded (Bugs.md, Initiative #1).
    it('keeps the current selection on the first observation', () => {
        expect(accordionIndexOnTurn(false, -1, 0)).toBe(-1)
        expect(accordionIndexOnTurn(false, 2, 5)).toBe(2)
    })

    it('opens the entry whose turn it now is on later changes', () => {
        expect(accordionIndexOnTurn(true, -1, 3)).toBe(3)
        expect(accordionIndexOnTurn(true, 2, 0)).toBe(0)
    })
})

describe('acDisplay', () => {
    it('shows just the AC when no shield is active', () => {
        expect(acDisplay('14', false, 2)).toBe('14')
    })

    it('appends a signed positive shield bonus', () => {
        expect(acDisplay('14', true, 2)).toBe('14 (+2)')
    })

    it('appends a signed negative shield', () => {
        expect(acDisplay('14', true, -1)).toBe('14 (-1)')
    })

    it('hides a zero shield even when active', () => {
        expect(acDisplay('14', true, 0)).toBe('14')
    })
})

describe('formatSave', () => {
    it('signs positive values', () => {
        expect(formatSave('5')).toBe('+5')
    })

    it('renders zero without a sign', () => {
        expect(formatSave('0')).toBe('0')
    })

    it('keeps the minus on negatives', () => {
        expect(formatSave('-1')).toBe('-1')
    })

    it('falls back to 0 for NaN / missing', () => {
        expect(formatSave('abc')).toBe('0')
        expect(formatSave(undefined)).toBe('0')
    })
})

describe('calcHp', () => {
    it('omits temp HP when it is zero', () => {
        expect(calcHp('10', '0', '12')).toBe('10/12')
    })

    it('shows temp HP in parentheses when positive', () => {
        expect(calcHp('10', '3', '12')).toBe('10(+3)/12')
    })
})

describe('calcMaxHp', () => {
    it('returns the printed max when temp does not overflow it', () => {
        expect(calcMaxHp('10', '0', '12')).toBe(12)
    })

    it('uses current+temp when they overflow the printed max', () => {
        expect(calcMaxHp('10', '5', '12')).toBe(15)
    })

    it('returns the raw max when temp is missing', () => {
        expect(calcMaxHp('10', '', '12')).toBe('12')
    })
})

describe('isDead', () => {
    it('is true at exactly zero HP (number or string)', () => {
        expect(isDead(0)).toBe(true)
        expect(isDead('0')).toBe(true)
    })

    it('is false for positive HP', () => {
        expect(isDead('5')).toBe(false)
    })
})

describe('applyDamage', () => {
    it('soaks damage from temp HP first', () => {
        const r = applyDamage('10', '5', 3)
        expect(r.tempHp).toBe('2')
        expect(r.tempHpChanged).toBe(true)
        expect(r.hpChanged).toBe(false) // real HP untouched
        expect(r.hp).toBe('10')
    })

    it('overflows past temp HP into real HP', () => {
        const r = applyDamage('10', '5', 8)
        expect(r.tempHp).toBe('0')
        expect(r.hp).toBe('7') // 10 - (8 - 5)
        expect(r.hpChanged).toBe(true)
    })

    it('clamps real HP at zero', () => {
        const r = applyDamage('10', '5', 50)
        expect(r.tempHp).toBe('0')
        expect(r.hp).toBe('0')
    })

    it('hits real HP directly when there is no temp HP', () => {
        const r = applyDamage('10', '0', 4)
        expect(r.tempHpChanged).toBe(false)
        expect(r.hp).toBe('6')
    })
})

describe('applyHeal', () => {
    it('adds healing', () => {
        expect(applyHeal('5', '10', 3)).toBe('8')
    })

    it('caps at maxHp', () => {
        expect(applyHeal('5', '10', 20)).toBe('10')
    })
})

describe('canSeeHp', () => {
    it('always shows PC HP', () => {
        expect(canSeeHp(false, false, false)).toBe(true)
    })

    it('hides NPC HP from players unless shared', () => {
        expect(canSeeHp(true, false, false)).toBe(false)
        expect(canSeeHp(true, false, true)).toBe(true)
    })

    it('always shows HP to the master', () => {
        expect(canSeeHp(true, true, false)).toBe(true)
    })
})

describe('isRowHiddenFromPlayer', () => {
    it('hides a hidden row from a non-master', () => {
        expect(isRowHiddenFromPlayer(false, true)).toBe(true)
    })

    it('shows hidden rows to the master and visible rows to anyone', () => {
        expect(isRowHiddenFromPlayer(true, true)).toBe(false)
        expect(isRowHiddenFromPlayer(false, false)).toBe(false)
    })
})

describe('markerColor', () => {
    it('maps each marker to its CSS colour', () => {
        expect(markerColor(ColorMarkerEnum.BLACK)).toBe('black')
        expect(markerColor(ColorMarkerEnum.PURPLE)).toBe('purple')
        expect(markerColor(ColorMarkerEnum.GREEN)).toBe('green')
        expect(markerColor(ColorMarkerEnum.WHITE)).toBe('white')
    })

    it('returns empty string for NONE and out-of-range values', () => {
        expect(markerColor(ColorMarkerEnum.NONE)).toBe('')
        expect(markerColor(999 as ColorMarkerEnum)).toBe('')
    })
})
