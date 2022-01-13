import {StatusEffectsEnum} from "./status-effects.enum";
import {Box, Icon} from "@chakra-ui/react";
import {
    IoArrowDownSharp,
    IoEarOutline,
    IoEyeOffSharp,
    IoHeartSharp,
    IoPulseSharp,
    IoWaterSharp
} from "react-icons/io5";
import React from "react";
import {GiBootStomp,
    GiCharm, GiChicken, GiDeadHead, GiHook, GiInvisible, GiKnockedOutStars,
    GiKnockout, GiSpiderWeb, GiStoneBlock, GiThunderStruck} from "react-icons/gi";

const prone = (
    <React.Fragment key='down'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiBootStomp} color='red'/>
    </React.Fragment>
)

const blind = (
    <React.Fragment key='blind'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoEyeOffSharp} color='purple'/>
    </React.Fragment>
)

const poison = (
    <React.Fragment key='poison'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoWaterSharp} color='green'/>
    </React.Fragment>
)

const charmed = (
    <React.Fragment key='charmed'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiCharm} color="#ff3dda"/>
    </React.Fragment>
)

const deafened = (
    <React.Fragment key='deafened'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoEarOutline} color='purple'/>
    </React.Fragment>
)

const frightened = (
    <React.Fragment key='frightened'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiChicken} color='brown'/>
    </React.Fragment>
)

const grappled = (
    <React.Fragment key='grappled'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiHook} color='purple'/>
    </React.Fragment>
)

const incapacitated = (
    <React.Fragment key='incapacitated'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoArrowDownSharp} color='purple'/>
    </React.Fragment>
)

const invisible = (
    <React.Fragment key='invisible'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiInvisible} color='blue'/>
    </React.Fragment>
)

const paralyzed = (
    <React.Fragment key='paralyzed'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiThunderStruck} color='orange'/>
    </React.Fragment>
)

const petrified = (
    <React.Fragment key='petrified'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiStoneBlock} color='gray'/>
    </React.Fragment>
)

const restrained = (
    <React.Fragment key='restrained'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiSpiderWeb} color='purple'/>
    </React.Fragment>
)

const stunned = (
    <React.Fragment key='stunned'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiKnockedOutStars} color='orange'/>
    </React.Fragment>
)

const unconscious = (
    <React.Fragment key='unconscious'>
        <Box marginLeft='0.5rem'/>
        <Icon as={GiKnockout} color='darkred'/>
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
        default:
            return
    }

}
