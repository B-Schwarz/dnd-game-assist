import React from 'react'
import {Helmet, HelmetProvider} from "react-helmet-async";

const TitleService = (props: { title: string }) => {

    return (
        <HelmetProvider>
            <Helmet>
                <title>{props.title} | D&D Companion</title>
            </Helmet>
        </HelmetProvider>
    )
}

export default TitleService
