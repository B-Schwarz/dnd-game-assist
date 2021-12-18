import React, {useState} from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button
} from "@chakra-ui/react";
import axios from "axios";
import {DeleteIcon} from "@chakra-ui/icons";
import WithAuth from "../login/withAuth";

const App = () => {

    const [isOpen, setIsOpen] = useState(false)

    const cancelRef = React.useRef()

    const closePopup = () => {
        setIsOpen(false)
    }

    async function deleteAcc() {
        await axios.delete('http://localhost:4000/api/me/delete')

        window.location.reload()
    }

    return (
        <>
            <Button leftIcon={<DeleteIcon />} borderWidth='1px' borderRadius='lg' colorScheme='red'
                    marginLeft='0.25rem' size='sm' onClick={() => {
                setIsOpen(true)
            }}>
                ACCOUNT LÖSCHEN
            </Button>

            <AlertDialog isOpen={isOpen} onClose={closePopup} leastDestructiveRef={cancelRef.current}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Account Löschen
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Bist du sicher? Dadurch wird der Account und all deine Charaktere <b>DAUERHAFT</b> gelöscht!
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef.current} onClick={closePopup}>
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
        </>
    )
}

export default WithAuth(App)
