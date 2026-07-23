import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from "./App";
import {ChakraProvider} from '@chakra-ui/react';
import "./Service/api";

const root = createRoot(document.getElementById('root')!)

root.render(
    <React.StrictMode>
        <ChakraProvider>
            <App/>
        </ChakraProvider>
    </React.StrictMode>
);
