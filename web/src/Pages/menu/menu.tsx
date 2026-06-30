import React, {useEffect, useState} from "react";
import {Box, Button, HStack, Spacer, Tag} from "@chakra-ui/react";
import {SelectedEnum} from "./selected.enum";
import {Divider} from "@chakra-ui/react";
import {Link as ReactRouterLink, useNavigate} from "react-router-dom";
import {SettingsIcon, WarningTwoIcon} from "@chakra-ui/icons";
import axios from "axios";
import {MdLogout} from "react-icons/md";
import {MenuButtonType} from "./menu-button.type";

const Menu = (props: { selected: SelectedEnum; }) => {

    // Monster and Encounter are master-only tabs (master: true); they stay
    // hidden until the /api/me/master probe confirms the role.
    const btn: MenuButtonType[] = [
        {
            name: 'Character',
            selected: SelectedEnum.CHARACTER
        }, {
            name: 'Initiative',
            selected: SelectedEnum.INITIATIVE
        }, {
            name: 'Monster',
            selected: SelectedEnum.MONSTER,
            master: true
        }, {
            name: 'Encounter',
            selected: SelectedEnum.ENCOUNTER,
            master: true
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

    const [isMaster, setIsMaster] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/master')
            .then(() => setIsMaster(true)).catch(() => {})
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/admin')
            .then(() => setIsAdmin(true)).catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Derive the visible buttons from the role probes; the master-only tabs
    // keep their position and the Admin tab is appended at the end.
    const buttons: MenuButtonType[] = [
        ...btn.filter(b => !b.master || isMaster),
        ...(isAdmin ? [adminBtn] : [])
    ]

    const navigate = useNavigate()

    const logout = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/auth/logout')
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
                                as={ReactRouterLink} to={b.link ? '/' + b.link.toLowerCase() : '/' + b.name.toLowerCase()}
                                style={{ textDecoration: "none" }} replace>
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
