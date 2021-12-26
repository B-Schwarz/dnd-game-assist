import React, {useEffect, useState} from "react";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Grid,
    GridItem, Heading,
    HStack,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Progress,
    Spacer,
    Switch, Table, Tbody, Td,
    Text, Th, Thead, Tr,
    VStack
} from "@chakra-ui/react";
import {StatusEffectsEnum} from "./status-effects.enum";
import {getIcon} from "./status-icons";
import {Player} from "./player.type";
import axios from "axios";
import {IoEyeSharp, IoEyeOffSharp} from "react-icons/io5";
import {ArrowDownIcon, ArrowUpIcon, DeleteIcon} from "@chakra-ui/icons";
import {DnDCharacter} from "dnd-character-sheets";

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
    const [charmed, setCharmed] = useState(false)
    const [deafened, setDeafened] = useState(false)
    const [frightened, setFrightened] = useState(false)
    const [grappled, setGrappled] = useState(false)
    const [incapacitated, setIncapacitated] = useState(false)
    const [invisible, setInvisible] = useState(false)
    const [paralyzed, setParalyzed] = useState(false)
    const [petrified, setPetrified] = useState(false)
    const [restrained, setRestrained] = useState(false)
    const [stunned, setStunned] = useState(false)
    const [unconscious, setUnconscious] = useState(false)

    const [effects, setEffects] = useState([])

    const [hide, setHide] = useState(hidden)
    const [isMaster, setIsMaster] = useState(props.p.isMaster)

    const onHpEdit = (val: string) => {
        const p: DnDCharacter = props.p.character
        p.hp = val
        axios.post('http://localhost:4000/api/char', {character: p, charID: props.p.id})
            .catch(() => {
            })
        savePlayer()
    }

    const onTempHpEdit = (val: string) => {
        const p: DnDCharacter = props.p.character
        p.tempHp = val
        axios.post('http://localhost:4000/api/char', {character: p, charID: props.p.id})
            .catch(() => {
            })
        savePlayer()
    }

    const onMaxHpEdit = (val: string) => {
        const p: DnDCharacter = props.p.character
        p.maxHp = val
        axios.post('http://localhost:4000/api/char', {character: p, charID: props.p.id})
            .catch(() => {
            })
        savePlayer()
    }

    const onAcEdit = (val: string) => {
        props.p.character.ac = val
        savePlayer()
    }

    const onDelete = () => {
        axios.delete(`http://localhost:4000/api/initiative/player/${props.p.turn}`)
            .catch(() => {
            })
    }

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

    const strSave = () => {
        try {
            let save = Number(props.p.character.strSave)
            if (props.p.character.strSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }

            if (!Number.isNaN(save)) {
                    return (
                        <Text>{save > 0 && '+'}{save}</Text>
                    )
            }

        } catch (_){
        }

        return (
            <Text>0</Text>
        )

    }

    const dexSave = () => {
        try {
            let save = Number(props.p.character.dexSave)
            if (props.p.character.dexSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_){}

        return (
            <Text>0</Text>
        )
    }

    const conSave = () => {
        try {
            let save = Number(props.p.character.conSave)
            if (props.p.character.conSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_){}

        return (
            <Text>0</Text>
        )
    }

    const intSave = () => {
        try {
            let save = Number(props.p.character.intSave)
            if (props.p.character.intSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_){}

        return (
            <Text>0</Text>
        )
    }

    const wisSave = () => {
        try {
            let save = Number(props.p.character.wisSave)
            if (props.p.character.wisSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_){}

        return (
            <Text>0</Text>
        )
    }

    const chaSave = () => {
        try {
            let save = Number(props.p.character.chaSave)
            if (props.p.character.chaSaveChecked!) {
                save += Number(props.p.character.proficiencyBonus)
            }
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_){}

        return (
            <Text>0</Text>
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
            setEffects(e => [...e, getIcon(StatusEffectsEnum.PRONE)])
            e.push(StatusEffectsEnum.PRONE)
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
        if (charmed) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.CHARMED)])
            e.push(StatusEffectsEnum.CHARMED)
        }
        if (deafened) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.DEAFENED)])
            e.push(StatusEffectsEnum.DEAFENED)
        }
        if (frightened) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.FRIGHTENED)])
            e.push(StatusEffectsEnum.FRIGHTENED)
        }
        if (grappled) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.GRAPPLED)])
            e.push(StatusEffectsEnum.GRAPPLED)
        }
        if (incapacitated) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.INCAPACITATED)])
            e.push(StatusEffectsEnum.INCAPACITATED)
        }
        if (invisible) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.INVISIBLE)])
            e.push(StatusEffectsEnum.INVISIBLE)
        }
        if (paralyzed) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.PARALYZED)])
            e.push(StatusEffectsEnum.PARALYZED)
        }
        if (petrified) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.PETRIFIED)])
            e.push(StatusEffectsEnum.PETRIFIED)
        }
        if (restrained) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.RESTRAINED)])
            e.push(StatusEffectsEnum.RESTRAINED)
        }
        if (stunned) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.STUNNED)])
            e.push(StatusEffectsEnum.STUNNED)
        }
        if (unconscious) {
            // @ts-ignore
            setEffects(e => [...e, getIcon(StatusEffectsEnum.UNCONSCIOUS)])
            e.push(StatusEffectsEnum.UNCONSCIOUS)
        }


        if (isMaster) {
            props.p.statusEffects = e
            savePlayer()
        }
    }

    function savePlayer() {
        axios.put('http://localhost:4000/api/initiative/player', {player: props.p})
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
            case StatusEffectsEnum.PRONE:
                setDown(!down)
                break
            case StatusEffectsEnum.CHARMED:
                setCharmed(!charmed)
                break
            case StatusEffectsEnum.DEAFENED:
                setDeafened(!deafened)
                break
            case StatusEffectsEnum.FRIGHTENED:
                setFrightened(!frightened)
                break
            case StatusEffectsEnum.GRAPPLED:
                setGrappled(!grappled)
                break
            case StatusEffectsEnum.INCAPACITATED:
                setIncapacitated(!incapacitated)
                break
            case StatusEffectsEnum.INVISIBLE:
                setInvisible(!invisible)
                break
            case StatusEffectsEnum.PARALYZED:
                setParalyzed(!paralyzed)
                break
            case StatusEffectsEnum.PETRIFIED:
                setPetrified(!petrified)
                break
            case StatusEffectsEnum.RESTRAINED:
                setRestrained(!restrained)
                break
            case StatusEffectsEnum.STUNNED:
                setStunned(!stunned)
                break
            case StatusEffectsEnum.UNCONSCIOUS:
                setUnconscious(!unconscious)
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
    }, [blind, down, poison, charmed, deafened, frightened, grappled, incapacitated, invisible, paralyzed, petrified, restrained, stunned, unconscious, isMaster])

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
            .catch(() => {
            })
    }

    return (
        <>
            <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                           padding='0.4rem 0.75rem' background={(props.p.isTurn) ? '#fff9e1' : '#fafafa'}
                           borderColor={(props.p.isTurn) ? 'black' : 'blackAlpha.200'}>
                <ButtonGroup isAttached w='100%'>
                    {props.p.isMaster && createHideButton()}
                    <AccordionButton _expanded={props.p.isMaster ? {bg: '#ebebeb'} : undefined}
                                     style={{outline: 'none', border: 'none', boxShadow: 'none'}}>
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
                        <Grid templateColumns='repeat(5, 1fr)' gap={0}>
                            <GridItem>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.BLIND)}
                                        isChecked={blind}>Blind</Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.POISONED)}
                                        isChecked={poison}>Vergifted</Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.PRONE)} isChecked={down}>Am
                                    Boden</Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.CHARMED)} isChecked={charmed}>
                                    Charmed
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.DEAFENED)} isChecked={deafened}>
                                    Deafened
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.FRIGHTENED)}
                                        isChecked={frightened}>
                                    Frightened
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.GRAPPLED)} isChecked={grappled}>
                                    Grappled
                                </Switch><br/>
                            </GridItem>
                            <GridItem>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.INCAPACITATED)}
                                        isChecked={incapacitated}>
                                    Incapacitated
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.INVISIBLE)}
                                        isChecked={invisible}>
                                    Invisible
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.PARALYZED)}
                                        isChecked={paralyzed}>
                                    Paralyzed
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.PETRIFIED)}
                                        isChecked={petrified}>
                                    Petrified
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.RESTRAINED)}
                                        isChecked={restrained}>
                                    Restrained
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.STUNNED)} isChecked={stunned}>
                                    Stunned
                                </Switch><br/>
                                <Switch onChange={() => toggleEffects(StatusEffectsEnum.UNCONSCIOUS)}
                                        isChecked={unconscious}>
                                    Unconscious
                                </Switch><br/>
                            </GridItem>
                            <GridItem>
                                <Table size='sm'>
                                    <Thead>
                                        <Tr>
                                            <Th>Saving Throw</Th>
                                            <Th>Modifier</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td>Strength</Td>
                                            <Td>{strSave()}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Dexterity</Td>
                                            <Td>{dexSave()}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Constitution</Td>
                                            <Td>{conSave()}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Intelligence</Td>
                                            <Td>{intSave()}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Wisdom</Td>
                                            <Td>{wisSave()}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>Charisma</Td>
                                            <Td>{chaSave()}</Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </GridItem>
                            <GridItem/>
                            <GridItem>
                                <VStack>
                                    <HStack>
                                        <Text width='120px'>HP:</Text>
                                        <NumberInput defaultValue={props.p.character.hp || 0} min={0}
                                                     onChange={onHpEdit}
                                                     max={Number(props.p.character.maxHp)}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='120px'>Temp HP:</Text>
                                        <NumberInput defaultValue={props.p.character.tempHp || 0} min={0}
                                                     onChange={onTempHpEdit}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='120px'>Max HP:</Text>
                                        <NumberInput defaultValue={props.p.character.maxHp || 0} min={0}
                                                     onChange={onMaxHpEdit}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='120px'>AC:</Text>
                                        <NumberInput defaultValue={props.p.character.ac || 0} min={0}
                                                     onChange={onAcEdit}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <Button borderWidth='1px' borderRadius='lg' colorScheme='red' w='100%'
                                            onClick={onDelete}>
                                        <DeleteIcon/>LÖSCHEN
                                    </Button>
                                </VStack>
                            </GridItem>
                        </Grid>
                    </AccordionPanel>
                }
            </AccordionItem>
        </>
    )
}

export default App
