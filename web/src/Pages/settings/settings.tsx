import React, {useEffect, useState} from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Link,
    Select,
    useToast,
    VStack
} from "@chakra-ui/react";
import axios from "axios";
import {DeleteIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import WithAuth from "../login/withAuth";
import {Field, FieldProps, Form, Formik, FormikProps} from "formik";
import TitleService from "../../Service/titleService";
import packageJSON from "../../../package.json";
import {Text} from "@chakra-ui/layout";
import {LanguageType} from "./language.type";

const App = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [newPassVal, setNewPassVal] = useState('')
    const [languageSelected, setLanguageSelected] = useState<LanguageType>(LanguageType.en)

    const cancelRef = React.useRef(null)
    const toast = useToast()

    useEffect(() => {
        let lang: LanguageType = LanguageType.en
        const lsData = localStorage.getItem('dnd-character-language')
        if (lsData) {
            if (lsData in LanguageType) {
                lang = LanguageType[lsData as keyof typeof LanguageType]
            } else {
                localStorage.setItem('dnd-character-language', lang.toString())
            }
        } else {
            localStorage.setItem('dnd-character-language', lang.toString())
        }
        setLanguageSelected(lang)
    }, []);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguageSelected(LanguageType[event.target.value as keyof typeof LanguageType])
        localStorage.setItem('dnd-character-language', event.target.value)
    }

    const closePopup = () => {
        setIsOpen(false)
    }

    async function deleteAcc() {
        await axios.delete(process.env.REACT_APP_API_PREFIX + '/api/me/delete')

        window.location.reload()
    }

    const validatePassword = (value: string) => {
        let error
        if (!value || value.length === 0) {
            error = 'Ein Passwort muss angegeben werden'
        }
        return error
    }

    const validateNewPassword = (value: string) => {
        let error
        if (!newPassVal || newPassVal.length < 8) {
            error = 'Das Passwort ist zu kurz! Es muss mind. 8 Zeichen enthalten'
        }
        return error
    }

    const validateNewPasswordRepeat = (value: string) => {
        let error
        if (!value || value !== newPassVal) {
            error = 'Die Passwörter stimmen nicht über ein'
        }
        return error
    }

    return (
        <React.Fragment>
            <TitleService title={'Einstellungen'}/>
            <Center>
                <VStack width='100%'>
                    <Container>
                        <Formik
                            initialValues={{
                                password: '',
                                newPassword: '',
                                newPasswordRepeat: ''
                            }}
                            onSubmit={async (values, actions) => {
                                try {
                                    await axios.put(process.env.REACT_APP_API_PREFIX + '/api/me/password', {
                                        'currPass': values.password,
                                        'newPass': newPassVal
                                    }, {
                                        withCredentials: true,
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    })

                                    actions.setFieldValue('password', '', false)
                                    setNewPassVal('')
                                    actions.setFieldValue('newPassword', '', false)
                                    actions.setFieldValue('newPasswordRepeat', '', false)

                                    toast({
                                        title: 'Passwort wurde geändert',
                                        description: "Das Passwort wurde erfolgreich geändert.",
                                        status: 'success',
                                        duration: 9000,
                                        isClosable: true,
                                    })

                                } catch (e) {
                                    actions.setErrors({
                                        password: 'Das Passwort ist Falsch!'
                                    })
                                }
                            }}
                        >
                            {(props: FormikProps<any>) => (
                                <Form>
                                    <Flex direction="column">
                                        <Field name="password" validate={validatePassword}>
                                            {({field, form}: FieldProps<any>) => (
                                                <FormControl
                                                    isInvalid={form.errors.password !== undefined && form.touched.password !== undefined}>
                                                    <FormLabel htmlFor="password">Aktuelles Passwort</FormLabel>
                                                    <Input {...field} id="pass" type="password"
                                                           autoComplete='current-password'
                                                           placeholder="Aktuelles Passwort"/>
                                                    <FormErrorMessage>{form.errors.password?.toString()}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="newPassword" validate={validateNewPassword}>
                                            {({field, form}: FieldProps<any>) => (
                                                <FormControl mt={3}
                                                             isInvalid={form.errors.newPassword !== undefined && form.touched.newPassword !== undefined}>
                                                    <FormLabel htmlFor="newPassword">Neues Passwort</FormLabel>
                                                    <Input {...field} id="newPass" type="password" value={newPassVal}
                                                           onChange={evt => setNewPassVal(evt.target.value)}
                                                           autoComplete='new-password'
                                                           placeholder="Neues Passwort"/>
                                                    <FormErrorMessage>{form.errors.newPassword?.toString()}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="newPasswordRepeat" validate={validateNewPasswordRepeat}>
                                            {({field, form}: FieldProps<any>) => (
                                                <FormControl mt={3}
                                                             isInvalid={form.errors.newPasswordRepeat !== undefined && form.touched.newPasswordRepeat !== undefined}>
                                                    <FormLabel htmlFor="newPasswordRepeat">Neues Passwort
                                                        Wiederholen</FormLabel>
                                                    <Input {...field} id="newPassRep" type="password"
                                                           autoComplete='new-password'
                                                           placeholder="Neues Passwort Wiederholen"/>
                                                    <FormErrorMessage>{form.errors.newPasswordRepeat?.toString()}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Flex justifyContent="end">
                                            <Button colorScheme="blue" mt={4} ml="auto" type="submit"
                                                    isLoading={props.isSubmitting}>Ändern</Button>
                                        </Flex>
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                    </Container>
                    <Container>
                        <Select value={languageSelected} onChange={handleLanguageChange}>
                            <option value={LanguageType.de} selected={languageSelected === LanguageType.de}>Deutsch</option>
                            <option value={LanguageType.en} selected={languageSelected === LanguageType.en}>Englisch</option>
                        </Select>
                    </Container>
                    <Container>
                        <Button leftIcon={<DeleteIcon/>} borderWidth='1px' borderRadius='lg' colorScheme='red'
                                float='right' position='relative' marginTop='100%' marginBottom='1rem' size='sm' onClick={() => {
                            setIsOpen(true)
                        }}>
                            ACCOUNT LÖSCHEN
                        </Button>

                        <AlertDialog isOpen={isOpen} onClose={closePopup} leastDestructiveRef={cancelRef}>
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        Account Löschen
                                    </AlertDialogHeader>

                                    <AlertDialogBody>
                                        Bist du sicher? Dadurch wird der Account und all deine
                                        Charaktere <b>DAUERHAFT</b> gelöscht!
                                    </AlertDialogBody>

                                    <AlertDialogFooter>
                                        <Button ref={cancelRef} onClick={closePopup}>
                                            Abbrechen
                                        </Button>
                                        <Button colorScheme='red' onClick={async () => {
                                            await deleteAcc()
                                            closePopup()
                                        }} ml={3}>
                                            Löschen
                                        </Button>
                                    </AlertDialogFooter>

                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                    </Container>
                    <Text>
                        Version: {packageJSON.version} &#8226; <Link href='https://github.com/B-Schwarz/dnd-game-assist' isExternal={true}>
                            Github <ExternalLinkIcon mx='2px' />
                        </Link>
                    </Text>
                </VStack>
            </Center>
        </React.Fragment>
    )
}

export default WithAuth(App)
