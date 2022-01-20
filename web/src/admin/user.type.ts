export interface User {
    _id: string,
    name: string,
    master: boolean,
    admin: boolean,
    character: [
        id: string
    ]
}
