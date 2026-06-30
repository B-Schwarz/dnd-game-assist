import React, {useEffect, useRef, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider, Text} from "@chakra-ui/react";
import InitiaveEntry from "./initiave-entry";
import {
    Box,
    Center,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";
import {DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, arrayMove, verticalListSortingStrategy} from "@dnd-kit/sortable";
import "./initiative.css";
import { flushSync } from "react-dom";
import {Player} from "./player.type";
import axios from "axios";
import _ from "lodash";
import Add from "./add/add";
import TitleService from "../../Service/titleService";

enum confirmType {
    RESET,
    SORT
}

const App = () => {

    const [player, setPlayer] = useState<Player[]>([])
    const [isMaster, setIsMaster] = useState(false)
    const [round, setRound] = useState<number>(1)
    const [turnBtnActive] = useState<boolean>(false)
    const [turn, setTurn] = useState(0)
    const [accordionIndex, setAccordionIndex] = useState<number>(-1)

    const [updatePing, setUpdatePing] = useState(0)
    const updateTimer = useRef(null)

    const [confirm, setConfirm] = useState<confirmType>()

    const {isOpen, onOpen, onClose} = useDisclosure()
    const {isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose} = useDisclosure()

    const toast = useToast()

    function nextTurn() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/turn/next')
            .then(() => update())
            .catch(() => {
            })
    }

    function prevTurn() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/turn/prev')
            .then(() => update())
            .catch(() => {
            })
    }

    const updatePlayer = (newPlayer: Player[]) => {
        if (player.length === 0) {
            setPlayer(newPlayer)
        } else {
            if (newPlayer.length !== player.length) {
                flushSync(() => setPlayer([]))
                flushSync(() => setPlayer(newPlayer))
            } else {
                for (let i = 0; i < player.length; i++) {
                    if (!_.isEqual(player[i], newPlayer[i])) {
                        flushSync(() => setPlayer([]))
                        flushSync(() => setPlayer(newPlayer))
                        break
                    }
                }
            }
        }
    }

    const get = (master: boolean) => {
        if (master) {
            try {
                axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/master')
                    .then((r) => {
                        updatePlayer(r.data.player)
                        setTurn(r.data.turn)
                    }).catch(() => {
                    setIsMaster(false)
                })
            } catch (_) {
                setIsMaster(false)
            }
        } else {
            axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative')
                .then((r) => {
                    updatePlayer(r.data.player)
                    setTurn(r.data.turn)
                })
                .catch(() => {
                })
        }

        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/round')
            .then((r) => {
                setRound(r.data.round)
            })
            .catch(() => {
            })
    }

    function sort() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/sort')
            .then(() => {
                update()
            }).catch(() => {
        })
    }

    function reset() {
        axios.delete(process.env.REACT_APP_API_PREFIX + '/api/initiative/player')
            .then(() => update())
            .catch(() => {
            })
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/round', {round: 1})
            .catch(() => {
            })
        setRound(1)
    }

    const update = () => {
        get(isMaster)
    }

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 5}}))

    // Drag-to-reorder: move the dragged entry to the drop position, optimistically
    // update the local order, then persist it and refetch the authoritative state.
    const onDragEnd = (event: DragEndEvent) => {
        const {active, over} = event
        if (!over || active.id === over.id) {
            return
        }
        const from = player.findIndex((p) => p.turnId === active.id)
        const to = player.findIndex((p) => p.turnId === over.id)
        if (from < 0 || to < 0) {
            return
        }
        setPlayer(arrayMove(player, from, to))
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/reorder', {from, to})
            .then(() => update())
            .catch(() => update())
    }

    // Push every board entry's current HP to its character sheet. Entries that are
    // not real characters (e.g. monsters) are skipped server-side.
    function saveHealthToSheets() {
        const updates = player
            .filter((p) => p && p.id && p.character && p.character.hp !== undefined)
            .map((p) => ({charID: p.id, hp: p.character.hp}))

        if (updates.length === 0) {
            return
        }

        axios.post(process.env.REACT_APP_API_PREFIX + '/api/char/hp/bulk', {updates})
            .then(() => {
                toast({
                    title: 'Leben gespeichert',
                    description: `${updates.length} Charakterbögen aktualisiert.`,
                    status: 'success',
                    duration: 2500,
                    isClosable: true
                })
            })
            .catch(() => {
                toast({
                    title: 'Fehler',
                    description: 'Leben konnte nicht gespeichert werden.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                })
            })
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/master')
            .then(() => {
                setIsMaster(true)
                get(true)
            })
            .catch(() => {
            })

        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/round')
            .then((r) => {
                setRound(r.data.round)
            })
            .catch(() => {
            })

        // @ts-ignore
        return () => clearTimeout(updateTimer.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // @ts-ignore
        updateTimer.current = setTimeout(() => {
            if (!isMaster) {
                setUpdatePing((updatePing) => updatePing + 1)
            }
        }, 350)

        update()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaster, updatePing])

    // When the turn changes, collapse whatever entry was open and expand the
    // entry whose turn it now is, so its additional info is shown automatically.
    useEffect(() => {
        setAccordionIndex(turn)
    }, [turn])

    // Master hotkeys: J steps to the previous turn, K to the next. Ignored while
    // typing in a field or when a modifier is held.
    useEffect(() => {
        if (!isMaster) {
            return
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) {
                return
            }
            const target = e.target as HTMLElement | null
            const tag = target?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
                return
            }

            const key = e.key.toLowerCase()
            if (key === 'j') {
                e.preventDefault()
                prevTurn()
            } else if (key === 'k') {
                e.preventDefault()
                nextTurn()
            }
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaster])

    return (
        <>
            <TitleService title={'Initiative'}/>
                <VStack>
                    <Text fontSize='2xl' className='init-round'>Runde: {round}</Text>
                    { isMaster &&
                        <Box>
                            <div className='init-controls'>
                                <button className='init-btn init-btn--success' onClick={saveHealthToSheets}>Leben speichern</button>
                                <button className='init-btn init-btn--danger' onClick={() => {
                                    setConfirm(confirmType.RESET)
                                    onConfirmOpen()
                                }}>Board Löschen</button>
                                <button className='init-btn' onClick={() => {
                                    setConfirm(confirmType.SORT)
                                    onConfirmOpen()
                                }}>Sortieren</button>
                                <div className='init-segmented'>
                                    <button className='init-btn init-btn--icon' onClick={prevTurn} disabled={turnBtnActive} aria-label='Vorheriger'><ChevronLeftIcon boxSize={5}/></button>
                                    <button className='init-btn init-btn--icon' onClick={nextTurn} disabled={turnBtnActive} aria-label='Nächster'><ChevronRightIcon boxSize={5}/></button>
                                </div>
                                <button className='init-btn init-btn--primary' onClick={onOpen}>Hinzufügen</button>
                            </div>
                        </Box>
                    }
                    <Divider marginTop='1rem'/>
                </VStack>
            <Center marginTop='2rem'>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={player.map((p) => p.turnId)} strategy={verticalListSortingStrategy}>
                        <Box width='80%'>
                            {
                                player.map((m, i) => (
                                    <InitiaveEntry player={m} statusEffects={m.statusEffects} isMaster={isMaster} isTurn={i === turn}
                                                   isOpen={accordionIndex === i}
                                                   onToggle={() => setAccordionIndex((prev) => prev === i ? -1 : i)}
                                                   update={update} key={m.turnId}/>
                                ))
                            }
                        </Box>
                    </SortableContext>
                </DndContext>
            </Center>
            <Modal isOpen={isOpen} onClose={() => {
                onClose()
            }} closeOnEsc isCentered
                   scrollBehavior='inside'>
                <ModalOverlay/>
                <ModalContent maxW='35rem' maxH='40rem'>
                    <Add u={update}/>
                    <ModalFooter>
                        <button className='init-btn' onClick={() => {
                            update()
                            onClose()
                        }}>Schließen</button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isConfirmOpen} onClose={() => {
                onConfirmClose()
            }} closeOnEsc isCentered>
                <ModalOverlay/>
                <ModalContent maxW='35rem' maxH='40rem'>
                    <ModalHeader textAlign='center'>
                        Bist Du sicher?
                    </ModalHeader>
                    <ModalFooter m='auto'>
                        <div className='init-modal-actions'>
                            {
                                confirm === confirmType.SORT && <button className='init-btn init-btn--primary' onClick={() => {
                                    sort()
                                    onConfirmClose()
                                }}>
                                    Sortieren
                                </button>
                            }
                            {
                                confirm === confirmType.RESET && <button className='init-btn init-btn--danger' onClick={() => {
                                    reset()
                                    onConfirmClose()
                                }}>
                                    Board Löschen
                                </button>
                            }
                            <button className='init-btn' onClick={() => {
                                onConfirmClose()
                            }}>Schließen</button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default WithAuth(App)
