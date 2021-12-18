# Start

Start the server by first installing all modules with ``npm install`` and then 
running ``npm run start``

# API

| URL                  |  METHOD  |                  PARAMETER                  |         ROLE         | DESCR.                                          | Return                                  |
|----------------------|:--------:|:-------------------------------------------:|:--------------------:|-------------------------------------------------|-----------------------------------------|
| /api/auth/login      |  `POST`  |  `password:string` <br/>`username:string`   |        `none`        | Logs the user in                                | `none`                                  |
| /api/auth/logout     |  `GET`   |                   `none`                    |        `none`        | Logs the user out                               | `none`                                  |
| /api/charlist        |  `GET`   |                   `none`                    | `admin`<br/>`master` | List with all characters                        | `[{_id:ObjectID, character:Character}]` |
 | /api/charlist/me     |  `GET`   |                   `none`                    |        `user`        | List with my characters                         | `[{_id:ObjectID, character:Character}]` |
| /api/char/new        |  `GET`   |                   `none`                    |        `user`        | Creates a new character, links it with the user | `{_id:ObjectID}`                        |
| /api/char/get/:id    |  `GET`   |                   `none`                    | `admin`<br/>`master` | Gets a specified character sheet from anyone    | `{_id:ObjectID, character:Character }`  |
| /api/char/me/get/:id |  `GET`   |                   `none`                    |        `user`        | Gets a specified character sheet from me        | `{_id:ObjectID, character:Character }`  |
| /api/char            |  `POST`  | `character:Character`<br/>`charID:ObjectID` | `admin`<br/>`master` | Saves the someones character sheet              | `none`                                  |
| /api/char/me         |  `POST`  | `character:Character`<br/>`charID:ObjectID` |        `user`        | Saves one of my characters                      | `none`                                  |
| /api/char/:id        | `DELETE` |                   `none`                    | `admin`<br/>`master` | Deletes someones character sheet                | `none`                                  |
| /api/char/me/:id     | `DELETE` |                   `none`                    |        `user`        | Deletes one of my character sheets              | `none`                                  |
| /api/me/admin        |  `GET`   |                   `none`                    |       `admin`        | Gets if user is admin                           | `none`                                  |
