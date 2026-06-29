import {StatusEffectsEnum} from "./status-effects.enum";
import {Box, Icon, Text, Tooltip} from "@chakra-ui/react";
import {IoArrowDownSharp, IoEarOutline, IoEyeOffSharp, IoWaterSharp} from "react-icons/io5";
import React from "react";
import {
    GiBootStomp,
    GiCharm,
    GiChicken,
    GiHook,
    GiInvisible,
    GiKnockedOutStars,
    GiKnockout,
    GiPentacle,
    GiPentagramRose,
    GiSpiderWeb,
    GiStoneBlock,
    GiThunderStruck,
    GiDropWeapon,
    GiChewedSkull,
    GiEnrage,
    GiBrain
} from "react-icons/gi";

// A condition icon with a tooltip that shows the name plus a brief description
// of what the effect does (German, matching the rest of the board UI).
const makeIcon = (key: string, IconComp: any, color: string, name: string, description: string) => (
    <React.Fragment key={key}>
        <Box marginLeft='0.5rem'/>
        <Tooltip
            label={<><Text fontWeight='bold'>{name}</Text><Text fontSize='sm'>{description}</Text></>}
            hasArrow size='md' placement='top'>
            <span>
                <Icon as={IconComp} color={color}/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const prone = makeIcon('prone', GiBootStomp, 'red', 'Liegend',
    'Angriffe aus der Nähe gegen die Kreatur haben Vorteil, Fernangriffe Nachteil; eigene Angriffe mit Nachteil.')
const blind = makeIcon('blind', IoEyeOffSharp, 'purple', 'Blind',
    'Kann nicht sehen. Angriffe gegen sie mit Vorteil, eigene Angriffe mit Nachteil.')
const poison = makeIcon('poison', IoWaterSharp, 'green', 'Vergiftet',
    'Nachteil auf Angriffswürfe und Fähigkeitsproben.')
const charmed = makeIcon('charmed', GiCharm, '#ff3dda', 'Bezaubert',
    'Kann den Bezaubernden nicht angreifen; dieser hat Vorteil bei sozialen Proben.')
const deafened = makeIcon('deafened', IoEarOutline, 'purple', 'Taub',
    'Kann nicht hören und verfehlt jede Probe, die Hören erfordert.')
const frightened = makeIcon('frightened', GiChicken, 'brown', 'Verängstigt',
    'Nachteil auf Proben und Angriffe, solange die Quelle der Furcht sichtbar ist; kann sich ihr nicht nähern.')
const grappled = makeIcon('grappled', GiHook, 'purple', 'Gepackt',
    'Bewegungsrate ist 0. Endet, wenn der Packende handlungsunfähig wird.')
const incapacitated = makeIcon('incapacitated', IoArrowDownSharp, 'purple', 'Kampfunfähig',
    'Kann keine Aktionen oder Reaktionen ausführen.')
const invisible = makeIcon('invisible', GiInvisible, 'blue', 'Unsichtbar',
    'Nicht zu sehen. Angriffe gegen sie mit Nachteil, eigene Angriffe mit Vorteil.')
const paralyzed = makeIcon('paralyzed', GiThunderStruck, 'orange', 'Gelähmt',
    'Handlungsunfähig, kann sich nicht bewegen oder sprechen. Treffer aus der Nähe sind kritische Treffer.')
const petrified = makeIcon('petrified', GiStoneBlock, 'gray', 'Versteinert',
    'In Stein verwandelt: handlungsunfähig, resistent gegen jeden Schaden, immun gegen Gift und Krankheit.')
const restrained = makeIcon('restrained', GiSpiderWeb, 'purple', 'Festgesetzt',
    'Bewegungsrate 0. Angriffe gegen sie mit Vorteil, eigene mit Nachteil; Nachteil auf GES-Rettungswürfe.')
const stunned = makeIcon('stunned', GiKnockedOutStars, 'orange', 'Betäubt',
    'Handlungsunfähig, kann sich nicht bewegen. Angriffe gegen sie haben Vorteil.')
const unconscious = makeIcon('unconscious', GiKnockout, 'darkred', 'Bewusstlos',
    'Handlungsunfähig und liegend. Treffer aus der Nähe sind kritische Treffer.')
const hex = makeIcon('hex', GiPentagramRose, 'darkred', 'Hex',
    'Zauber Hex: zusätzlicher Schaden und Nachteil auf Proben eines gewählten Attributs.')
const hexblade = makeIcon('hexblade', GiPentacle, 'purple', "Hexblade's Curse",
    'Verflucht: Bonus-Schaden gegen das Ziel und erweiterter kritischer Trefferbereich.')
const unarmed = makeIcon('unarmed', GiDropWeapon, 'red', 'Unbewaffnet',
    'Keine Waffe ausgerüstet.')
const dead = makeIcon('dead', GiChewedSkull, 'red', 'Tot',
    'Die Kreatur ist tot.')
const rage = makeIcon('rage', GiEnrage, 'red', 'Rage',
    'Wut des Barbaren: Bonus-Nahkampfschaden und Resistenz gegen physischen Schaden.')
const concentration = makeIcon('concentration', GiBrain, 'green', 'Konzentration',
    'Hält einen Konzentrationszauber aufrecht; bei Schaden ist eine Konstitutions-Rettung nötig.')

export const getIcon = (effect: StatusEffectsEnum) => {

    switch (effect) {
        case StatusEffectsEnum.BLIND:
            return blind
        case StatusEffectsEnum.PRONE:
            return prone
        case StatusEffectsEnum.POISONED:
            return poison
        case StatusEffectsEnum.CHARMED:
            return charmed
        case StatusEffectsEnum.DEAFENED:
            return deafened
        case StatusEffectsEnum.FRIGHTENED:
            return frightened
        case StatusEffectsEnum.GRAPPLED:
            return grappled
        case StatusEffectsEnum.INCAPACITATED:
            return incapacitated
        case StatusEffectsEnum.INVISIBLE:
            return invisible
        case StatusEffectsEnum.PARALYZED:
            return paralyzed
        case StatusEffectsEnum.PETRIFIED:
            return petrified
        case StatusEffectsEnum.RESTRAINED:
            return restrained
        case StatusEffectsEnum.STUNNED:
            return stunned
        case StatusEffectsEnum.UNCONSCIOUS:
            return unconscious
        case StatusEffectsEnum.HEX:
            return hex
        case StatusEffectsEnum.HEXBLADE:
            return hexblade
        case StatusEffectsEnum.UNARMED:
            return unarmed
        case StatusEffectsEnum.RAGE:
            return rage
        case StatusEffectsEnum.CONCENTRATION:
            return concentration
        default:
            return
    }

}

export const getDeadIcon = () => {
  return dead
}
