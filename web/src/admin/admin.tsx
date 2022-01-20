import React, {useState} from "react";
import WithAuth from "../login/withAuth";
import {Button, Grid, GridItem, Text} from "@chakra-ui/react";
import User from "./user";
import {AdminViewEnum} from "./admin-view.enum";

const App = () => {

    const [selected, setSelected] = useState<AdminViewEnum>(AdminViewEnum.USER)

    const showSelected = () => {
        switch (selected) {
            case AdminViewEnum.USER:
                return <User/>
            default:
                return (<Text>Nothing is selected</Text>)
        }
    }

    return (
        <>
            <Grid
                templateRows='repeat(5, 1fr)'
                templateColumns='repeat(5, 1fr)'
                gap={4}
                h='90vh'
            >
                {/*SIDEBAR*/}
                <GridItem rowSpan={5} colSpan={1} borderRight='1px' borderColor='gray.100'>
                    <Button w='100%' borderRadius={0} variant={selected === AdminViewEnum.USER ? 'solid' : 'ghost'}
                        onClick={() => setSelected(AdminViewEnum.USER)}>
                        User</Button>
                </GridItem>
                {showSelected()}
            </Grid>
        </>
    )
}

export default WithAuth(App)
