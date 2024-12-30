import React, {Fragment} from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Character from "./Pages/character-sheet/character";
import Login from "./Pages/login/login"
import CharacterList from "./Pages/character-sheet/character-list";
import Menu from "./Pages/menu/menu";
import {SelectedEnum} from "./Pages/menu/selected.enum";
import Initiative from "./Pages/initiative/initiative";
import Settings from "./Pages/settings/settings";
import Admin from "./Pages/admin/admin";
import MonsterList from "./Pages/monster/monster-list";
import Books from "./Pages/books/books";
import EncounterList from "./Pages/encounter/encounter-list";

function App() {
    return (
        <>
            <Router>
                <Fragment>
                    <Routes>
                        <Route path="/login" element={
                            <><Login/></>}/>
                        <Route path="/character"
                               element={<><Menu selected={SelectedEnum.CHARACTER}/><CharacterList/></>}/>
                        <Route path="/character/:id"
                               element={<><Menu selected={SelectedEnum.CHARACTER}/><Character/></>}/>
                        <Route path="/initiative"
                               element={<><Menu selected={SelectedEnum.INITIATIVE}/><Initiative/></>}/>
                        <Route path="/settings" element={<><Menu selected={SelectedEnum.SETTINGS}/><Settings/></>}/>
                        <Route path="/admin" element={<><Menu selected={SelectedEnum.ADMIN}/><Admin/></>}/>
                        <Route path="/monster" element={<><Menu selected={SelectedEnum.MONSTER}/><MonsterList/></>}/>
                        <Route path="/encounter" element={<><Menu selected={SelectedEnum.ENCOUNTER}/><EncounterList/></>}/>
                        <Route path="/books" element={<><Menu selected={SelectedEnum.BOOKS}/><Books/> </>}/>
                        <Route path="*" element={<Navigate  to='/character' replace/>}/>
                    </Routes>
                </Fragment>
            </Router>
        </>
    );
}

export default App;
