import React, {useEffect, useState} from "react";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box, Button, ButtonGroup, ExpandedIndex,
    Grid,
    GridItem,
    Progress,
    Spacer,
    Switch,
    Text, VStack
} from "@chakra-ui/react";
import {StatusEffectsEnum} from "./status-effects.enum";
import {getIcon} from "./status-icons";
import {Player} from "./player.type";
import axios from "axios";
import {IoEyeSharp, IoEyeOffSharp} from "react-icons/io5";
import {ArrowDownIcon, ArrowUpIcon} from "@chakra-ui/icons";

const App = (props: { p: Player, i: number, f: boolean, l: boolean }) => {

    const hp = props.p.character.hp || '0'
    const tempHp = props.p.character.tempHp || '0'
    const maxHp = props.p.character.maxHp || '0'

    const ac = props.p.character.ac || '0'
    const statusEffects = props.p.statusEffects || []

    const npc = props.p.npc || false
    const hidden = props.p.hidden || false

    const [blind, setBlind] = useState(false)
    const [poison, setPoison] = useState(false)
    const [down, setDown] = useState(false)

    const [effects, setEffects] = useState([])

    const [hide, setHide] = useState(hidden)
    const [isMaster, setIsMaster] = useState(props.p.isMaster)

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
        const e = []

        if (down) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.DOWNED)])
            e.push(StatusEffectsEnum.DOWNED)
        }
        if (blind) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.BLIND)])
            e.push(StatusEffectsEnum.BLIND)
        }
        if (poison) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.POISONED)])
            e.push(StatusEffectsEnum.POISONED)
        }

        if (isMaster) {
            props.p.statusEffects = e
            savePlayer()
        }
    }

    function savePlayer() {
        axios.put('http://localhost:4000/api/initiative/player', {player: props.p}, {withCredentials: true})
            .catch(() => {
            })
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
    }, [isMaster])

    useEffect(() => {
        createStatusIcons()
    }, [blind, down, poison, isMaster])

    useEffect(() => {
        props.p.hidden = hide
        if (props.p.isMaster)
        savePlayer()
    }, [hide])

    if (!props.p.isMaster && hidden) {
        return (
            <></>
        )
    }

    function writePlayerMetadata() {
        if (!npc || props.p.isMaster) {
            return (
                <React.Fragment>
                    {divider()}
                    {write('HP:', calcHp())}
                </React.Fragment>
            )
        } else {
            return (<React.Fragment/>)
        }
    }

    function createHPBar() {
        if (!npc || props.p.isMaster) {
            return (
                <React.Fragment>
                    <Progress size='sm' colorScheme='yellow'
                              value={Number(hp) + Number(tempHp)}
                              max={Number(calcMaxHp())}/>
                    <Progress size='sm' colorScheme='red' translateY='-0.5rem' transform='auto' value={Number(hp)}
                              max={Number(calcMaxHp())} bg='0'/>
                </React.Fragment>
            )
        } else {
            return (<React.Fragment/>)
        }
    }

    function createHideButton() {
        if (!hide) {
            return (<Button bg="blue.100" borderRadius="0px" onClick={() => {
                setHide(true)
                createHideButton()
            }}><IoEyeSharp/></Button>)
        } else {
            return (
                <Button bg="purple.100" borderRadius="0px" onClick={() => {
                    setHide(false)
                    createHideButton()
                }}><IoEyeOffSharp/></Button>
            )
        }
    }

    function move(direction: string) {
        axios.put('http://localhost:4000/api/initiative/move', {
            index: props.i,
            direction: direction
        }, {withCredentials: true})
            .catch(() => {})
    }

    return (
        <>
            <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                           padding='0.4rem 0.75rem' background={(props.p.isTurn) ? '#fff9e1' : '#fafafa'}
                           borderColor={(props.p.isTurn) ? 'black' : 'blackAlpha.200'}>
                <ButtonGroup isAttached w='100%'>
                    {props.p.isMaster && createHideButton()}
                    <AccordionButton _expanded={ props.p.isMaster ? {bg: '#ebebeb'} : undefined} style={{ outline: 'none', border: 'none', boxShadow: 'none'}}>
                        {write('', props.p.character.name!)}
                        {writePlayerMetadata()}
                        {hide &&
                            <>
                                <Box marginLeft='0.5rem'/><Badge colorScheme='teal'>VERSTECKT</Badge><Box
                                marginRight='0.5rem'/>
                            </>
                        }
                        {npc &&
                            <>
                                <Box marginLeft='0.5rem'/><Badge colorScheme='green'>NPC</Badge><Box
                                marginRight='0.5rem'/>
                            </>
                        }
                        {effects}
                        <Spacer/>
                        {(!npc || props.p.isMaster) && write('AC:', String(ac))}
                        {(!npc || props.p.isMaster) && divider()}
                        {write('Initiative:', String(props.p.initiative))}
                    </AccordionButton>
                    {props.p.isMaster && <React.Fragment><ButtonGroup isAttached>
                        <Button size='sm' isDisabled={props.f} onClick={() => move('up')}><ArrowUpIcon/></Button>
                        <Button size='sm' isDisabled={props.l} onClick={() => move('down')}><ArrowDownIcon/></Button>
                    </ButtonGroup></React.Fragment>}
                </ButtonGroup>
                {createHPBar()}
                {props.p.isMaster &&
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
                        </Grid>
                    </AccordionPanel>
                }
            </AccordionItem>
        </>
    )
}

export default App
