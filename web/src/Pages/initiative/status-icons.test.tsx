import React from 'react'
import {getDeadIcon, getIcon} from './status-icons'
import {StatusEffectsEnum} from './status-effects.enum'

// The enum is numeric; iterate its numeric members.
const allEffects = Object.values(StatusEffectsEnum).filter((v) => typeof v === 'number') as StatusEffectsEnum[]

describe('getIcon', () => {
    it('returns a valid tooltip-wrapped element for every status effect', () => {
        for (const effect of allEffects) {
            const el = getIcon(effect)
            expect(React.isValidElement(el)).toBe(true)
        }
    })

    it('wraps the icon in a Tooltip carrying a (German) description label', () => {
        const el: any = getIcon(StatusEffectsEnum.CONCENTRATION)
        // Fragment -> [<Box/>, <Tooltip label={...}>]
        const children = React.Children.toArray(el.props.children)
        const tooltip: any = children.find((c: any) => c?.props?.label)
        expect(tooltip).toBeTruthy()
        expect(tooltip.props.label).toBeTruthy() // name + description JSX
    })

    it('returns undefined for an unknown effect', () => {
        expect(getIcon(999 as StatusEffectsEnum)).toBeUndefined()
    })
})

describe('getDeadIcon', () => {
    it('returns a valid element', () => {
        expect(React.isValidElement(getDeadIcon())).toBe(true)
    })
})
