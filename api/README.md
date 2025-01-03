# Start

Start the server by first installing all modules with ``npm install`` and then running ``npm run start``

# API

## Auth

| URL                | METHOD |                PARAMETER                 |  ROLE   | DESCR.               | Return |
|--------------------|:------:|:----------------------------------------:|:-------:|----------------------|--------|
| /api/auth/login    | `POST` | `password:string` <br/>`username:string` | `none`  | Logs the user in     | `none` |
| /api/auth/logout   | `GET`  |                  `none`                  | `none`  | Logs the user out    | `none` |
| /api/auth/register | `POST` | `username:string`<br/>`password:string`  | `admin` | Registers a new user | `none` |

## Char List

| URL               | METHOD | PARAMETER |         ROLE         | DESCR.                   | Return                               |
|-------------------|:------:|:---------:|:--------------------:|--------------------------|--------------------------------------|
| /api/charlist     | `GET`  |  `none`   | `admin`<br/>`master` | List with all characters | `[{_id:ObjectID, character:Player}]` |
| /api/charlist/me  | `GET`  |  `none`   |        `user`        | List with my characters  | `[{_id:ObjectID, character:Player}]` |
| /api/charlist/npc | `GET`  |  `none`   |       `master`       | List with all my npcs    | `[{_id:ObjectID, character:Player}]` |

## Character

| URL                  |  METHOD  |                PARAMETER                 |         ROLE         | DESCR.                                          | Return                              |
|----------------------|:--------:|:----------------------------------------:|:--------------------:|-------------------------------------------------|-------------------------------------|
| /api/char/new        |  `GET`   |                  `none`                  |        `user`        | Creates a new character, links it with the user | `{_id:ObjectID}`                    |
| /api/char/get/:id    |  `GET`   |                  `none`                  | `admin`<br/>`master` | Gets a specified character sheet from anyone    | `{_id:ObjectID, character:Player }` |
| /api/char/me/get/:id |  `GET`   |                  `none`                  |        `user`        | Gets a specified character sheet from me        | `{_id:ObjectID, character:Player }` |
| /api/char            |  `POST`  | `character:Player`<br/>`charID:ObjectID` | `admin`<br/>`master` | Saves the someones character sheet              | `none`                              |
| /api/char/me         |  `POST`  | `character:Player`<br/>`charID:ObjectID` |        `user`        | Saves one of my characters                      | `none`                              |
| /api/char/:id        | `DELETE` |                  `none`                  | `admin`<br/>`master` | Deletes someones character sheet                | `none`                              |
| /api/char/me/:id     | `DELETE` |                  `none`                  |        `user`        | Deletes one of my character sheets              | `none`                              |
| /api/char/npc/toggle |  `PUT`   |            `charID:ObjectID`             |       `master`       | Toggle whether the character is an NPC or not   | `none`                              |

## Account

| URL                        |  METHOD  |                  PARAMETER                   |         ROLE         | DESCR.                                                                   | Return                                |
|----------------------------|:--------:|:--------------------------------------------:|:--------------------:|--------------------------------------------------------------------------|---------------------------------------|
| /api/me/admin              |  `GET`   |                    `none`                    |       `admin`        | Gets if user is admin                                                    | `none`                                |
| /api/me/master             |  `GET`   |                    `none`                    |       `admin`        | Gets if user is master                                                   | `none`                                |
| /api/me/admin/master       |  `GET`   |                    `none`                    | `admin`<br/>`master` | Gets if user is admin or master                                          | `none`                                |
| /api/me                    |  `GET`   |                    `none`                    |        `user`        | Gets if user is logged in                                                | `none`                                |
| /api/me/password           |  `PUT`   |    `currPass:string`<br/>`newPass:string`    |        `user`        | Changes the user password                                                | `none`                                |
| /api/me/delete             | `DELETE` |                    `none`                    |        `user`        | Deletes your own user account + all your character sheets                | `none`                                |
| /api/account/delete        | `DELETE` |              `userID:ObjectID`               |       `admin`        | Deletes an account with all their character sheets                       | `none`                                |

## Admin

| URL              | METHOD |               PARAMETER                |  ROLE   | DESCR.                                        | Return        |
|------------------|:------:|:--------------------------------------:|:-------:|-----------------------------------------------|---------------|
| /api/user        | `GET`  |                 `none`                 | `admin` | Returns a list with all users and their roles | `[user:User]` |
| /api/user/admin  | `PUT`  | `userID:ObjectID`<br/>`admin:boolean`  | `admin` | Sets the role status                          | `none`        |
| /api/user/master | `PUT`  | `userID:ObjectID`<br/>`master:boolean` | `admin` | Sets the role status                          | `none`        |

## Initiative Board

| URL                        |  METHOD  |                  PARAMETER                   |   ROLE   | DESCR.                                                                   | Return                                |
|----------------------------|:--------:|:--------------------------------------------:|:--------:|--------------------------------------------------------------------------|---------------------------------------|
| /api/initiative            |  `PUT`   |              `[player:Player]`               | `master` | Saves the Players (including npc)                                        | `none`                                |
| /api/initiative            |  `GET`   |                    `none`                    |  `user`  | Retrieves the Player list for table                                      | `[player:Player]`                     |
| /api/initiative/master     |  `GET`   |                    `none`                    | `master` | Retrieves the Player list for table and Master enabled                   | `[player:Player]`                     |
| /api/initiative/sort       |  `GET`   |                    `none`                    | `master` | Sorts the list by initiative and turn order                              | `none`                                |
| /api/initiative/player     |  `PUT`   |               `player:Player`                | `master` | Updates a single player, uniquely identified by turn nr                  | `none`                                |
| /api/initiative/player     |  `POST`  |               `player:Player`                | `master` | Adds a new player/monster to the board (on duplicate names -> append nr) | `none`                                |
| /api/initiative/player/:id | `DELETE` |                    `none`                    | `master` | Deletes the player or npc from the board                                 | `none`                                |
| /api/initiative/player     | `DELETE` |                    `none`                    | `master` | Resets the curren initiative board                                       | `none`                                |
| /api/initiative/move       |  `PUT`   | `index:number`<br/>`direction:{'UP','DOWN'}` | `master` | Swaps the position of two players                                        | `none`                                |
| /api/initiative/round      |  `GET`   |                    `none`                    |  `user`  | Gets the current round number                                            | `none`                                |
| /api/initiative/round      |  `PUT`   |                `round:number`                | `master` | Sets the current round number                                            | `none`                                |

## Monster

| URL               |  METHOD  |                PARAMETER                |         ROLE         | DESCR.                         | Return                              |
|-------------------|:--------:|:---------------------------------------:|:--------------------:|--------------------------------|-------------------------------------|
| /api/monster/new  |  `GET`   |                 `none`                  | `admin`<br/>`master` | Creates a new monster          | `none`                              |
| /api/monster/list |  `GET`   |                 `none`                  |        `user`        | Returns a list of all monsters | `[{_id:ObjectID, monster:Monster}]` |
| /api/monster      |  `PUT`   | `charID:ObjectID`<br/>`monster:Monster` | `admin`<br/>`master` | Updates a monster              | `none`                              |
| /api/monster/:id  | `DELETE` |                 `none`                  | `admin`<br/>`master` | Deletes a monster              | `none`                              |
| /api/monster/:id  |  `GET`   |                 `none`                  | `admin`<br/>`master` | Returns the specified monster  | `[{_id:ObjectID, monster:Monster}]` |

## Encounter
| URL                                  |  METHOD  |                PARAMETER                |     ROLE     | DESCR.                            | Return                              |
|--------------------------------------|:--------:|:---------------------------------------:|:------------:|-----------------------------------|-------------------------------------|
| /api/encounter/new                   |  `GET`   |                 `none`                  |   `master`   | Creates a new Encounter           | `none`                              |
| /api/encounter/list                  |  `GET`   |                 `none`                  |   `master`   | Returns a list of your encounters | `[{_id:ObjectID, monster:Monster}]` |
| /api/encounter                       |  `PUT`   | `charID:ObjectID`<br/>`monster:Monster` |   `master`   | Updates an encounter              | `none`                              |
| /api/encounter/:id                   | `DELETE` |                 `none`                  |   `master`   | Deletes an encounter              | `none`                              |