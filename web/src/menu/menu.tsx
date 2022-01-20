import React, {useEffect, useState} from "react";
import {Box, Button, HStack, Spacer, Tag} from "@chakra-ui/react";
import {SelectedEnum} from "./selected.enum";
import {Divider} from "@chakra-ui/layout";
import {useNavigate} from "react-router-dom";
import {SettingsIcon, WarningTwoIcon} from "@chakra-ui/icons";
import axios from "axios";
import {MdLogout} from "react-icons/md";
import {MenuButtonType} from "./menu-button.type";

const Menu = (props: { selected: SelectedEnum; }) => {

    const btn = [
        {
            name: 'Character',
            selected: SelectedEnum.CHARACTER
        }, {
            name: 'Initiative',
            selected: SelectedEnum.INITIATIVE
        }, {
            name: 'Monster',
            selected: SelectedEnum.MONSTER,
            beta: true
        }, {
            name: 'Einstellungen',
            icon: <SettingsIcon/>,
            color: 'teal',
            selected: SelectedEnum.SETTINGS,
            link: 'settings'
        }, {
            name: 'Bücher',
            selected: SelectedEnum.BOOKS,
            color: 'teal',
            link: 'books'
        }]

    const adminBtn: MenuButtonType = {
        name: 'Admin',
        icon: <WarningTwoIcon/>,
        color: 'red',
        selected: SelectedEnum.ADMIN
    }

    const [buttons, setButtons] = useState<MenuButtonType[]>(btn)

    useEffect(() => {
        axios.get('/api/me/admin')
            .then(() => {
                setButtons(buttons => buttons.filter(b => b.name === adminBtn.name).length === 0 ? [...buttons, adminBtn] : buttons)
            }).catch(() => {})
    }, [])

    const navigate = useNavigate()

    const logout = () => {
        axios.get('/api/auth/logout')
            .then(() => {
                navigate('/')
            })
            .catch(() => {})
    }

    return (
        <>
            <Box padding='0.2rem'>
                <HStack>
                {
                    buttons.map((b) => (
                        <Button key={b.selected} colorScheme={b.color || 'gray'} leftIcon={b.icon || <></>}
                                variant={props.selected === b.selected ? 'solid' : 'ghost'}
                                onClick={() => {
                                    if (b.link) {
                                        navigate(`/${b.link.toLowerCase()}`)
                                    } else {
                                        navigate(`/${b.name.toLowerCase()}`)
                                    }
                                }}>
                            {b.name} {b.beta && <Tag colorScheme='blue' marginLeft='0.25rem'>Beta</Tag>}
                        </Button>
                    ))
                }
                <Spacer/>
                <Button leftIcon={<MdLogout/>} variant='ghost' onClick={logout}>Logout</Button>
                </HStack>
            </Box>
            <Divider marginBottom='1rem'/>
        </>
    )

}

export default Menu
