import React, {useEffect, useRef, useState} from "react";
import {
    Badge,
    Box,
    Button,
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
import {MdDragIndicator} from "react-icons/md";
import {DeleteIcon} from "@chakra-ui/icons";
import {ColorMarkerEnum} from "./color-marker.enum";
import {
    acDisplay as acDisplayUtil,
    applyDamage,
    applyHeal,
    calcHp as calcHpUtil,
    calcMaxHp as calcMaxHpUtil,
    canSeeHp,
    formatSave,
    isDead,
    isRowHiddenFromPlayer,
    markerColor,
} from "./initiative-entry.utils";
import {Mutex} from "async-mutex"
import {useSortable} from "@dnd-kit/sortable";
import "./initiative.css";

const App = (props: { player: Player, statusEffects: StatusEffectsEnum[], isMaster: boolean, isTurn: boolean, isOpen: boolean, onToggle: () => void, update: () => void }) => {

    const [hp, setHp] = useState(props.player.character.hp || '0')
    const [tempHp, setTempHp] = useState(props.player.character.tempHp || '0')
    const [maxHp, setMaxHp] = useState(props.player.character.maxHp || '0')

    const geschwindigkeit = props.player.character.speed || 'UNBEKANNT'
    const [ac, setAc] = useState(props.player.character.ac || '0')

    const npc = props.player.npc || false
    const [hidden, setHidden] = useState(props.player.hidden || false)
    const [shareHp, setShareHp] = useState(props.player.shareHp || false)
    const [initiative, setInitiative] = useState(props.player.initiative ?? 0)
    const [shield, setShield] = useState(props.player.shield ?? 0)
    const [shieldActive, setShieldActive] = useState(props.player.shieldActive || false)

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

    const [schaden, setSchaden] = useState(0)
    const [dead, setDead] = useState(isDead(hp))

    const [colorMarker, setColorMarker] = useState<ColorMarkerEnum>(props.player.colorMarker ?? ColorMarkerEnum.NONE)

    const saveTimer = useRef(null)

    const effectMutex = useRef(new Mutex())

    // Drag-to-reorder handle (master only). The handle's listeners are spread
    // onto the grip button so only that grip starts a drag, not the whole row.
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({
        id: props.player.turnId,
        disabled: !props.isMaster,
        animateLayoutChanges: () => false
    })
    const sortableStyle: React.CSSProperties = {
        // translate only — ignore @dnd-kit's scaleX/scaleY so the dragged row
        // keeps its own size instead of stretching to match a taller (expanded) row
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        position: 'relative',
        zIndex: isDragging ? 2 : undefined
    }

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

    const onInitiativeEdit = (val: string) => {
        props.player.initiative = Number(val)
        setInitiative(Number(val))
        savePlayer()
    }

    const onShareHpToggle = (val: boolean) => {
        props.player.shareHp = val
        setShareHp(val)
        savePlayer()
    }

    const onShieldToggle = (val: boolean) => {
        props.player.shieldActive = val
        setShieldActive(val)
        savePlayer()
    }

    const onShieldEdit = (val: string) => {
        props.player.shield = Number(val)
        setShield(Number(val))
        savePlayer()
    }

    // AC, with the active shield bonus shown in parentheses, e.g. "14 (+2)"
    const acDisplay = () => acDisplayUtil(ac, shieldActive, shield)

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

    const strSave = () => <Text>{formatSave(props.player.character.strSave)}</Text>
    const dexSave = () => <Text>{formatSave(props.player.character.dexSave)}</Text>
    const conSave = () => <Text>{formatSave(props.player.character.conSave)}</Text>
    const intSave = () => <Text>{formatSave(props.player.character.intSave)}</Text>
    const wisSave = () => <Text>{formatSave(props.player.character.wisSave)}</Text>
    const chaSave = () => <Text>{formatSave(props.player.character.chaSave)}</Text>

    function calcHp() {
        return calcHpUtil(hp, tempHp, maxHp)
    }

    function calcMaxHp() {
        return calcMaxHpUtil(hp, tempHp, maxHp)
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

            if (props.isMaster) {
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
                setBlind(true)
                break
            case StatusEffectsEnum.POISONED:
                setPoison(true)
                break
            case StatusEffectsEnum.PRONE:
                setDown(true)
                break
            case StatusEffectsEnum.CHARMED:
                setCharmed(true)
                break
            case StatusEffectsEnum.DEAFENED:
                setDeafened(true)
                break
            case StatusEffectsEnum.FRIGHTENED:
                setFrightened(true)
                break
            case StatusEffectsEnum.GRAPPLED:
                setGrappled(true)
                break
            case StatusEffectsEnum.INCAPACITATED:
                setIncapacitated(true)
                break
            case StatusEffectsEnum.INVISIBLE:
                setInvisible(true)
                break
            case StatusEffectsEnum.PARALYZED:
                setParalyzed(true)
                break
            case StatusEffectsEnum.PETRIFIED:
                setPetrified(true)
                break
            case StatusEffectsEnum.RESTRAINED:
                setRestrained(true)
                break
            case StatusEffectsEnum.STUNNED:
                setStunned(true)
                break
            case StatusEffectsEnum.UNCONSCIOUS:
                setUnconscious(true)
                break
            case StatusEffectsEnum.HEX:
                setHex(true)
                break
            case StatusEffectsEnum.HEXBLADE:
                setHexblade(true)
                break
            case StatusEffectsEnum.UNARMED:
                setUnarmed(true)
                break
            case StatusEffectsEnum.RAGE:
                setRage(true)
                break
            case StatusEffectsEnum.CONCENTRATION:
                setConcentration(true)
                break
            default:
                break
        }
    }

    const doSchaden = () => {
        const result = applyDamage(hp, tempHp, schaden)
        if (result.tempHpChanged) {
            onTempHpEdit(result.tempHp)
        }
        if (result.hpChanged) {
            onHpEdit(result.hp)
        }

        setSchaden(0)
        updatePlayer()
    }

    const doHeal = () => {
        onHpEdit(applyHeal(hp, maxHp, schaden))
        setSchaden(0)
        updatePlayer()
    }

    // Clear Timer
    useEffect(() => {
        // @ts-ignore
        return () => clearTimeout(saveTimer.current)
    }, [])

    useEffect(() => {
        setBlind(false)
        setPoison(false)
        setDown(false)
        setCharmed(false)
        setDeafened(false)
        setFrightened(false)
        setGrappled(false)
        setIncapacitated(false)
        setInvisible(false)
        setParalyzed(false)
        setPetrified(false)
        setRestrained(false)
        setStunned(false)
        setUnconscious(false)
        setHex(false)
        setHexblade(false)
        setUnarmed(false)
        setRage(false)
        setConcentration(false)
        for (let e of props.statusEffects) {
            toggleEffects(e)
        }
    }, [props.statusEffects])

    useEffect(() => {
        createStatusIcons()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blind, down, poison, charmed, deafened, frightened, grappled, incapacitated, invisible, paralyzed, petrified, restrained, stunned, unconscious, hex, hexblade, unarmed, rage, concentration, props.isMaster])

    useEffect(() => {
        setHp(props.player.character.hp || '0')
        setMaxHp(props.player.character.maxHp || '0')
        setTempHp(props.player.character.tempHp || '0')
        setAc(props.player.character.ac || '0')

        if (isDead(hp)) {
            setDead(true)
        } else {
            setDead(false)
        }
    }, [hp, maxHp, tempHp, ac, props.player.character.hp, props.player.character.maxHp, props.player.character.tempHp, props.player.character.ac])

    useEffect(() => {
        props.player.hidden = hidden
        if (props.isMaster)
            savePlayer()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hidden])

    useEffect(() => {
        setColorMarker(props.player.colorMarker || ColorMarkerEnum.NONE)
    }, [props.player.colorMarker]);

    useEffect(() => {
        setShareHp(props.player.shareHp || false)
    }, [props.player.shareHp]);

    useEffect(() => {
        setInitiative(props.player.initiative ?? 0)
    }, [props.player.initiative]);

    useEffect(() => {
        setShield(props.player.shield ?? 0)
    }, [props.player.shield]);

    useEffect(() => {
        setShieldActive(props.player.shieldActive || false)
    }, [props.player.shieldActive]);

    if (isRowHiddenFromPlayer(props.isMaster, hidden)) {
        return (
            <></>
        )
    }

    function writePlayerHP() {
        if (canSeeHp(npc, props.isMaster, shareHp)) {
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
        if (canSeeHp(npc, props.isMaster, shareHp)) {
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
        if (!hidden) {
            return (<Button bg="blue.100" borderRadius="0px" onClick={() => {
                setHidden(true)
                createHideButton()
            }}><IoEyeSharp/></Button>)
        } else {
            return (
                <Button bg="purple.100" borderRadius="0px" onClick={() => {
                    setHidden(false)
                    createHideButton()
                }}><IoEyeOffSharp/></Button>
            )
        }
    }

    const getColor = (color: ColorMarkerEnum) => markerColor(color)

    // @ts-ignore
    return (
        <div ref={setNodeRef} style={sortableStyle}>
            <Box borderWidth='1px' borderRadius='md' width='100%' marginBottom='0.5rem'
                 padding='0.4rem 0.75rem'
                 background={
                     (dead && !npc) ? 'red.100'
                         : (dead && npc) ? '#e2e2e2'
                             : (props.isTurn) ? '#fff9e1'
                                 : hidden ? 'purple.100'
                                     : '#fafafa'
                 }
                 opacity={(dead && npc) ? 0.55 : 1}
                 borderColor={(props.isTurn) ? '#d69e2e' : 'blackAlpha.200'}
                 borderLeftWidth={(props.isTurn) ? '6px' : '1px'}
                 boxShadow={(props.isTurn) ? '0 0 0 2px #d69e2e' : undefined}>
                <HStack w='100%' spacing={0} align='center'>
                    {props.isMaster && createHideButton()}
                    <Box as='button' type='button'
                         onClick={props.isMaster ? props.onToggle : undefined}
                         flex='1' display='flex' alignItems='center' minW={0}
                         textAlign='left' background={props.isOpen && props.isMaster ? '#ebebeb' : 'transparent'}
                         cursor={props.isMaster ? 'pointer' : 'default'}
                         paddingX='3' paddingY='2' borderRadius='sm'>
                        {
                            colorMarker !== ColorMarkerEnum.NONE &&
                            <><Badge variant='solid' bg={getColor(colorMarker)}
                                     textColor={getColor(colorMarker)}
                                     borderColor='black' borderWidth='1px'
                                     marginRight='0.5rem'
                                     width='2rem'>_</Badge></>
                        }
                        {npc &&
                            <>
                                <Badge colorScheme='green'>NPC</Badge><Box marginRight='0.5rem'/>
                            </>
                        }
                        {write('', props.player.character.name!)}
                        {writePlayerHP()}
                        {hidden &&
                            <>
                                <Box marginLeft='0.5rem'/><Badge colorScheme='teal'>VERSTECKT</Badge><Box
                                marginRight='0.5rem'/>
                            </>
                        }
                        {dead && getDeadIcon()}
                        {effects}
                        <Spacer/>
                        {(!npc || props.isMaster) && write('AC:', acDisplay())}
                        {(!npc || props.isMaster) && divider()}
                        {write('Initiative:', String(props.player.initiative))}
                    </Box>
                    {props.isMaster &&
                        <button className='init-btn init-btn--icon init-drag-handle'
                                ref={setActivatorNodeRef}
                                {...attributes} {...listeners} aria-label='Verschieben'>
                            <MdDragIndicator size={18}/>
                        </button>
                    }
                </HStack>
                {createHPBar()}
                {props.isMaster && props.isOpen &&
                        <Box paddingTop='3'>
                        <div className='init-panel'>
                            <div className='init-panel-card'>
                                <span className='init-panel-title'>Zustände</span>
                                <div className='init-states'>
                                    <Switch size='sm' onChange={() => setBlind(!blind)} isChecked={blind}>Blind</Switch>
                                    <Switch size='sm' onChange={() => setIncapacitated(!incapacitated)} isChecked={incapacitated}>Kampfunfähig</Switch>
                                    <Switch size='sm' onChange={() => setPoison(!poison)} isChecked={poison}>Vergifted</Switch>
                                    <Switch size='sm' onChange={() => setInvisible(!invisible)} isChecked={invisible}>Unsichtbar</Switch>
                                    <Switch size='sm' onChange={() => setDown(!down)} isChecked={down}>Liegend</Switch>
                                    <Switch size='sm' onChange={() => setParalyzed(!paralyzed)} isChecked={paralyzed}>Gelähmt</Switch>
                                    <Switch size='sm' onChange={() => setCharmed(!charmed)} isChecked={charmed}>Bezaubert</Switch>
                                    <Switch size='sm' onChange={() => setPetrified(!petrified)} isChecked={petrified}>Versteinert</Switch>
                                    <Switch size='sm' onChange={() => setDeafened(!deafened)} isChecked={deafened}>Taub</Switch>
                                    <Switch size='sm' onChange={() => setRestrained(!restrained)} isChecked={restrained}>Festgesetzt</Switch>
                                    <Switch size='sm' onChange={() => setFrightened(!frightened)} isChecked={frightened}>Verängstigt</Switch>
                                    <Switch size='sm' onChange={() => setStunned(!stunned)} isChecked={stunned}>Betäubt</Switch>
                                    <Switch size='sm' onChange={() => setGrappled(!grappled)} isChecked={grappled}>Gepackt</Switch>
                                    <Switch size='sm' onChange={() => setUnconscious(!unconscious)} isChecked={unconscious}>Bewusstlos</Switch>
                                    <Switch size='sm' onChange={() => setHex(!hex)} isChecked={hex}>Hex</Switch>
                                    <Switch size='sm' onChange={() => setHexblade(!hexblade)} isChecked={hexblade}>Hexblade</Switch>
                                    <Switch size='sm' onChange={() => setUnarmed(!unarmed)} isChecked={unarmed}>Unbewaffnet</Switch>
                                </div>
                                <div className='init-states-primary'>
                                    <Switch size='sm' onChange={() => setRage(!rage)} isChecked={rage}>Rage</Switch>
                                    <Switch size='sm' onChange={() => setConcentration(!concentration)} isChecked={concentration}>Konzentration</Switch>
                                </div>
                            </div>

                            <div className='init-panel-card'>
                                <span className='init-panel-title'>Rettungswürfe</span>
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
                            </div>

                            <div className='init-panel-card'>
                                <span className='init-panel-title'>Aktionen</span>
                                <Text fontSize='sm' marginBottom='2'>Geschwindigkeit: {geschwindigkeit}</Text>
                                <HStack>
                                    <Text width='90px'>Schaden:</Text>
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
                                <div className='init-actions'>
                                    <button className='init-btn init-btn--danger init-btn--block' onClick={doSchaden}>Schaden</button>
                                    <button className='init-btn init-btn--success init-btn--block' onClick={doHeal}>Heilen</button>
                                </div>
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
                            </div>

                            <div className='init-panel-card'>
                                <span className='init-panel-title'>Werte</span>
                                <VStack align='stretch' spacing='2'>
                                    <HStack>
                                        <Text width='90px'>HP:</Text>
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
                                        <Text width='90px'>Temp HP:</Text>
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
                                        <Text width='90px'>Max HP:</Text>
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
                                        <Text width='90px'>AC:</Text>
                                        <NumberInput defaultValue={props.player.character.ac || 0} min={0}
                                                     onChange={onAcEdit}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='90px'>Initiative:</Text>
                                        <NumberInput min={0} onChange={onInitiativeEdit} value={initiative}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack>
                                        <Text width='90px'>Schild:</Text>
                                        <Switch isChecked={shieldActive}
                                                onChange={(evt) => onShieldToggle(evt.currentTarget.checked)}/>
                                        <NumberInput onChange={onShieldEdit} value={shield} isDisabled={!shieldActive}>
                                            <NumberInputField/>
                                            <NumberInputStepper>
                                                <NumberIncrementStepper/>
                                                <NumberDecrementStepper/>
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    {npc &&
                                        <HStack justifyContent='space-between'>
                                            <Text width='90px'>HP teilen:</Text>
                                            <Switch isChecked={shareHp}
                                                    onChange={(evt) => onShareHpToggle(evt.currentTarget.checked)}/>
                                        </HStack>
                                    }
                                    <button className='init-btn init-btn--danger init-btn--block' onClick={onDelete}>
                                        <DeleteIcon/> Löschen
                                    </button>
                                </VStack>
                            </div>
                        </div>
                        </Box>
                }
            </Box>
        </div>
    )
}

export default App
