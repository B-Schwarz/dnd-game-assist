import React, {useEffect, useRef, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider, Text} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
import {
    Accordion,
    Center,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    StackItem,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
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

    return (
        <>
            <TitleService title={'Initiative'}/>
                <VStack>
                    <Text fontSize='2xl' className='init-round'>Runde: {round}</Text>
                    { isMaster &&
                        <StackItem>
                            <div className='init-controls'>
                                <button className='init-btn init-btn--danger' onClick={() => {
                                    setConfirm(confirmType.RESET)
                                    onConfirmOpen()
                                }}>Board Löschen</button>
                                <button className='init-btn' onClick={() => {
                                    setConfirm(confirmType.SORT)
                                    onConfirmOpen()
                                }}>Sortieren</button>
                                <div className='init-segmented'>
                                    <button className='init-btn' onClick={prevTurn} disabled={turnBtnActive}>Vorheriger</button>
                                    <button className='init-btn' onClick={nextTurn} disabled={turnBtnActive}>Nächster</button>
                                </div>
                                <button className='init-btn init-btn--primary' onClick={onOpen}>Hinzufügen</button>
                                <button className='init-btn' onClick={saveHealthToSheets}>Leben speichern</button>
                            </div>
                        </StackItem>
                    }
                    <Divider marginTop='1rem'/>
                </VStack>
            <Center marginTop='2rem'>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry player={m} statusEffects={m.statusEffects} index={i} first={i === 0} last={i === player.length - 1} isMaster={isMaster} isTurn={i === turn} update={update} key={i}/>
                        ))
                    }
                </Accordion>
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
