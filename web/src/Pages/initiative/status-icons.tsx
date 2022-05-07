import {StatusEffectsEnum} from "./status-effects.enum";
import {Box, Icon, Tooltip} from "@chakra-ui/react";
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
    GiChewedSkull
} from "react-icons/gi";

const prone = (
    <React.Fragment key='prone'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Liegend' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiBootStomp} color='red'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const blind = (
    <React.Fragment key='blind'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Blind' hasArrow size='md' placement='top'>
            <span>
                <Icon as={IoEyeOffSharp} color='purple'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const poison = (
    <React.Fragment key='poison'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Vergifted' hasArrow size='md' placement='top'>
            <span>
                <Icon as={IoWaterSharp} color='green'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const charmed = (
    <React.Fragment key='charmed'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Bezaubert' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiCharm} color="#ff3dda"/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const deafened = (
    <React.Fragment key='deafened'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Taub' hasArrow size='md' placement='top'>
            <span>
                <Icon as={IoEarOutline} color='purple'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const frightened = (
    <React.Fragment key='frightened'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Verängstigt' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiChicken} color='brown'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const grappled = (
    <React.Fragment key='grappled'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Gepackt' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiHook} color='purple'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const incapacitated = (
    <React.Fragment key='incapacitated'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Kampfunfähig' hasArrow size='md' placement='top'>
            <span>
                <Icon as={IoArrowDownSharp} color='purple'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const invisible = (
    <React.Fragment key='invisible'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Unsichtbar' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiInvisible} color='blue'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const paralyzed = (
    <React.Fragment key='paralyzed'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Gelähmt' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiThunderStruck} color='orange'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const petrified = (
    <React.Fragment key='petrified'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Versteinert' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiStoneBlock} color='gray'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const restrained = (
    <React.Fragment key='restrained'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Festgesetzt' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiSpiderWeb} color='purple'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const stunned = (
    <React.Fragment key='stunned'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Betäubt' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiKnockedOutStars} color='orange'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const unconscious = (
    <React.Fragment key='unconscious'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Bewusstlos' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiKnockout} color='darkred'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const hex = (
    <React.Fragment key='hex'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label='Hex' hasArrow size='md' placement='top'>
            <span>
                <Icon as={GiPentagramRose} color='darkred'/>
            </span>
        </Tooltip>
    </React.Fragment>
)

const hexblade = (
    <React.Fragment key='unconscious'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label="Hexblade's Curse" hasArrow size='md' placement='top'>
        <span>
            <Icon as={GiPentacle} color='purple'/>
        </span>
        </Tooltip>
    </React.Fragment>
)

const unarmed = (
    <React.Fragment key='unarmed'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label="Unbewaffnet" hasArrow size='md' placement='top'>
        <span>
            <Icon as={GiDropWeapon} color='red'/>
        </span>
        </Tooltip>
    </React.Fragment>
)

const dead = (
    <React.Fragment key='unarmed'>
        <Box marginLeft='0.5rem'/>
        <Tooltip label="Tot" hasArrow size='md' placement='top'>
        <span>
            <Icon as={GiChewedSkull} color='red'/>
        </span>
        </Tooltip>
    </React.Fragment>
)

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
        default:
            return
    }

}

export const getDeadIcon = () => {
  return dead
}
