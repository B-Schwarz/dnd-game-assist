import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from "./App";
import {ChakraProvider} from '@chakra-ui/react';
import axios from "axios";
import {Helmet, HelmetProvider} from "react-helmet-async";

axios.defaults.withCredentials = true

const root = createRoot(document.getElementById('root')!)

root.render(
    <React.StrictMode>

        <HelmetProvider>
            <Helmet>
                {/*Primary Meta Tags*/}
                <title>D&D Companion</title>
                <meta name="title" content="D&D Companion"/>
                <meta name="description" content="This is a private D&D Companion used in our home game"/>

                {/*Open Graph / Facebook*/}
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://dnd.bschwarz.dev/"/>
                <meta property="og:title" content="D&D Companion"/>
                <meta property="og:description"
                      content="This is a private D&D Companion used in our home game"/>
                <meta property="og:image" content=""/>

                {/*Twitter*/}
                <meta property="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content="https://dnd.bschwarz.dev/"/>
                <meta property="twitter:title" content="D&D Companion"/>
                <meta property="twitter:description"
                      content="This is a private D&D Companion used in our home game"/>
                <meta property="twitter:image" content=""/>
            </Helmet>
        </HelmetProvider>

        <ChakraProvider>
            <App/>
        </ChakraProvider>
    </React.StrictMode>
);
