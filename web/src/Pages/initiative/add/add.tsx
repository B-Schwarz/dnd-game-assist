import React from "react"
import {ModalBody, ModalCloseButton, ModalHeader, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import AddPlayer from "./add-player";
import AddMonster from "./add-monster";
import AddNpc from "./add-npc";

const App = (props: {u: () => void}) => {

    return (
        <React.Fragment>
            <ModalHeader>
                Spieler/Monster hinzufügen
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
                <Tabs>
                    <TabList>
                        <Tab>Spieler</Tab>
                        <Tab>Monster</Tab>
                        <Tab>NPC</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <AddPlayer u={props.u}/>
                        </TabPanel>
                        <TabPanel>
                            <AddMonster u={props.u}/>
                        </TabPanel>
                        <TabPanel>
                            <AddNpc u={props.u}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalBody>
        </React.Fragment>
    )
}

export default App
