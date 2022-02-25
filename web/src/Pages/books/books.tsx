import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Button, Center, VStack} from "@chakra-ui/react";
import axios from "axios";
import TitleService from "../../Service/titleService";

const App = () => {

    const [books, setBooks] = useState<string[]>([])

    const getBooks = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/books')
            .then((r) => {
                setBooks(r.data)
            })
            .catch(() => {
            })
    }

    const openBook = (b: string) => {
        window.open(process.env.REACT_APP_API_PREFIX + '/api/books/' + b)
    }

    useEffect(() => {
        getBooks()
    }, [])

    return (
        <React.Fragment>
            <TitleService title={'Bücher'}/>
            <Center>
                <VStack>
                    {books.map((value, index) => (
                        <Button w='100%' key={index} onClick={() => openBook(value)}>{value}</Button>
                    ))}
                </VStack>
            </Center>
        </React.Fragment>
    )

}

export default WithAuth(App)
