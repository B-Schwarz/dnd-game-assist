import React, {useEffect, useState} from "react";
import {
    Button,
    GridItem,
    HStack,
    IconButton,
    Text,
    useToast,
    VStack
} from "@chakra-ui/react";
import {DeleteIcon} from "@chakra-ui/icons";
import {Divider} from "@chakra-ui/layout";
import axios from "axios";

const App = () => {

    const [books, setBooks] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const toast = useToast()

    const prefix = process.env.REACT_APP_API_PREFIX

    const getBooks = () => {
        axios.get(prefix + '/api/books')
            .then((r) => setBooks(r.data))
            .catch(() => {
            })
    }

    useEffect(() => {
        getBooks()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const upload = (file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast({title: 'Nur PDF-Dateien', status: 'error', duration: 2500, isClosable: true})
            return
        }
        const fd = new FormData()
        fd.append('book', file)
        setUploading(true)
        axios.post(prefix + '/api/books', fd)
            .then(() => {
                toast({title: 'Buch hochgeladen', status: 'success', duration: 2500, isClosable: true})
                getBooks()
            })
            .catch(() => {
                toast({title: 'Upload fehlgeschlagen', status: 'error', duration: 3000, isClosable: true})
            })
            .finally(() => setUploading(false))
    }

    const remove = (name: string) => {
        axios.delete(prefix + '/api/books/' + encodeURIComponent(name))
            .then(() => {
                toast({title: 'Buch gelöscht', status: 'success', duration: 2500, isClosable: true})
                getBooks()
            })
            .catch(() => {
                toast({title: 'Löschen fehlgeschlagen', status: 'error', duration: 3000, isClosable: true})
            })
    }

    return (
        <GridItem rowSpan={5} colSpan={4}>
            <VStack align='stretch' w='95%' marginX='auto' spacing='1rem'>
                <HStack justifyContent='space-between'>
                    <Text fontSize='lg' fontWeight='bold'>BÜCHER</Text>
                    <HStack>
                        <input ref={fileInputRef} type='file' accept='application/pdf,.pdf' style={{display: 'none'}}
                               onChange={(e) => {
                                   const f = e.currentTarget.files?.[0]
                                   if (f) {
                                       upload(f)
                                   }
                                   e.currentTarget.value = ''
                               }}/>
                        <Button colorScheme='blue' isLoading={uploading}
                                onClick={() => fileInputRef.current?.click()}>PDF hochladen</Button>
                    </HStack>
                </HStack>
                <Divider/>
                <VStack align='stretch' spacing='0.5rem'>
                    {books.length === 0 && <Text color='gray.500'>Keine Bücher vorhanden.</Text>}
                    {books.map((name) => (
                        <HStack key={name} justifyContent='space-between' borderWidth='1px' borderRadius='md'
                                borderColor='blackAlpha.200' padding='0.4rem 0.75rem'>
                            <Text isTruncated>{name}</Text>
                            <IconButton aria-label='Löschen' icon={<DeleteIcon/>} colorScheme='red' size='sm'
                                        onClick={() => remove(name)}/>
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </GridItem>
    )
}

export default App
