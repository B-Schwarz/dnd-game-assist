import React from "react";
import WithAuth from "../login/withAuth";

const App = () => {

    return (
        <React.Fragment>
            Hello World from Monster List
        </React.Fragment>
    )
}

export default WithAuth(App)
