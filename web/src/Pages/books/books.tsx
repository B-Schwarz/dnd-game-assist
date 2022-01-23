import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Button, Center, VStack} from "@chakra-ui/react";
import axios from "axios";

const App = () => {

    const [books, setBooks] = useState<string[]>([])

    const getBooks = () => {
        axios.get('http://localhost:4000/api/books')
            .then((r) => {
                setBooks(r.data)
            })
            .catch(() => {
            })
    }

    const openBook = (b: string) => {
      window.open('http://localhost:4000/api/books/' + b)
    }

    useEffect(() => {
        getBooks()
    }, [])

    return (
        <Center>
            <VStack>
                {books.map((value, index) => (
                    <Button w='100%' key={index} onClick={() => openBook(value)}>{value}</Button>
                ))}
            </VStack>
        </Center>
    )

}

export default WithAuth(App)
