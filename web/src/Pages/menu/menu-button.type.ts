import {SelectedEnum} from "./selected.enum";
import {JSXElementConstructor, ReactElement} from "react";

export interface MenuButtonType {
    name: string,
    selected: SelectedEnum,
    icon?: ReactElement<any, string | JSXElementConstructor<any>>,
    color?: string,
    link?: string,
    beta?: boolean
}
