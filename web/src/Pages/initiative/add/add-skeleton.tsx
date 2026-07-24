import React from "react";
import {Skeleton, Td, Tr} from "@chakra-ui/react";

// Wireframe rows shown in an add-tab's table body while its list is still
// loading (the lists can be large — hundreds of monsters/characters).
const AddSkeletonRows = ({cols, rows = 6}: {cols: number, rows?: number}) => (
    <React.Fragment>
        {Array.from({length: rows}).map((_, r) => (
            <Tr key={r}>
                {Array.from({length: cols}).map((_, c) => (
                    <Td key={c}><Skeleton height='1.25rem'/></Td>
                ))}
            </Tr>
        ))}
    </React.Fragment>
);

export default AddSkeletonRows;
