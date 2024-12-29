import React, {useEffect, useRef, useState} from "react";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Grid,
    GridItem,
    HStack,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Progress,
    Select,
    Spacer,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react";
import {StatusEffectsEnum} from "./status-effects.enum";
import {getDeadIcon, getIcon} from "./status-icons";
import {Player} from "./player.type";
import axios from "axios";
import {IoEyeOffSharp, IoEyeSharp} from "react-icons/io5";
import {ArrowDownIcon, ArrowUpIcon, DeleteIcon} from "@chakra-ui/icons";
import {ColorMarkerEnum} from "./color-marker.enum";
import {Mutex} from "async-mutex"

const App = (props: { player: Player, index: number, first: boolean, last: boolean, isTurn: boolean, update: () => void }) => {

    const [hp, setHp] = useState(props.player.character.hp || '0')
    const [tempHp, setTempHp] = useState(props.player.character.tempHp || '0')
    const [maxHp, setMaxHp] = useState(props.player.character.maxHp || '0')

    const geschwindigkeit = props.player.character.speed || 'UNBEKANNT'
    const [ac, setAc] = useState(props.player.character.ac || '0')
    const statusEffects = props.player.statusEffects || []

    const npc = props.player.npc || false
    const hidden = props.player.hidden || false

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
    const [hex, setHex] = useState(false)
    const [hexblade, setHexblade] = useState(false)
    const [unarmed, setUnarmed] = useState(false)

    const [rage, setRage] = useState(false)
    const [concentration, setConcentration] = useState(false)

    const [effects, setEffects] = useState([])

    const [hide, setHide] = useState(hidden)
    const [isMaster, setIsMaster] = useState(props.player.isMaster)

    const [schaden, setSchaden] = useState(0)
    const [dead, setDead] = useState(Number(hp) === 0)

    const [colorMarker, setColorMarker] = useState<ColorMarkerEnum>(props.player.colorMarker ?? ColorMarkerEnum.NONE)

    const saveTimer = useRef(null)

    const effectMutex = useRef(new Mutex())

    const onHpEdit = (val: string) => {
        props.player.character.hp = val
        setHp(val)
        updatePlayer()
    }

    const onTempHpEdit = (val: string) => {
        props.player.character.tempHp = val
        setTempHp(val)
        updatePlayer()
    }

    const onMaxHpEdit = (val: string) => {
        props.player.character.maxHp = val
        setMaxHp(val)
        updatePlayer()
    }

    const onAcEdit = (val: string) => {
        props.player.character.ac = val
        setAc(val)
        savePlayer()
    }

    const onDelete = () => {
        axios.delete(process.env.REACT_APP_API_PREFIX + `/api/initiative/player/${props.player.turnId}`)
            .then(() => props.update())
            .catch(() => {
            })
    }

    function write(key: string, value: string) {
        return (
            <><Text color='gray' style={{marginBottom: '0'}}>{key}</Text><Box w='0.5rem'/><Text
                style={{marginBottom: '0'}}>{value}</Text></>
        )
    }

    function divider() {
        return (
            <><Box marginLeft='0.5rem'/><Text style={{marginBottom: '0'}}>|</Text><Box marginRight='0.5rem'/></>
        )
    }

    const strSave = () => {
        try {
            let save = Number(props.player.character.strSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }

        } catch (_) {
        }

        return (
            <Text>0</Text>
        )

    }

    const dexSave = () => {
        try {
            let save = Number(props.player.character.dexSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_) {
        }

        return (
            <Text>0</Text>
        )
    }

    const conSave = () => {
        try {
            let save = Number(props.player.character.conSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_) {
        }

        return (
            <Text>0</Text>
        )
    }

    const intSave = () => {
        try {
            let save = Number(props.player.character.intSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_) {
        }

        return (
            <Text>0</Text>
        )
    }

    const wisSave = () => {
        try {
            let save = Number(props.player.character.wisSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_) {
        }

        return (
            <Text>0</Text>
        )
    }

    const chaSave = () => {
        try {
            let save = Number(props.player.character.chaSave)
            if (!Number.isNaN(save)) {
                return (
                    <Text>{save > 0 && '+'}{save}</Text>
                )
            }
        } catch (_) {
        }

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
        effectMutex.current.runExclusive(() => {
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
            if (hex) {
                // @ts-ignore
                setEffects(e => [...e, getIcon(StatusEffectsEnum.HEX)])
                e.push(StatusEffectsEnum.HEX)
            }
            if (hexblade) {
                // @ts-ignore
                setEffects(e => [...e, getIcon(StatusEffectsEnum.HEXBLADE)])
                e.push(StatusEffectsEnum.HEXBLADE)
            }
            if (unarmed) {
                // @ts-ignore
                setEffects(e => [...e, getIcon(StatusEffectsEnum.UNARMED)])
                e.push(StatusEffectsEnum.UNARMED)
            }
            if (rage) {
                // @ts-ignore
                setEffects(e => [...e, getIcon(StatusEffectsEnum.RAGE)])
                e.push(StatusEffectsEnum.RAGE)
            }
            if (concentration) {
                // @ts-ignore
                setEffects(e => [...e, getIcon(StatusEffectsEnum.CONCENTRATION)])
                e.push(StatusEffectsEnum.CONCENTRATION)
            }

            if (isMaster) {
                props.player.statusEffects = e
                savePlayer()
            }
        })
    }

    function updatePlayer() {
        savePlayer()
    }

    function savePlayer() {
        // @ts-ignore
        clearTimeout(saveTimer.current)

        // @ts-ignore
        saveTimer.current = setTimeout(() =>
            axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: props.player})
                .then(() => props.update())
                .catch(() => {
                }), 650)
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
            case StatusEffectsEnum.HEX:
                setHex(!hex)
                break
            case StatusEffectsEnum.HEXBLADE:
                setHexblade(!hexblade)
                break
            case StatusEffectsEnum.UNARMED:
                setUnarmed(!unarmed)
                break
            case StatusEffectsEnum.RAGE:
                setRage(!rage)
                break
            case StatusEffectsEnum.CONCENTRATION:
                setConcentration(!concentration)
                break
            default:
                break
        }
    }

    const doSchaden = () => {
        let dmg = schaden
        try {
            const tempHPval = Number(tempHp)
            if (tempHPval > 0) {

                if (tempHPval > schaden) {
                    onTempHpEdit(String(Number(tempHp) - dmg))
                    dmg = 0
                } else {
                    onTempHpEdit('0')
                    dmg -= tempHPval
                }
            }
        } catch (_) {
        }

        if (dmg > 0) {
            try {
                const hpVal = Number(hp) - dmg

                if (hpVal > 0) {
                    onHpEdit(String(hpVal))
                } else {
                    onHpEdit('0')
                }
            } catch (_) {
            }
        }

        setSchaden(0)
        updatePlayer()

    }

    const doHeal = () => {
        let heal = schaden

        const hpVal = Math.min(Number(hp) + heal, Number(maxHp))
        onHpEdit(String(hpVal))
        setSchaden(0)
        updatePlayer()
    }

    // Clear Timer
    useEffect(() => {
        // @ts-ignore
        return () => clearTimeout(saveTimer.current)
    }, [])

    useEffect(() => {
        for (let e of statusEffects) {
            toggleEffects(e)
        }
    }, [isMaster])

    useEffect(() => {
        createStatusIcons()
    }, [blind, down, poison, charmed, deafened, frightened, grappled, incapacitated, invisible, paralyzed, petrified, restrained, stunned, unconscious, hex, hexblade, unarmed, rage, concentration, isMaster])

    useEffect(() => {
        if (Number(hp) === 0) {
            setDead(true)
        } else {
            setDead(false)
        }
    }, [hp])

    useEffect(() => {
        props.player.hidden = hide
        if (props.player.isMaster)
            savePlayer()
    }, [hide])

    if (!props.player.isMaster && hidden) {
        return (
            <></>
        )
    }

    function writePlayerHP() {
        if (!npc || props.player.isMaster) {
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
        if (!npc || props.player.isMaster) {
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
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/move', {
            index: props.index,
            direction: direction
        })
            .then(() => {
                props.update()
            })
            .catch(() => {
            })
    }

    const getColor = (color: ColorMarkerEnum) => {
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

    // @ts-ignore
    return (
        <>
            <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                           padding='0.4rem 0.75rem' background={(props.isTurn) ? '#fff9e1' : '#fafafa'}
                           borderColor={(props.isTurn) ? 'black' : 'blackAlpha.200'}>
                <ButtonGroup isAttached w='100%'>
                    {props.player.isMaster && createHideButton()}
                    <AccordionButton _expanded={props.player.isMaster ? {bg: '#ebebeb'} : undefined}
                                     style={{outline: 'none', border: 'none', boxShadow: 'none'}}>
                        {write('', props.player.character.name!)}
                        {writePlayerHP()}
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
                        {
                            colorMarker !== ColorMarkerEnum.NONE ? <Badge variant='solid' bg={getColor(colorMarker)}
                                                                          textColor={getColor(colorMarker)}
                                                                          borderColor='black' borderWidth='1px'
                                                                          marginLeft='0.5rem' marginRight='0.5rem'
                                                                          width='2rem'>_</Badge> : <></>
                        }
                        {dead && getDeadIcon()}
                        {effects}
                        <Spacer/>
                        {(!npc || props.player.isMaster) && write('AC:', String(ac))}
                        {(!npc || props.player.isMaster) && divider()}
                        {write('Initiative:', String(props.player.initiative))}
                    </AccordionButton>
                    {props.player.isMaster && <React.Fragment><ButtonGroup isAttached>
                        <Button size='sm' isDisabled={props.first} onClick={() => move('up')}><ArrowUpIcon/></Button>
                        <Button size='sm' isDisabled={props.last} onClick={() => move('down')}><ArrowDownIcon/></Button>
                    </ButtonGroup></React.Fragment>}
                </ButtonGroup>
                {createHPBar()}
                {props.player.isMaster &&
                    <AccordionPanel>
                        <Grid templateColumns='repeat(5, 1fr)' gap={0}>
                            <GridItem>
                                <Switch onChange={() => setBlind(!blind)}
                                        isChecked={blind}>
                                    Blind
                                </Switch><br/>
                                <Switch onChange={() => setPoison(!poison)}
                                        isChecked={poison}>
                                    Vergifted
                                </Switch><br/>
                                <Switch onChange={() => setDown(!down)} isChecked={down}>
                                    Liegend
                                </Switch><br/>
                                <Switch onChange={() => setCharmed(!charmed)} isChecked={charmed}>
                                    Bezaubert
                                </Switch><br/>
                                <Switch onChange={() => setDeafened(!deafened)} isChecked={deafened}>
                                    Taub
                                </Switch><br/>
                                <Switch onChange={() => setFrightened(!frightened)}
                                        isChecked={frightened}>
                                    Verängstigt
                                </Switch><br/>
                                <Switch onChange={() => setGrappled(!grappled)} isChecked={grappled}>
                                    Gepackt
                                </Switch><br/>
                                <Switch onChange={() => setHex(!hex)} isChecked={hex}>
                                    Hex
                                </Switch><br/>
                                <Switch onChange={() => setUnarmed(!unarmed)} isChecked={unarmed}>
                                    Unbewaffnet
                                </Switch>
                                <br/>
                                <br/>
                                <Switch onChange={() => setRage(!rage)} isChecked={rage}>
                                    Rage
                                </Switch>
                            </GridItem>
                            <GridItem>
                                <Switch onChange={() => setIncapacitated(!incapacitated)}
                                        isChecked={incapacitated}>
                                    Kampfunfähig
                                </Switch><br/>
                                <Switch onChange={() => setInvisible(!invisible)}
                                        isChecked={invisible}>
                                    Unsichtbar
                                </Switch><br/>
                                <Switch onChange={() => setParalyzed(!paralyzed)}
                                        isChecked={paralyzed}>
                                    Gelähmt
                                </Switch><br/>
                                <Switch onChange={() => setPetrified(!petrified)}
                                        isChecked={petrified}>
                                    Versteinert
                                </Switch><br/>
                                <Switch onChange={() => setRestrained(!restrained)}
                                        isChecked={restrained}>
                                    Festgesetzt
                                </Switch><br/>
                                <Switch onChange={() => setStunned(!stunned)}
                                        isChecked={stunned}>
                                    Betäubt
                                </Switch><br/>
                                <Switch onChange={() => setUnconscious(!unconscious)}
                                        isChecked={unconscious}>
                                    Bewusstlos
                                </Switch><br/>
                                <Switch onChange={() => setHexblade(!hexblade)}
                                        isChecked={hexblade}>
                                    Hexblade
                                </Switch>
                                <br/><br/>
                                <br/>
                                <Switch onChange={() => setConcentration(!concentration)}
                                        isChecked={concentration}>
                                    Konzentration
                                </Switch>
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
                            <GridItem>
                                Geschwindigkeit: {geschwindigkeit}<br/>
                                <HStack w='88%'>
                                    <Text width='120px'>Schaden:</Text>
                                    <NumberInput defaultValue={0} min={0}
                                                 onChange={(_, val) => setSchaden(val)}
                                                 value={schaden}>
                                        <NumberInputField/>
                                        <NumberInputStepper>
                                            <NumberIncrementStepper/>
                                            <NumberDecrementStepper/>
                                        </NumberInputStepper>
                                    </NumberInput>
                                </HStack>
                                <Button colorScheme='red' onClick={doSchaden} w='88%'>Schaden</Button>
                                <Button colorScheme='green' onClick={doHeal} w='88%'>Heilen</Button>
                                <Select variant='flushed' marginTop='1rem'
                                        onChange={(evt) => {
                                            const color = Number(evt.currentTarget.value)
                                            setColorMarker(color)
                                            props.player.colorMarker = color
                                            savePlayer()
                                        }}
                                        placeholder='Markierung' value={colorMarker}
                                >
                                    <option value={ColorMarkerEnum.NONE}>Nichts</option>
                                    <option value={ColorMarkerEnum.BLACK}>Schwarz</option>
                                    <option value={ColorMarkerEnum.GREY}>Grau</option>
                                    <option value={ColorMarkerEnum.PURPLE}>Lila</option>
                                    <option value={ColorMarkerEnum.RED}>Rot</option>
                                    <option value={ColorMarkerEnum.PINK}>Rosa</option>
                                    <option value={ColorMarkerEnum.ORANGE}>Orange</option>
                                    <option value={ColorMarkerEnum.YELLOW}>Gelb</option>
                                    <option value={ColorMarkerEnum.GREEN}>Grün</option>
                                    <option value={ColorMarkerEnum.BLUE}>Blau</option>
                                    <option value={ColorMarkerEnum.WHITE}>Weiß</option>
                                </Select>
                            </GridItem>
                            <GridItem>
                                <VStack>
                                    <HStack>
                                        <Text width='120px'>HP:</Text>
                                        <NumberInput defaultValue={props.player.character.hp || 0} min={0}
                                                     onChange={onHpEdit} value={hp}
                                                     max={Number(props.player.character.maxHp)}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='120px'>Temp HP:</Text>
                                        <NumberInput defaultValue={props.player.character.tempHp || 0} min={0}
                                                     onChange={onTempHpEdit} value={tempHp}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='120px'>Max HP:</Text>
                                        <NumberInput defaultValue={props.player.character.maxHp || 0} min={0}
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
                                        <NumberInput defaultValue={props.player.character.ac || 0} min={0}
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
