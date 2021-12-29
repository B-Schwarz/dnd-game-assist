import React, {useEffect, useState} from 'react'

import axios from "axios";
import {
    AlertDialog, AlertDialogBody,
    AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay,
    Button, ButtonGroup,
    Center,
    Heading, HStack, Text
} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {Divider} from "@chakra-ui/layout";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons"
import WithAuth from "../login/withAuth";

const App = () => {

    const [ownCharData, setOwnCharData] = useState([])
    const [charData, setCharData] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [isOwn, setIsOwn] = useState(false)
    const [deleteID, setDeleteID] = useState('')

    const navigate = useNavigate()
    const cancelRef = React.useRef()

    const closePopup = () => setIsOpen(false)

    function getOwnChars() {
        return axios.get('/api/charlist/me')
    }

    function getChars() {
        return axios.get('/api/charlist')
    }

    async function deleteChar() {
        if (isOwn) {
            await axios.delete('/api/char/me/' + deleteID)
        } else {
            await axios.delete('/api/char/' + deleteID)
        }

        window.location.reload()
    }

    useEffect(() => {
        getOwnChars()
            .then(r => {
                setOwnCharData([])
                for (let char of r.data) {
                    // @ts-ignore
                    setOwnCharData(ownCharData => [...ownCharData, char])
                }
            })
            .catch(() => {
            })
    }, [])

    useEffect(() => {
        getChars()
            .then(r => {
                setCharData([])
                for (let char of r.data) {
                    if (ownCharData.filter(c => c['_id'] === char['_id']).length === 0) {
                        // @ts-ignore
                        setCharData(charData => [...charData, char])
                    }
                }
            })
            .catch(() => {
            })
    }, [ownCharData])

    function openCharacter(id: string) {
        navigate("/character/" + id)
    }

    async function createCharacter() {
        const response = await axios.get('/api/char/new')
        return response.data.id
    }

    return (
        <>
            <Center marginBottom={'1rem'}>
                <Heading>
                    Meine Charactere
                </Heading>
            </Center>
            {
                ownCharData.map((item) => (
                    <Center key={item['_id']}>
                        <ButtonGroup isAttached width='85%'>
                            <Button key={item['_id']} borderWidth='1px' borderRadius='lg' width='100%'
                                    onClick={() => openCharacter(item['_id'])}>
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
                            <Button key={item['_id'] + '-del'} borderWidth='1px' borderRadius='lg' colorScheme='red'
                                    onClick={() => {
                                        setDeleteID(item['_id'])
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
                        charData.map((item) => (
                            <Center key={item['_id']}>
                                <ButtonGroup isAttached width='85%'>
                                    <Button key={item['_id']} borderWidth='1px' borderRadius='lg' width='100%'
                                            onClick={() => openCharacter(item['_id'])}>
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
                                    <Button key={item['_id'] + '-del'} borderWidth='1px' borderRadius='lg'
                                            colorScheme='red'
                                            onClick={() => {
                                                setDeleteID(item['_id'])
                                                setIsOwn(true)
                                                setIsOpen(true)
                                            }}>
                                        <DeleteIcon/>
                                    </Button>
                                </ButtonGroup>
                            </Center>
                        ))
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
