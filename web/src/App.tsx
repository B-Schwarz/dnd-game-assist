import React, {Fragment} from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Character from "./character-sheet/character";
import Login from "./login/login"
import CharacterList from "./character-sheet/character-list";
import Menu from "./menu/menu";
import {SelectedEnum} from "./menu/selected.enum";
import Initiative from "./initiative/initiative";
import Settings from "./settings/settings";
import Admin from "./admin/admin";
import MonsterList from "./monster/monster-list";
import Books from "./books/books";

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
                        <Route path="/books" element={<><Menu selected={SelectedEnum.BOOKS}/><Books/> </>}/>
                        <Route path="*" element={<Navigate  to='/character' replace/>}/>
                    </Routes>
                </Fragment>
            </Router>
        </>
    );
}

export default App;
