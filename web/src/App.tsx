import React, {Fragment} from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";
import Character from "./character-sheet/character";
import Login from "./login/login"
import CharacterList from "./character-sheet/character-list";
import Menu from "./menu/menu";
import {SelectedEnum} from "./menu/selected.enum";

function App() {
    return (
        <>
            <Router>
                <Fragment>
                    <Routes>
                        <Route path="/login" element={
                            <><Menu selected={SelectedEnum.NONE}/><Login/></>}/>
                        <Route path="/character" element={<><Menu selected={SelectedEnum.CHARACTER}/><CharacterList/></>}/> {/* TODO: Liste mit seinen Chars*/}
                        <Route path="/character/:id" element={<><Menu selected={SelectedEnum.CHARACTER}/><Character/></>}/>
                    </Routes>
                </Fragment>
            </Router>
        </>
    );
}

export default App;
