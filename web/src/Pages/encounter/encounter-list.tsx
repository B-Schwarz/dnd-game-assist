import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Accordion, Button, HStack, IconButton, Input, StackItem, VStack} from "@chakra-ui/react";
import axios from "axios";
import {AddIcon} from "@chakra-ui/icons";
import TitleService from "../../Service/titleService";
import {Text} from "@chakra-ui/layout";
import {AiOutlineArrowLeft} from "@react-icons/all-files/ai/AiOutlineArrowLeft";
import {AiOutlineArrowRight} from "@react-icons/all-files/ai/AiOutlineArrowRight";
import {EncounterType} from "./encounter.type";
import MonsterEntry from "../monster/monster-entry";
import EncounterEntry from "./encounter-entry";

const App = () => {

    const [encounter, setEncounter] = useState<EncounterType[]>([])
    const [value, setValue] = useState<EncounterType[]>([])
    const [isAdminOrMaster, setIsAdminOrMaster] = useState(false)

    const [page, setPage] = useState(1)

    const [disableLeft, setDisableLeft] = useState(true)
    const [disableRight, setDisableRight] = useState(false)

    const items = 30;

    const update = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/encounter/list')
            .then((data) => {
                setEncounter([])
                setEncounter(data.data)
                switchPage(data.data, 1)
            })
            .finally(() => {
                axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/admin/master')
                    .then(() => setIsAdminOrMaster(true))
                    .catch(() => {
                    })
            })
    }

    const search = (val: string) => {
        if (val.length > 0) {
            switchPage(encounter.filter(d => d.name.toLowerCase().startsWith(val.toLowerCase())), 1)
        } else {
            switchPage(encounter, 1)
        }
    }

    const createEncounter = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/encounter/new')
            .then(() => update())
            .catch(() => {
            })
    }

    const switchPage = (data: EncounterType[], pPage: number) => {
        if (pPage > 0) {
            const temp = data.slice(items * (pPage - 1), items * pPage)
            if (temp.length > 0) {
                setValue(temp)
                setPage(pPage)
            }

            if (pPage > 1) {
                setDisableLeft(false)
            } else {
                setDisableLeft(true)
            }

            if (data[items * pPage] === undefined) {
                setDisableRight(true)
            } else {
                setDisableRight(false)
            }
        }
    }

    useEffect(() => {
        update()
    }, [])

    return (
        <React.Fragment>
            <TitleService title={'Encounter Liste'}/>
            <VStack w='80%' margin='auto'>
                <HStack w='100%'>
                    <Input placeholder='Suchen...' onChange={async (evt) => {
                        await search(evt.currentTarget.value)
                    }}/>
                    {isAdminOrMaster && <IconButton aria-label={'add new encounter'} colorScheme='green' icon={<AddIcon/>}
                                                    onClick={createEncounter}/>}
                </HStack>
                <Accordion allowToggle w='100%' h='80vh' overflowY='scroll'>
                    {value.map((m: EncounterType) => {
                        return (<EncounterEntry m={m} u={update} e={isAdminOrMaster} key={m._id}/>)
                        }
                    )}
                </Accordion>
                <StackItem>
                    <HStack spacing='1rem'>
                        <Button disabled={disableLeft}
                                onClick={() => switchPage(encounter, page - 1)}><AiOutlineArrowLeft/></Button>
                        <Text textAlign='center' width='5rem'>{page}</Text>
                        <Button disabled={disableRight}
                                onClick={() => switchPage(encounter, page + 1)}><AiOutlineArrowRight/></Button>
                    </HStack>
                </StackItem>
            </VStack>
        </React.Fragment>
    )
}

export default WithAuth(App)
