import React, {Fragment} from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";
import Character from "./character-sheet/character";
import Login from "./login/login"

function App() {
    return (
        <Router>
            <Fragment>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/character" element={<Character />} /> {/* TODO: Liste mit seinen Chars*/}
                    <Route path="/character/:id" element={<Character />} />
                </Routes>
            </Fragment>
        </Router>
    );
}

export default App;
