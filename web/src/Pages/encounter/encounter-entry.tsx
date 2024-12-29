import React, {useEffect, useState} from "react";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Input,
    Select, Spacer,
    Stack,
    StackItem,
    Switch,
    Table,
    Tbody,
    Text,
    Th,
    Thead,
    Tr,
    useToast
} from "@chakra-ui/react"
import _ from "lodash";
import {AddIcon, DeleteIcon, EditIcon, ViewOffIcon} from "@chakra-ui/icons";
import {IoSaveSharp} from "react-icons/io5";
import axios from "axios";
import {EncounterType} from "./encounter.type";
import {Monster} from "../monster/monster.type";


// m: Monster of the card
// u: Update function to reload
// e: If the user is permitted to edit
const App = (props: { m: EncounterType, u: () => void, e: boolean }) => {

    const [encounter, setEncounter] = useState<EncounterType>(props.m)
    const [edit, setEdit] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [watched, setWatched] = useState(false)

    const [name, setName] = useState(props.m.name)
    const [amount, setAmount] = useState<number>(1)
    const [hide, setHide] = useState<boolean>(false)
    const [monster, setMonster] = useState<string>("")
    const [monsterList, setMonsterList] = useState<Monster[]>([])

    const cancelRef = React.useRef(null)
    const toast = useToast()

    const closePopup = () => setIsOpen(false)

    const addMonster = () => {
        const newEncounter = {
            monster: monster,
            hidden: hide,
            amount: amount
        }

        encounter.encounter.push(newEncounter)

        save()
    }

    const resolveMonsterName = () => {
        for (const monster of encounter.encounter) {
           axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/' + monster.monster)
               .then(res => res.data)
               .then(mon => {
                   monster.name = mon.monster.name
                   console.log(mon.monster.name)
               })
               .catch(() => {})
        }
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/list')
            .then((data) => {
                setMonsterList(data.data)
            })

        resolveMonsterName()
    }, []);

    const save = () => {
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/encounter', {
            encounterID: encounter._id,
            encounter: encounter,
            name: name
        })
            .then(() => {
                toast({
                    description: encounter.name + ' wurde gespeichert!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                })
            })
            .catch(() => {
        })
        setEdit(false)
        props.u()
        resolveMonsterName()
    }

    const deleteEncounter = () => {
        axios.delete(process.env.REACT_APP_API_PREFIX + `/api/encounter/${encounter._id}`)
            .then(() => props.u())
            .catch(() => {
            })
    }

    const divide = () => {
        return (
            <hr color="#c1040e"/>
        )
    }

    const editName = () => {
        return (
            <Stack direction={edit ? 'column' : 'row'} w='100%'><Text fontWeight='bold'>{encounter.name}:</Text>
                {edit && <StackItem><Input defaultValue={name} onChange={(evt) => setName(evt.currentTarget.value)}/></StackItem> }
                {!edit && <StackItem><React.Fragment>
                    <Text maxWidth="65vw" wordBreak="break-word">
                        {name}
                    </Text>
                </React.Fragment></StackItem> }
            </Stack>

        )
    }

    const changeAmount = (amount: string, index: number) => {
        encounter.encounter[index].amount = Number(amount)
    }

    const deleteMonster = (index: number) => {
        encounter.encounter.splice(index, 1)
        // @ts-ignore
        document.getElementById("monster-"+index).style.backgroundColor = "IndianRed"
    }

    return (
        <React.Fragment>
            <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                           padding='0.4rem 0.75rem' borderColor='blackAlpha.200'>
                <h2>
                    <AccordionButton onClick={() => setWatched(true)}>
                            <Text fontSize='xl' textAlign='left'>{name}</Text>
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    {edit && editName()}
                    <Flex marginTop='1rem'/>
                    {divide()}
                    <Grid templateColumns='repeat(4, 1fr) 2rem' gap={3} marginTop='1rem' marginBottom='1rem'>
                        <GridItem colSpan={4}>
                            <Table size='sm'>
                                <Thead>
                                    <Tr>
                                        <Th>Anzahl</Th>
                                        <Th>Versteckt</Th>
                                        <Th width={"70%"} >Monster</Th>
                                    </Tr>
                                    {encounter.encounter.map((enc, index) => {
                                        return (<Tr id={"monster-"+index} key={index}>
                                            <Th>
                                                {!edit && enc.amount}
                                                {edit && <Input type={"number"} defaultValue={enc.amount} onChange={(evt) => changeAmount(evt.currentTarget.value, index)}/>}
                                            </Th>
                                            <Th>{enc.hidden && <ViewOffIcon boxSize={4} marginLeft={"24%"}/>}</Th>
                                            <Th>
                                                <Grid templateColumns={'repeat(4, 1fr) 2rem'}>
                                                    <GridItem colSpan={4}>
                                                        {enc.name}
                                                    </GridItem>
                                                    <GridItem>
                                                        {edit && <IconButton aria-label={'delete'} colorScheme='red' icon={<DeleteIcon/>}
                                                                             onClick={() => deleteMonster(index)}/>}
                                                    </GridItem>
                                                </Grid>
                                            </Th>
                                        </Tr>)
                                    })}
                                    <Tr>
                                        <Th><Input type={"number"} value={amount}
                                                   onChange={(evt) => setAmount(Number(evt.currentTarget.value))}/></Th>
                                        <Th><Switch  type={"checkbox"} checked={hide}
                                                   onChange={(evt) => setHide(evt.currentTarget.checked)}/></Th>
                                        <Th><Stack direction='row'>
                                            <Select placeholder={"Monster"} value={monster} onChange={(evt) => setMonster(evt.currentTarget.value)}>
                                                {monsterList.map((monster, index) => (
                                                    <option value={monster._id} key={index}>{monster.monster.name}</option>
                                                ))}
                                            </Select>
                                            <IconButton marginLeft={"1rem"} aria-label={'add new monster'} colorScheme='green' icon={<AddIcon/>}
                                                        onClick={addMonster}/>
                                        </Stack>
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                </Tbody>
                            </Table>
                        </GridItem>
                        {props.e &&
                            <GridItem>
                                <IconButton aria-label={'edit'} icon={<EditIcon/>} onClick={() => setEdit(!edit)}/>
                                <IconButton aria-label={'save'} icon={<IoSaveSharp/>} onClick={save}
                                            marginTop='0.5rem'/>
                                <IconButton aria-label={'delete'} colorScheme='red' icon={<DeleteIcon/>}
                                            onClick={() => setIsOpen(true)} marginTop='0.5rem'/>
                            </GridItem>
                        }
                    </Grid>
                    {divide()}
                    <Flex marginTop='1rem'/>

                    <Flex marginTop='1rem'/>
                    {divide()}
                    <Flex marginTop='1rem'/>

                </AccordionPanel>
            </AccordionItem>

            <AlertDialog isOpen={isOpen} onClose={closePopup} leastDestructiveRef={cancelRef}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Monster Löschen?
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Bist du sicher, das du den "{encounter.name}" löschen willst?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={closePopup}>
                                Abbrechen
                            </Button>
                            <Button colorScheme='red' onClick={() => {
                                deleteEncounter()
                                closePopup()
                            }} ml={3}>
                                Löschen
                            </Button>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </React.Fragment>
    )

}

export default App
