import React, {useEffect, useState} from 'react'

import axios from "axios";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    ButtonGroup,
    Center,
    Heading,
    HStack,
    Text
} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {Divider} from "@chakra-ui/layout";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons"
import WithAuth from "../login/withAuth";
import {Player} from "../initiative/player.type";

const App = () => {

    const [ownCharData, setOwnCharData] = useState<Player[]>([])
    const [charData, setCharData] = useState<Player[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isOwn, setIsOwn] = useState(false)
    const [deleteID, setDeleteID] = useState('')
    const [isMaster, setIsMaster] = useState(false)

    const navigate = useNavigate()
    const cancelRef = React.useRef()

    const closePopup = () => setIsOpen(false)

    function getOwnChars() {
        return axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist/me')
    }

    function getChars() {
        return axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist')
    }

    async function deleteChar() {
        if (isOwn) {
            await axios.delete(process.env.REACT_APP_API_PREFIX + '/api/char/me/' + deleteID)
        } else {
            await axios.delete(process.env.REACT_APP_API_PREFIX + '/api/char/' + deleteID)
        }

        window.location.reload()
    }

    const updateOwnCharList = () => {
        getOwnChars()
            .then(r => {
                setOwnCharData([])
                setOwnCharData([...r.data])
            })
            .catch(() => {
            })
    }

    const updateOtherCharList = () => {
        getChars()
            .then(r => {
                setCharData([])
                setCharData([...r.data])
            })
            .catch(() => {
            })
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/master')
            .then(() => {
                setIsMaster(true)
            })
            .catch(() => {})
            .finally(() => {
                updateOwnCharList()
                updateOtherCharList()
            })
    }, [])

    function openCharacter(id: string) {
        navigate("/character/" + id)
    }

    async function createCharacter() {
        const response = await axios.get(process.env.REACT_APP_API_PREFIX + '/api/char/new')
        return response.data.id
    }

    const setNPC = (p: Player) => {
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/char/npc/toggle', {
            charID: p.id
        })
            .then(() => updateOwnCharList())
            .catch((e) => {console.log(e)})
    }

    return (
        <>
            <Center marginBottom={'1rem'}>
                <Heading>
                    Meine Charactere
                </Heading>
            </Center>
            {
                ownCharData.map((item: Player) => (
                    <Center key={item.id}>
                        <ButtonGroup isAttached width='85%'>
                            {isMaster &&
                                <Button borderWidth='1px' colorScheme={item["npc"] ? "teal" : "gray"} width="4rem"
                                        borderRadius='lg'
                                        onClick={() => setNPC(item)}>{item["npc"] && <>NPC</>}{!item["npc"] && <>PC</>}</Button>}
                            <Button borderWidth='1px' borderRadius='lg' width='100%'
                                    onClick={() => openCharacter(item.id)}>
                                <HStack>
                                    <Text color='gray'>Name:</Text>
                                    <Text>{(item['character'] && item['character']['name']) || 'N/A'},</Text>
                                    <Text color='gray'>Klasse:</Text>
                                    <Text>{(item['character'] && item['character']['classLevel']) || 'N/A'},</Text>
                                    <Text color='gray'>Rasse:</Text>
                                    <Text>{(item['character'] && item['character']['race']) || 'N/A'},</Text>
                                    <Text color='gray'>Player:</Text>
                                    <Text>{(item['character'] && item['character']['playerName']) || 'N/A'}</Text>
                                </HStack>
                            </Button>
                            <Button borderWidth='1px' borderRadius='lg' colorScheme='red'
                                    onClick={() => {
                                        setDeleteID(item.id)
                                        setIsOwn(true)
                                        setIsOpen(true)
                                    }}>
                                <DeleteIcon/>
                            </Button>
                        </ButtonGroup>
                    </Center>
                ))
            }
            <Center>
                <Button width='85%' marginBlock='0.25rem' colorScheme='blue' onClick={async () => {
                    const id = await createCharacter()
                    openCharacter(id)
                }}>
                    <AddIcon marginRight='0.25rem'/> Neuer Charakter
                </Button>
            </Center>
            {charData.length > 0 &&
                <>
                    <Divider marginTop={'0.5rem'} marginBottom={'0.5rem'}/>
                    <Center marginBottom={'1rem'}>
                        <Heading>
                            Alle Charactere
                        </Heading>
                    </Center>
                    {
                        charData.map((item: Player) => {
                            if (item.npc && !isMaster) {
                                return (
                                    <></>
                                )
                            } else {
                                return (
                                    <Center key={item.id}>
                                        <ButtonGroup isAttached width='85%'>
                                            <Button key={item.id} borderWidth='1px' borderRadius='lg' width='100%'
                                                    bg={item.npc ? "rgba(49,150,148,0.60)" : "#ebf0f5"}
                                                    onClick={() => openCharacter(item.id)}>
                                                <HStack>
                                                    <Text color='gray'>Name:</Text>
                                                    <Text>{(item['character'] && item['character']['name']) || 'N/A'},</Text>
                                                    <Text color='gray'>Klasse:</Text>
                                                    <Text>{(item['character'] && item['character']['classLevel']) || 'N/A'},</Text>
                                                    <Text color='gray'>Rasse:</Text>
                                                    <Text>{(item['character'] && item['character']['race']) || 'N/A'},</Text>
                                                    <Text color='gray'>Player:</Text>
                                                    <Text>{(item['character'] && item['character']['playerName']) || 'N/A'}</Text>
                                                </HStack>
                                            </Button>
                                            <Button borderWidth='1px' borderRadius='lg'
                                                    colorScheme='red'
                                                    onClick={() => {
                                                        setDeleteID(item.id)
                                                        setIsOwn(true)
                                                        setIsOpen(true)
                                                    }}>
                                                <DeleteIcon/>
                                            </Button>
                                        </ButtonGroup>
                                    </Center>
                                )
                            }
                        })
                    }
                </>
            }

            <AlertDialog isOpen={isOpen} onClose={closePopup} leastDestructiveRef={cancelRef.current}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Delete Character
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Bist du sicher?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef.current} onClick={closePopup}>
                                Abbrechen
                            </Button>
                            <Button colorScheme='red' onClick={async () => {
                                await deleteChar()
                                closePopup()
                            }} ml={3}>
                                Löschen
                            </Button>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default WithAuth(App)
