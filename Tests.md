# Test Plan

Preparation for the **Unit tests** and **Acceptance tests** items under `# Generic` in `TODO.md`.
Each entry below is one test (or tight cluster of assertions) to be written. Check it off when implemented.

> ⚠️ markers flag behaviour that looks like a latent bug or inconsistency. Write the test to **pin the current behaviour**, but call it out so we can decide whether to fix the code instead of cementing it.

## Tooling (suggested)
- **API unit/integration:** Jest + `supertest` (drive the Express app), `mongodb-memory-server` for an isolated DB.
- **API pure-logic unit:** plain Jest against the exported handlers/helpers (e.g. `api/initiative/index.js`) — no DB needed for the in-memory initiative state machine.
- **Web unit:** the bundled CRA test runner (`react-scripts test`, Jest + React Testing Library).
- **Acceptance / E2E:** Playwright against the running stack (web :3000, api :4000, local Mongo), logging in with the seeded `admin` / `asdasdasd`.

## Cross-cutting setup
- [ ] Spin up an isolated Mongo (memory server) and seed the default admin the way `api/db/index.js` does on first connect.
- [ ] Helper to register/login a user and return an authenticated agent (session cookie `dnd.sid`).
- [ ] Helpers to mint users with specific role flags (`user` / `master` / `admin`).
- [ ] **Reset the initiative module's in-memory state between tests** — board lives in module-level vars (`master`, `player`, `round`, `turn`, `playerTurn`, `colorMarkerIndex`, `colorMarkers`), not the DB. `deleteAllMaster` resets most of it; ensure `round`/`turn` are reset too.
- [ ] Fixtures: a minimal `DnDCharacter`, a monster entry, an NPC entry, an encounter.

---

# Unit Tests

## API — Auth & role gates (`api/auth`)
- [ ] `login` with valid `username`/`password` → 200 and a session token is created and pushed onto `user.session`.
- [ ] `login` generated token is UUID-formatted.
- [ ] Two successive `login`s for the same user → two distinct tokens coexist in `user.session` (multiple active sessions).
- [ ] `login` with wrong password → 401.
- [ ] `login` with unknown user → 401.
- [ ] `login` missing `username` or `password` → 400.
- [ ] `login` name match is case-insensitive (`findByCredentials` regex `"i"`) — login as `Admin` for stored `admin`.
- [ ] `logout` removes **only the current token** from `user.session` (other sessions survive) and destroys the session.
- [ ] `register` (admin) creates a user with `master:false`, `admin:false`.
- [ ] `register` missing `username`/`password` → 400.
- [ ] `register` username shorter than 3 chars → 400 (mongoose `minlength`).
- [ ] `register` trims surrounding whitespace in the username (`"  x  "` stored as `"x"`).
- [ ] `register` duplicate username → 400 (unique index).
- [ ] `isAuth` attaches `req.user` for a valid `session.token`; rejects (401) when missing/invalid (missing token short-circuits before any DB lookup).
- [ ] `isMaster` allows `master:true`, denies otherwise — **denies even when `admin:true`**.
- [ ] `isAdmin` allows `admin:true`, denies otherwise — **denies even when `master:true`**.
- [ ] `isMasterOrAdmin` allows when either flag is set; denies when both false.

## API — User model (`api/db/models/user.model`)
- [ ] `pre('save')` hashes the password only when `password` is modified (a non-password save does not re-hash).
- [ ] Stored hash uses bcrypt (cost 10); plaintext is never persisted.
- [ ] `findByCredentials` resolves on correct bcrypt match, rejects otherwise; lookup is case-insensitive.
- [ ] `generateSession` pushes a new token and returns it.
- [ ] Schema constraints: `name` required + `minlength:3` + `unique` + `trim`; `password`/`master`/`admin` required.

## API — Initiative in-memory logic (`api/initiative`)
- [ ] `addMaster` appends an entry, forces `isMaster:true` (overriding the body), and assigns a `colorMarker` for NPCs.
- [ ] `addMaster` does **not** assign a colour to a player character (`npc:false`), even if one is passed.
- [ ] `addMaster` colour index cycles `(index + 1) % 10` — the 11th NPC wraps back to the first marker.
- [ ] `addMaster`/`updateMaster` with a malformed player object are caught and still return 200 (silent no-op). ⚠️ swallows errors.
- [ ] `updateMaster` is a no-op early-return when `master` is empty.
- [ ] `setTurn` assigns unique, increasing `turnId`s only to entries that don't have one; it is **idempotent** (re-running assigns nothing new) and a no-op on an empty board.
- [ ] `getPlayerMaster` returns `{player: master, turn}`; `getPlayerPlayer` returns the derived `{player, turn: playerTurn}` view (available to any authed user, no master gate).
- [ ] `updatePlayerData` deep-clones master, forces `isMaster:false` on every player entry, and advances `playerTurn` past hidden entries (cyclic `(j+i) % len` search).
- [ ] `updatePlayerData` when **all** entries are hidden → `playerTurn` stays at the current index.
- [ ] `updateMaster` replaces the matching entry by `turnId`, keeps `isMaster:true`, then runs `reorderDeadMonsters`.
- [ ] `deleteMaster` removes by `turnId` and decrements `turn` when the removed `turnId < turn`. ⚠️ `turn` has no lower bound and can go negative.
- [ ] `deleteAllMaster` clears master/player, resets `round` and `turn`/`playerTurn`, resets `colorMarkerIndex`, and **shuffles** `colorMarkers` for the next session.
- [ ] `sortPlayer` runs `setTurn` first, orders by initiative **desc**, ties broken by `turnId` **asc**, then runs `reorderDeadMonsters`.
- [ ] `sortPlayer` coerces initiative via `Number(...)`; document behaviour for non-numeric/NaN values. ⚠️
- [ ] `nextTurn` advances, wraps to 0 and increments `round` at the end; no-op on an empty board.
- [ ] `prevTurn` steps back, wraps to last (`max(0, len-1)`) and decrements `round` (floored at 0); no-op on an empty board.
- [ ] `isDeadMonster` is true only when `monster:true` **and** `character.hp <= 0` (0 and negative both count); a non-monster is never "dead-monster"; any exception → `false`.
- [ ] **Dead monster** is moved to the bottom by `reorderDeadMonsters`, with the turn pointer kept on the acting creature (by `turnId`); if that `turnId` is gone, `turn` is left unchanged; empty board is a no-op.
- [ ] `nextTurn`/`prevTurn` **skip dead monsters**, with a guard (`<= master.length`) preventing an infinite loop when all remaining are dead monsters — in that exhausted case `turn` ends on a dead monster.
- [ ] A dead **non-monster** (PC/NPC) keeps its position (not reordered, not skipped).
- [ ] `movePlayer` swaps adjacent entries; direction is **case-insensitive** (`up`/`UP`/`Up`); calls `updatePlayerData` on a valid move.
- [ ] `movePlayer` rejects moving index 0 up, the last index down, out-of-range index, or an invalid direction (400), and does not update on rejection.
- [ ] `reorderPlayer` moves `from`→`to`; turn pointer follows the acting creature; runs `reorderDeadMonsters` then `updatePlayerData`; `from === to` is an accepted no-op.
- [ ] `reorderPlayer` requires integer indices in `[0, master.length)` — otherwise 400.
- [ ] `setRound` coerces via `Number(r)`, rejects non-numeric (400); negatives are accepted (no validation). ⚠️
- [ ] `getRound` returns `{round}` (no master gate).

## API — Character (`api/character`)
- [ ] `createCharacter` creates a Character doc, returns its `_id`, links it to `req.user.character`, with default `name:''` and `npc:false`.
- [ ] `saveCharacter` / `saveOwnCharacter` persist the opaque `character` object; missing/invalid `charID` → 404.
- [ ] **HP decoupling:** `preserveHp` keeps the stored current HP when saving the rest of the sheet; safe when no existing doc and when the existing doc has no `hp`.
- [ ] `saveOwnCharacter` rejects a character the caller doesn't own → 401 (ownership via `isOwnedByUser`).
- [ ] `saveCharacterHp` / `saveOwnCharacterHp` update only HP; missing `charID` → 400, invalid → 404; `saveOwnCharacterHp` on an unowned char → 401.
- [ ] `getCharacterHp` reads HP back; a character with no `hp` returns `{hp: undefined}`; missing id → 400; missing char → 404.
- [ ] `getOwnCharacterHp` / `getOwnCharacter` on an unowned char → **404** (note: read paths use 404, write paths use 401 for the same ownership failure). ⚠️ inconsistent.
- [ ] `saveCharacterHpBulk` updates many characters' HP; **non-array body → 400**; empty array → 200 no-op.
- [ ] `saveCharacterHpBulk` silently skips entries with missing `charID`, invalid ObjectId, or an id that isn't a Character (e.g. a Monster); mixed valid/invalid still returns 200 with the valid ones applied.
- [ ] `getCharacterList` excludes the requester's own characters (`$nin`) and returns only `_id`/`character`/`npc`; returns `[]` when the user owns everything.
- [ ] `getOwnCharacterList` returns only the caller's characters (iterates `user.character`, includes NPCs).
- [ ] `getNPCList` returns only the caller's `npc:true` characters.
- [ ] `setNPC` toggles the `npc` flag; missing `charID` → 400. ⚠️ invalid id throws → 500 (inconsistent with 400/404 elsewhere).
- [ ] `deleteCharacter` removes the doc and pulls it from **every** owning user; ⚠️ an invalid id still returns 200.
- [ ] `deleteOwnCharacter` only affects the caller's char; a char not in the caller's array is a silent 200 no-op.
- [ ] `getCharacter` (privileged) vs `getOwnCharacter` (ownership-checked via `isOwnedByUser`, exact `_id.toString()` match).
- [ ] **`exportCharacters`** returns every character with a resolved `owner` ({userID, name} or `null` when unowned). ⚠️ if a char is somehow in two users' arrays, the last user wins.
- [ ] **`importCharacters`** creates new, **unowned** docs from a list; returns `{created}`; rejects non-array body (400); skips items with no/`null` `character`; coerces `npc` via `Boolean(...)` (so `undefined`→false, `"true"`→true).
- [ ] **`reassignCharacter`** pulls a char from any owner and `$addToSet`s it to the target (idempotent); works even when the char currently has no owner.
- [ ] **`reassignCharacter`** rejects missing `charID`/`toUserID` (400), an NPC (400), and a non-existent target user (404).

## API — Admin (`api/admin`)
- [ ] `getUserList` returns `_id`/`name`/`master`/`admin`/`character` only (no password/session).
- [ ] `setAdmin` / `setMaster` flip the respective flag; missing/invalid `userID` → 400.
- [ ] **`setPassword`** sets another user's password (hashed via the save hook); afterwards login works with the new password and fails with the old one.
- [ ] `setPassword` rejects passwords shorter than 8 chars or empty/missing (400) and a missing/unknown target user (404).

## API — Settings (`api/settings`)
- [ ] `changeOwnPassword` requires both `currPass` and `newPass` (400 if either missing); rejects a wrong current password (401, via `findByCredentials`, case-insensitive lookup).
- [ ] `changeOwnPassword` accepts **any** non-empty `newPass` (no length check — contrast with admin `setPassword`'s 8-char minimum). ⚠️
- [ ] `deleteOwnAccount` deletes the user and all of their characters, then destroys the session; works with zero characters; a `deleteMany` error is swallowed and the user is still deleted.
- [ ] `deleteAccount` (admin) deletes a target user and their characters; missing `userID` → 400. ⚠️ unknown user → 500 (not handled gracefully).

## API — Books (`api/books`)
- [ ] `getBookList` returns the file names in `books/pdf`; the directory is auto-created (recursive) if missing; empty dir → `[]`.
- [ ] `uploadBook` accepts a PDF (multer `single('book')`) → 200; the file lands in `books/pdf` named via `path.basename(originalname)`.
- [ ] The multer `fileFilter` accepts on a `.pdf` extension (case-insensitive) **or** `application/pdf` mimetype; a `.pdf` name with a wrong mimetype still passes (extension check).
- [ ] Non-PDF upload is rejected by the filter (no `req.file`) → 400.
- [ ] `deleteBook` removes a named file → 200; missing file → 404; empty name → 400.
- [ ] `deleteBook` is path-traversal safe (`path.basename` + a `startsWith(BOOK_DIR)` guard refuses names escaping `books/pdf`).
- [ ] The `/api/books/` static mount is behind `isAuth` (unauthenticated cannot fetch PDFs).

## API — Monster & Encounter (`api/monster`, `api/encounter`)
- [ ] Monster: create / update / delete / get-by-id gated to master|admin; **list and get-by-id only require `isAuth`** (no role).
- [ ] `createMonster`/`createEncounter` return 200 **without** the new id (unlike `createCharacter`).
- [ ] `getMonsterList` is sorted by `monster.name` ascending and omits `__v`.
- [ ] Monster `delete`/`save` with an invalid id → ⚠️ delete returns 200 anyway; save → 404.
- [ ] Encounter: create / list / update / delete gated to master.
- [ ] `createEncounter` is owned by `req.user._id`, defaults `name:'New Encounter'`, `encounter:[]`; `getEncounterList` is scoped to the caller; `saveEncounter` missing id → 400.
- [ ] ⚠️ **`deleteEncounter` performs no ownership check — any master can delete any user's encounter** (also leaves a debug `console.log`). Pin current behaviour and flag for a fix.

## API — CORS / app wiring (`api/server.js`)
- [ ] An `OPTIONS` preflight returns **204** before auth/static can reject it, with `Access-Control-Allow-Credentials: true`, `Allow-Methods: GET, POST, PUT, DELETE`, and `Allow-Origin` from `CORS_URL` (not `*`).
- [ ] Rate limiter is mounted on `/api` (window 60s, max 10000, `standardHeaders` on).
- [ ] Session cookie is `dnd.sid`, `httpOnly`, `sameSite:'lax'`, `secure` only in production, persisted in Mongo.
- [ ] `x-powered-by` is disabled and JSON body limit is 20mb.
- [ ] Mirrored privileged vs `/me` routes enforce ownership (a normal user cannot act on others' data).

## API — DB bootstrap (`api/db`)
- [ ] On first connect with an empty users collection, a default admin is seeded (`name:admin`, `password:asdasdasd`, `admin:true`, `master:false`); it is **not** re-seeded when users already exist.
- [ ] Connection is configured with `strictQuery:false` and uses `DB_URI`.

## Web — character sheet model & math (`web/src/Pages/character-sheet/sheet`)
- [ ] `DnDCharacter` / `Color` enum shape is stable (snapshot of default object; `Color.NONE === 0`).
- [ ] `modOf` ability modifier: `10`→`''`, `14`→`'+2'`, `8`→`'-1'`, `20`→`'+5'`; `undefined`/`NaN` → `''`.
- [ ] `contrastInk` returns black on light backgrounds and white on dark (luminance threshold); invalid/empty hex → `''`.
- [ ] `recalc` derives saves/skills from scores + proficiency: `none` adds 0, `normal` adds `pb`, `expert` adds `2·pb`; missing score/pb → base 0.
- [ ] HP bar fill `hpPct` = `cur/max·100` clamped to 0–100 and NaN-safe (`max:0` → 0).
- [ ] EN/DE language toggle flips labels and persists to `localStorage` (`dnd-character-language`); first load defaults to EN.
- [ ] Colour picker maps each `Color` to its hex (`COLOR_HEX`); `NONE` → no background.

## Web — initiative entry helpers (`web/src/Pages/initiative`)
- [ ] `calcHp` formats `hp(+temp)/max` (temp only shown when > 0).
- [ ] `calcMaxHp` accounts for temp HP exceeding max (`hp+temp` when it overflows `maxHp`); NaN/missing → 0.
- [ ] **`acDisplay`** renders `"14"` normally, `"14 (+2)"` when the shield is active, `"14"` when shield is 0, and a signed `"14 (-1)"` for a negative shield.
- [ ] Save accessors (`strSave`…`chaSave`) render signed values and fall back to 0 on NaN.
- [ ] Dead detection (`hp === 0`, string `'0'` included) drives the dead styling/icon.
- [ ] `doSchaden` absorbs damage from temp HP first, overflows into real HP, and clamps at 0; `doHeal` caps at `maxHp`.
- [ ] `getColor` maps each `ColorMarkerEnum` to the right colour; `NONE`/out-of-range → `''`.
- [ ] `getIcon` returns a tooltip-wrapped icon (with a German description) for every `StatusEffectsEnum`; an unknown effect → `undefined`.
- [ ] Hidden entries: a master sees them (purple badge); a non-master gets an empty render.
- [ ] HP visibility: NPC HP hidden from players unless `shareHp` (or master); PC HP always shown.
- [ ] Enum snapshots: `StatusEffectsEnum` (all conditions present) and `ColorMarkerEnum` (`NONE…WHITE`) are stable.

## Web — initiative add modals (`web/src/Pages/initiative/add`)
- [ ] `add-player` `search` filters by name, case-insensitively, without mutating the source list; empty query → full list.
- [ ] `add-player` `getPlayer` lists only non-NPC characters; `add-npc` `getPlayer` lists only NPCs.
- [ ] Monster/NPC `onAdd` rolls initiative as `1d20 + dexMod`; a missing/non-numeric dex → modifier 0.
- [ ] `add-npc` `onAdd` maps a character `color` to `colorMarker`.
- [ ] `onHide` toggles `hidden` on the entry before it is added.
- [ ] `add-encounter` `onAdd` instantiates each monster `amount` times with independently rolled initiatives; `amount:0` adds none.

## Web — login & shared
- [ ] `validateName` / `validatePassword` return a German error on empty input, `undefined` otherwise.
- [ ] `withAuth` HOC redirects to `/login` on a 401 from `/api/me`, renders the wrapped component otherwise.
- [ ] Axios is configured with the API prefix (`REACT_APP_API_PREFIX`) and sends credentials (`withCredentials`).
- [ ] The settings page renders the version from `process.env.REACT_APP_VERSION` (build injects it; the full `package.json` is **not** bundled).

---

# Acceptance Tests (E2E)

## Auth & access control
- [ ] Login with valid creds lands on the app; invalid creds shows an error and stays on `/login`.
- [ ] Logout returns to `/login` and protected routes redirect when unauthenticated.
- [ ] A normal user does **not** see the Admin nav entry; direct `/admin` is blocked.
- [ ] A non-master does **not** see the initiative master controls.

## Character sheet lifecycle
- [ ] Create a new character, open it, edit fields → autosaves (reload shows persisted values).
- [ ] Colour picker reflects the chosen colour; EN/DE language toggle switches labels; player-name field persists.
- [ ] Character list shows player name; delete removes the character.
- [ ] Responsive: at iPad (768px) and iPad mini (744px) widths the sheet keeps its two-column layout.

## Initiative — master
- [ ] Add a player, a monster, an NPC, and an encounter to the board from the add modal.
- [ ] Sort orders by initiative; "Board Löschen" clears after confirm.
- [ ] Next/prev turn (arrow buttons) and **hotkeys J/K** move the turn; round increments on wrap.
- [ ] **Drag-to-reorder** changes order; the dragged row doesn't resize over an expanded entry.
- [ ] The current-turn entry's panel auto-opens and the previous one closes on turn change.
- [ ] Editing initiative / HP / AC / shield in the panel persists; AC shows `X (+shield)`.
- [ ] "Leben speichern" pushes board HP to the character sheets; sheet HP polls/updates.
- [ ] **Dead monster** greys out, drops to the bottom, and its turn is skipped automatically.
- [ ] **Dead PC** keeps position with a red background; **dead NPC** greys out but keeps position.
- [ ] The active turn is clearly highlighted (gold ring/accent) even over a dead red/grey row.
- [ ] Hidden NPC row uses the hide-button colour; NPC tag and colour marker are first in the row.

## Initiative — player view
- [ ] A player sees the board, but hidden NPCs are not shown and NPC HP is hidden unless shared.
- [ ] "HP teilen" on an NPC makes its HP visible to players.

## Admin — users
- [ ] Register a new user from the admin panel; it appears in the list.
- [ ] Toggle admin/master flags; the change persists.
- [ ] **Set a user's password**, then log in as that user with the new password (old one fails).
- [ ] Delete a user (with confirm) removes them and their characters.

## Admin — characters
- [ ] "Alle exportieren" downloads a JSON file containing every character + owner.
- [ ] Per-row **Export** downloads a single, re-importable character file.
- [ ] **Import** a file creates the characters as unowned; they appear with owner `—`.
- [ ] **Reassign** a PC to another user updates the owner; round-trips back.
- [ ] An **NPC row shows "nicht zuweisbar"** and cannot be reassigned.

## Admin — books
- [ ] Upload a PDF; it appears in the list.
- [ ] Uploading a non-PDF is rejected with an error toast.
- [ ] Delete a book removes it from the list.

## Account self-service (settings)
- [ ] Change own password with the correct current password; re-login works with the new one, fails with the old.
- [ ] Wrong current password shows an error and does not change the password.
- [ ] Delete own account removes the user (and their characters) and lands back on `/login`.
- [ ] The settings page shows the current app version (`2.0`).

## Books viewer
- [ ] The Books page lists available PDFs and opens one in the viewer.

## Monster & Encounter editors
- [ ] Create, edit, and delete a monster (master/admin).
- [ ] Build an encounter from monsters and add it to the initiative board.
