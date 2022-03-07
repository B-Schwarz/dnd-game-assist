import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Monster} from "./monster.type";
import MonsterEntry from "./monster-entry";
import {Accordion, Button, HStack, IconButton, Input, StackItem, VStack} from "@chakra-ui/react";
import axios from "axios";
import {AddIcon} from "@chakra-ui/icons";
import TitleService from "../../Service/titleService";
import {Text} from "@chakra-ui/layout";
import {AiOutlineArrowLeft} from "@react-icons/all-files/ai/AiOutlineArrowLeft";
import {AiOutlineArrowRight} from "@react-icons/all-files/ai/AiOutlineArrowRight";

const App = () => {

    const [monster, setMonster] = useState<Monster[]>([])
    const [value, setValue] = useState<Monster[]>([])
    const [isAdminOrMaster, setIsAdminOrMaster] = useState(false)

    const [page, setPage] = useState(1)

    const [disableLeft, setDisableLeft] = useState(true)
    const [disableRight, setDisableRight] = useState(false)

    const items = 30;

    const update = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/list')
            .then((data) => {
                setMonster([])
                setMonster(data.data)
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
            switchPage(monster.filter(d => d.monster.name.toLowerCase().startsWith(val.toLowerCase())), 1)
        } else {
            switchPage(monster, 1)
        }
    }

    const createMonster = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/new')
            .then(() => update())
            .catch(() => {
            })
    }

    const switchPage = (data: Monster[], pPage: number) => {
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
            <TitleService title={'Monster Liste'}/>
            <VStack w='80%' margin='auto'>
                <HStack w='100%'>
                    <Input placeholder='Suchen...' onChange={async (evt) => {
                        await search(evt.currentTarget.value)
                    }}/>
                    {isAdminOrMaster && <IconButton aria-label={'add new monster'} colorScheme='green' icon={<AddIcon/>}
                                                    onClick={createMonster}/>}
                </HStack>
                <Accordion allowToggle w='100%' h='80vh' overflowY='scroll'>
                    {value.map((m: Monster) => {
                            if (!m.hidden)
                                return (<MonsterEntry m={m} u={update} e={isAdminOrMaster} key={m._id}/>)
                            else
                                return <React.Fragment key={m._id}/>
                        }
                    )}
                </Accordion>
                <StackItem>
                    <HStack spacing='1rem'>
                        <Button disabled={disableLeft}
                                onClick={() => switchPage(monster, page - 1)}><AiOutlineArrowLeft/></Button>
                        <Text textAlign='center' width='5rem'>{page}</Text>
                        <Button disabled={disableRight}
                                onClick={() => switchPage(monster, page + 1)}><AiOutlineArrowRight/></Button>
                    </HStack>
                </StackItem>
            </VStack>
        </React.Fragment>
    )
}

export default WithAuth(App)
