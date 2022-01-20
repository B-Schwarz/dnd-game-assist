import React, {useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const WithAuth = (Component: React.FC) => {
    const returnValue = () => {

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate()

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            axios.get('/api/me')
                .catch(() => {
                    navigate('/login')
                })
        }, [])

        return (
            <Component />
        )
    }

    returnValue.displayName = Component.displayName
    return returnValue
}

export default WithAuth
