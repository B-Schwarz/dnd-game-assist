import React, {useEffect} from "react";
import {Box, Button} from "@chakra-ui/react";
import {SelectedEnum} from "./selected.enum";
import {Divider} from "@chakra-ui/layout";
import {useNavigate} from "react-router-dom";

const Menu = (props: { selected: SelectedEnum; }) => {

    const btn = [
        {
            name: 'Character',
            selected: SelectedEnum.CHARACTER
        }, {
            name: 'Initiative',
            selected: SelectedEnum.INITIATIVE
        }]

    const navigate = useNavigate()

    return (
        <>
            <Box padding='0.2rem'>
                {
                    btn.map((b) => (
                        <Button key={b.selected} colorScheme='gray'
                                variant={props.selected === b.selected ? 'solid' : 'ghost'}
                                onClick={() => {
                                    navigate(`/${b.name.toLowerCase()}`)
                                }}>
                            {b.name}
                        </Button>
                    ))
                }
            </Box>
            <Divider/>
        </>
    )

}

export default Menu
