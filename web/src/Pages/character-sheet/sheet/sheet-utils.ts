// Pure helpers for the D&D 2024 character sheet. Extracted from
// CharacterSheet.tsx so the math (ability modifiers, proficiency, HP bar,
// colour mapping) can be unit-tested without rendering the component.

import {Color} from './dnd-character'

// hex value for each marker Color (NONE → empty so the picker stays neutral)
export const COLOR_HEX: Record<number, string> = {
    [Color.NONE]: '',
    [Color.BLACK]: '#000000',
    [Color.GREY]: '#808080',
    [Color.PURPLE]: '#7b2fbe',
    [Color.RED]: '#c0392b',
    [Color.PINK]: '#e84393',
    [Color.ORANGE]: '#e67e22',
    [Color.YELLOW]: '#f1c40f',
    [Color.GREEN]: '#27ae60',
    [Color.BLUE]: '#2980b9',
    [Color.WHITE]: '#ffffff'
}

// readable text color (black/white) for a given background hex
export const contrastInk = (hex: string): string => {
    if (!hex) return ''
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? '#000' : '#fff'
}

// numeric ability modifier for a score, or null when the score is missing/invalid
export const abilityModifierValue = (score: any): number | null => {
    if (score === undefined || score === '' || isNaN(Number(score))) return null
    return Math.floor((Number(score) - 10) / 2)
}

// ability modifier rendered as a signed string ('+3', '-1', '+0'); '' when invalid
export const formatModifier = (score: any): string => {
    const m = abilityModifierValue(score)
    if (m === null) return ''
    return m >= 0 ? '+' + m : String(m)
}

// apply a proficiency state to a base value given the proficiency bonus
export const withProficiency = (base: number, checked: string | undefined, pb: number): number =>
    checked === 'expert' ? base + 2 * pb : checked === 'normal' ? base + pb : base

// current-HP percentage (0..100) for the vitals HP bar
export const hpPercent = (hp: any, maxHp: any): number => {
    const cur = Number(hp)
    const max = Number(maxHp)
    if (!max || isNaN(cur) || isNaN(max)) return 0
    return Math.max(0, Math.min(100, (cur / max) * 100))
}
