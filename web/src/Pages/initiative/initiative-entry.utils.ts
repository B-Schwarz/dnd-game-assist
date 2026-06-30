// Pure helpers for the initiative board entry (initiave-entry.tsx). Extracted
// so the HP / AC / damage maths and colour mapping can be unit-tested without
// rendering the (large, axios-driven) entry component.

import {ColorMarkerEnum} from './color-marker.enum'

// AC with the active shield bonus in parentheses, e.g. "14 (+2)" / "14 (-1)".
// A zero (or inactive) shield is hidden.
export const acDisplay = (ac: any, shieldActive: boolean, shield: any): string => {
    if (shieldActive && Number(shield) !== 0) {
        const s = Number(shield)
        return `${ac} (${s > 0 ? '+' : ''}${s})`
    }
    return String(ac)
}

// A saving-throw value rendered signed ('+5' / '0' / '-1'); NaN falls back to '0'.
export const formatSave = (raw: any): string => {
    const save = Number(raw)
    if (Number.isNaN(save)) return '0'
    return `${save > 0 ? '+' : ''}${save}`
}

// "hp(+temp)/max" — temp HP is only shown when it is greater than 0.
export const calcHp = (hp: any, tempHp: any, maxHp: any): string => {
    let out = String(hp)
    if (Number(tempHp) > 0) {
        out += `(+${tempHp})`
    }
    out += '/' + maxHp
    return out
}

// Effective max for the HP bar: when current + temp overflow the printed max,
// the overflow value is used instead. (Mirrors the component exactly, including
// its quirk that a tempHp of '0' is a truthy string.)
export const calcMaxHp = (hp: any, tempHp: any, maxHp: any): any => {
    if (!tempHp && maxHp) {
        return maxHp
    }
    const m = Number(maxHp)
    const h = Number(hp)
    const t = Number(tempHp)
    return h + t > m ? h + t : m
}

// Dead when current HP is exactly 0 (the string '0' included).
export const isDead = (hp: any): boolean => Number(hp) === 0

// Apply damage: temp HP soaks first, the remainder hits real HP, clamped at 0.
// Returns the new values plus flags mirroring the component's "only write when
// it actually changed" behaviour.
export const applyDamage = (hp: any, tempHp: any, dmg: any): {
    hp: string; tempHp: string; hpChanged: boolean; tempHpChanged: boolean
} => {
    let remaining = Number(dmg)
    let newTemp = String(tempHp)
    let tempHpChanged = false
    const t = Number(tempHp)
    if (t > 0) {
        tempHpChanged = true
        if (t > remaining) {
            newTemp = String(t - remaining)
            remaining = 0
        } else {
            newTemp = '0'
            remaining -= t
        }
    }

    let newHp = String(hp)
    let hpChanged = false
    if (remaining > 0) {
        hpChanged = true
        const hpVal = Number(hp) - remaining
        newHp = hpVal > 0 ? String(hpVal) : '0'
    }

    return {hp: newHp, tempHp: newTemp, hpChanged, tempHpChanged}
}

// Apply healing, capped at maxHp.
export const applyHeal = (hp: any, maxHp: any, heal: any): string =>
    String(Math.min(Number(hp) + Number(heal), Number(maxHp)))

// A hidden entry is rendered as nothing for a non-master; the master still
// sees it (with the "hidden" badge).
export const isRowHiddenFromPlayer = (isMaster: boolean, hidden: boolean): boolean =>
    !isMaster && hidden

// HP is visible for PCs and to the master always; an NPC's HP is shown to
// players only when it is explicitly shared.
export const canSeeHp = (npc: boolean, isMaster: boolean, shareHp: boolean): boolean =>
    !npc || isMaster || shareHp

// CSS colour for a marker enum; NONE / out-of-range → '' (no marker shown).
export const markerColor = (color: ColorMarkerEnum): string => {
    switch (color) {
        case ColorMarkerEnum.BLACK:
            return 'black'
        case ColorMarkerEnum.GREY:
            return 'grey'
        case ColorMarkerEnum.PURPLE:
            return 'purple'
        case ColorMarkerEnum.RED:
            return 'red'
        case ColorMarkerEnum.PINK:
            return 'pink'
        case ColorMarkerEnum.ORANGE:
            return 'orange'
        case ColorMarkerEnum.YELLOW:
            return 'yellow'
        case ColorMarkerEnum.GREEN:
            return 'green'
        case ColorMarkerEnum.BLUE:
            return 'blue'
        case ColorMarkerEnum.WHITE:
            return 'white'
        default:
            return ''
    }
}
