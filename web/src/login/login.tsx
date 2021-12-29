import {
    Button,
    Center,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input
} from '@chakra-ui/react'
import {Field, FieldProps, Form, Formik, FormikProps} from 'formik'
import React from 'react'
import {useNavigate} from "react-router-dom";
import axios from "axios";

interface LoginProps {
}

const validateName = (value: string) => {
    let error
    if (!value || value.length === 0) {
        error = 'Ein Name muss angegeben werden'
    }
    return error
}

const validatePassword = (value: string) => {
    let error
    if (!value || value.length === 0) {
        error = 'Ein Passwort muss angegeben werden'
    }
    return error
}

const Login: React.FC<LoginProps> = () => {
    const navigate = useNavigate()

    return (
        <Center w="100vw" h="100vh">
            <Flex w="sm" boxShadow="base" borderRadius="md" padding={8} direction="column">
                <Heading textAlign="center" mb={5}>Login</Heading>
                <Formik
                    initialValues={{
                        name: '',
                        password: ''
                    }}
                    onSubmit={async (values, actions) => {
                        try {
                        const res = await axios.post('/api/auth/login/', {
                            username: values.name,
                            password: values.password
                        })

                        if (res.status === 200) {
                            navigate('/character')
                        }
                        } catch(e) {
                            actions.setErrors({
                                name: 'Falsches Passwort oder unbekannter Benutzer',
                                password: 'Falsches Passwort oder unbekannter Benutzer'
                            })
                        }
                    }}
                >
                    {(props: FormikProps<any>) => (
                        <Form>
                            <Flex direction="column">
                                <Field name="name" validate={validateName}>
                                    {({field, form}: FieldProps<any>) => (
                                        <FormControl
                                            isInvalid={form.errors.name !== undefined && form.touched.name !== undefined}>
                                            <FormLabel htmlFor="name">Benutzername</FormLabel>
                                            <Input {...field} id="name" placeholder="Name"/>
                                            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="password" validate={validatePassword}>
                                    {({field, form}: FieldProps<any>) => (
                                        <FormControl mt={3}
                                                     isInvalid={form.errors.password !== undefined && form.touched.password !== undefined}>
                                            <FormLabel htmlFor="password">Passwort</FormLabel>
                                            <Input {...field} id="password" type="password" placeholder="Passwort"/>
                                            <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                                <Flex justifyContent="end">
                                    <Button colorScheme="blue" mt={4} ml="auto" type="submit"
                                            isLoading={props.isSubmitting}>Login</Button>
                                </Flex>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Flex>
        </Center>
    )
}

export default Login
