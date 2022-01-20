import React, {useEffect, useState} from "react";
import {
    Accordion,
    AccordionButton,
    AccordionItem, AccordionPanel,
    Box,
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    GridItem,
    Input, Switch,
    Text,
    VStack
} from "@chakra-ui/react";
import {Divider} from "@chakra-ui/layout";
import axios from "axios";
import {User} from "./user.type";

const App = () => {

    const [user, setUser] = useState<User[]>([])

    const [regUser, setRegUser] = useState("")
    const [regUserPass, setRegUserPass] = useState("")
    const [regUserPassWdh, setRegUserPassWdh] = useState("")

    const [wrong, setWrong] = useState(false)
    const [duplicate, setDuplicate] = useState(false)

    const getUser = () => {
        axios.get('/api/user')
            .then((r) => {
                setUser(r.data)
            })
    }

    const doRegister = () => {
        if (regUserPass === regUserPassWdh) {
            axios.post('/api/auth/register', {
                username: regUser,
                password: regUserPass
            }).then(() => {
                setWrong(false)
                setDuplicate(false)
            }).catch(() => {
                setDuplicate(true)
            })
        } else {
            setWrong(true)
        }
    }

    const setAdmin = (id: string, val: boolean) => {
        axios.put('/api/user/admin', {userID: id, admin: val})
            .then(() => {
                getUser()
            })
            .catch(() => {})
    }

    const setMaster = (id: string, val: boolean) => {
        axios.put('/api/user/master', {userID: id, master: val})
            .then(() => {
                getUser()
            })
            .catch(() => {})
    }

    useEffect(() => {
        getUser()
    }, [])

    return (
        <>
            <GridItem rowSpan={1} colSpan={2}>
                <VStack w='80%'>
                    <Text>REGISTER</Text>
                    <FormControl isInvalid={duplicate}>
                        <Input placeholder='Username' minLength={3} value={regUser}
                               onChange={(val) => setRegUser(val.currentTarget.value)}/>
                        {duplicate &&
                            <FormErrorMessage>
                                Dieser Username existiert bereits
                            </FormErrorMessage>
                        }
                    </FormControl>
                    <FormControl isInvalid={wrong}>
                        <Input placeholder='Password' minLength={8} type='password' value={regUserPass} id='reg-pass'
                               autoComplete='new-password' onChange={(val) => setRegUserPass(val.currentTarget.value)}/>
                        <Input placeholder='Password Wiederholen' minLength={8} type='password' value={regUserPassWdh} id='reg-pass-wdh'
                               onChange={(val) => setRegUserPassWdh(val.currentTarget.value)}/>
                        {wrong && <FormErrorMessage>
                            Die Passwörter stimmen nicht überein
                        </FormErrorMessage>}
                    </FormControl>
                    <Button onClick={doRegister}>Register</Button>
                </VStack>
            </GridItem>
            {/*Not Yet Implemented*/}
            <GridItem rowSpan={1} colSpan={2}/>
            <GridItem rowSpan={4} colSpan={4}>
                <Divider/>
                <Center>
                    <Accordion w='80%' allowToggle h='65vh' marginTop='1rem' overflowY='scroll'>
                        {
                            user.map((value: User, index) => (
                                <AccordionItem key={index} borderWidth='1px' borderRadius='md' width='100%'
                                               padding='0.4rem 0.75rem' borderColor='blackAlpha.200'>
                                    <h2>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>
                                                {value.name}
                                            </Box>
                                        </AccordionButton>
                                    </h2>

                                    <AccordionPanel>
                                        <Switch isChecked={value.admin}
                                            onChange={(val) => setAdmin(value._id, val.currentTarget.checked)}>
                                            Admin
                                        </Switch><br/>
                                        <Switch isChecked={value.master}
                                                onChange={(val) => setMaster(value._id, val.currentTarget.checked)}>
                                            Master
                                        </Switch><br/>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))
                        }
                    </Accordion>
                </Center>
            </GridItem>
        </>
    )

}

export default App
