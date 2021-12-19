import React, {useEffect, useState} from "react";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel, Badge,
    Box,
    Grid, GridItem,
    Progress,
    Spacer,
    Switch,
    Text
} from "@chakra-ui/react";
import {DnDCharacter} from "dnd-character-sheets";
import {StatusEffectsEnum} from "./status-effects.enum";
import {getIcon} from "./status-icons";

const App = (props: {
    char: DnDCharacter,
    initiative: number,
    isMaster: boolean,
    statusEffects?: StatusEffectsEnum[],
    npc?: boolean,
    hidden?: boolean
}) => {

    const hp = props.char.hp || '0'
    const tempHp = props.char.tempHp || '0'
    const maxHp = props.char.maxHp || '0'

    const ac = props.char.ac || '0'
    const statusEffects = props.statusEffects || []

    const npc = props.npc || false
    const hidden = props.hidden || false

    const [blind, setBlind] = useState(false)
    const [poison, setPoison] = useState(false)
    const [down, setDown] = useState(false)

    const [effects, setEffects] = useState([])

    const [hide, setHide] = useState(hidden)

    function write(key: string, value: string) {
        return (
            <><Text color='gray'>{key}</Text><Box w='0.5rem'/><Text>{value}</Text></>
        )
    }

    function divider() {
        return (
            <><Box marginLeft='0.5rem'/><Text>|</Text><Box marginRight='0.5rem'/></>
        )
    }

    function calcHp() {
        let out = hp
        try {
            if (Number(tempHp) > 0) {
                out += `(+${tempHp})`
            }
        } catch (_) {
        }
        out += '/' + maxHp
        return out!
    }

    function calcMaxHp() {
        if (!tempHp && maxHp) {
            return maxHp
        }

        try {
            const m = Number(maxHp)
            const h = Number(hp)
            const t = Number(tempHp)

            if (h + t > m) {
                return h + t
            } else {
                return m
            }
        } catch (_) {
            return 0
        }
    }

    function createStatusIcons() {
        setEffects([])

        if (down) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.DOWNED)])
        }
        if (blind) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.BLIND)])
        }
        if (poison) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.POISONED)])
        }
    }

    function toggleEffects(s: StatusEffectsEnum) {
        switch (s) {
            case StatusEffectsEnum.BLIND:
                setBlind(!blind)
                break
            case StatusEffectsEnum.POISONED:
                setPoison(!poison)
                break
            case StatusEffectsEnum.DOWNED:
                setDown(!down)
                break
            default:
                break
        }

        createStatusIcons()
    }

    useEffect(() => {
        for (let e of statusEffects) {
            toggleEffects(e)
        }
    }, [])

    useEffect(() => {
        createStatusIcons()
    }, [blind, down, poison])

    if (!props.isMaster && hidden) {
        return (
            <></>
        )
    }

    return (
        <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                       padding='0.4rem 0.75rem'>
            <AccordionButton _expanded={{bg: '#ebebeb'}}>
                {write('', props.char.name!)}
                {divider()}
                {write('HP:', calcHp())}
                {hide &&
                    <>
                    <Box marginLeft='0.5rem'></Box><Badge colorScheme='teal'>Hidden</Badge><Box marginRight='0.5rem'></Box>
                    </>
                }
                {effects}
                <Spacer/>
                {write('AC:', String(ac))}
                {divider()}
                {write('Initiative:', String(props.initiative))}
            </AccordionButton>
            <Progress size='sm' colorScheme='yellow'
                      value={Number(hp) + Number(tempHp)}
                      max={Number(calcMaxHp())}/>
            <Progress size='sm' colorScheme='red' translateY='-0.5rem' transform='auto' value={Number(hp)}
                      max={Number(calcMaxHp())} bg='0'/>
            { props.isMaster &&
                <AccordionPanel>
                    <Grid templateColumns='repeat(5, 1fr)' gap={6}>
                        <GridItem>
                            <Switch onChange={() => toggleEffects(StatusEffectsEnum.BLIND)}
                                    isChecked={blind}>Blind</Switch><br/>
                            <Switch onChange={() => toggleEffects(StatusEffectsEnum.POISONED)}
                                    isChecked={poison}>Vergifted</Switch><br/>
                            <Switch onChange={() => toggleEffects(StatusEffectsEnum.DOWNED)} isChecked={down}>Am
                                Boden</Switch><br/>
                        </GridItem>
                        <GridItem>
                            <Switch onChange={(event) => setHide(event.target.checked)}
                                    isChecked={hide}>Versteckt</Switch><br/>
                        </GridItem>
                    </Grid>
                </AccordionPanel>
            }
        </AccordionItem>
    )
}

export default App
