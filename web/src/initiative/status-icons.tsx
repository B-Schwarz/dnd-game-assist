import {StatusEffectsEnum} from "./status-effects.enum";
import {Box, Icon} from "@chakra-ui/react";
import {IoArrowDownSharp, IoEyeOffSharp, IoWaterSharp} from "react-icons/io5";
import React from "react";

const down = (
    <React.Fragment key='down'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoArrowDownSharp} color='orange' />
    </React.Fragment>
)

const blind = (
    <React.Fragment key='blind'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoEyeOffSharp} color='purple' />
    </React.Fragment>
)

const poison = (
    <React.Fragment key='poison'>
        <Box marginLeft='0.5rem'/>
        <Icon as={IoWaterSharp} color='green' />
    </React.Fragment>
)

export const getIcon = (effect: StatusEffectsEnum) => {

    switch (effect) {
        case StatusEffectsEnum.BLIND:
            return blind
        case StatusEffectsEnum.DOWNED:
            return down
        case StatusEffectsEnum.POISONED:
            return poison
        default:
            return
    }

}
