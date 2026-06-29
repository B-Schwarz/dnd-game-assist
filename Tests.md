# Test Plan

Preparation for the **Unit tests** and **Acceptance tests** items under `# Generic` in `TODO.md`.
Each entry below is one test (or tight cluster of assertions) to be written. Check it off when implemented.

## Tooling (suggested)
- **API unit/integration:** Jest + `supertest` (drive the Express app), `mongodb-memory-server` for an isolated DB.
- **API pure-logic unit:** plain Jest against the exported handlers/helpers (e.g. `api/initiative/index.js`) — no DB needed for the in-memory initiative state machine.
- **Web unit:** the bundled CRA test runner (`react-scripts test`, Jest + React Testing Library).
- **Acceptance / E2E:** Playwright against the running stack (web :3000, api :4000, local Mongo), logging in with the seeded `admin` / `asdasdasd`.

## Cross-cutting setup
- [ ] Spin up an isolated Mongo (memory server) and seed the default admin the way `api/db/index.js` does on first connect.
- [ ] Helper to register/login a user and return an authenticated agent (session cookie `dnd.sid`).
- [ ] Helpers to mint users with specific role flags (`user` / `master` / `admin`).
- [ ] **Reset the initiative module's in-memory state between tests** (call `deleteAllMaster`, reset round/turn) — the board lives in module-level variables, not the DB.
- [ ] Fixtures: a minimal `DnDCharacter`, a monster entry, an NPC entry, an encounter.

---

# Unit Tests

## API — Auth & role gates (`api/auth`)
- [ ] `login` with valid `username`/`password` → 200 and a session token is created.
- [ ] `login` with wrong password → 401.
- [ ] `login` with unknown user → 401.
- [ ] `login` missing fields → 400.
- [ ] `login` name match is case-insensitive (`findByCredentials` regex).
- [ ] `logout` clears/destroys the session.
- [ ] `register` (admin) creates a user with `master:false`, `admin:false`.
- [ ] `register` duplicate username → 400 (unique index).
- [ ] `isAuth` attaches `req.user` for a valid `session.token`; rejects (401) when missing/invalid.
- [ ] `isMaster` / `isAdmin` / `isMasterOrAdmin` allow/deny correctly for each role combination.

## API — User model (`api/db/models/user.model`)
- [ ] `pre('save')` hashes the password only when `password` is modified (not on every save).
- [ ] `findByCredentials` resolves on correct bcrypt match, rejects otherwise.
- [ ] `generateSession` pushes a new token and returns it.

## API — Initiative in-memory logic (`api/initiative`)
- [ ] `addMaster` appends an entry, sets `isMaster:true`, and assigns a `colorMarker` for NPCs.
- [ ] `setTurn` assigns unique, increasing `turnId`s to entries that don't have one.
- [ ] `getPlayerMaster` returns the full `master` list + `turn`; `getPlayerPlayer` returns the derived player view.
- [ ] `updatePlayerData` advances the **player-view** turn past hidden entries (hidden are not "current turn" for players).
- [ ] `updateMaster` replaces the matching entry by `turnId` and keeps `isMaster:true`.
- [ ] `deleteMaster` removes by `turnId` and decrements `turn` when needed.
- [ ] `deleteAllMaster` clears master/player, resets round/turn, reshuffles colour markers.
- [ ] `sortPlayer` orders by initiative desc, tie-broken by turn order.
- [ ] `nextTurn` advances, wraps to 0 and increments `round` at the end.
- [ ] `prevTurn` steps back, wraps to last and decrements `round` (not below 0).
- [ ] **Dead monster** (`monster:true`, hp ≤ 0) is moved to the bottom by `reorderDeadMonsters`, with the turn pointer kept on the acting creature.
- [ ] `nextTurn`/`prevTurn` **skip dead monsters**, with a guard preventing an infinite loop when all remaining are dead monsters.
- [ ] A dead **non-monster** (PC/NPC) keeps its position (not reordered, not skipped).
- [ ] `movePlayer` swaps adjacent entries up/down; rejects out-of-range / invalid direction (400).
- [ ] `reorderPlayer` moves `from`→`to`; turn pointer follows the acting creature; re-sorts dead monsters after.
- [ ] `reorderPlayer` rejects out-of-range indices (400).
- [ ] `setRound`/`getRound` round-trips the round number.

## API — Character (`api/character`)
- [ ] `createCharacter` creates a Character doc and links it to `req.user.character`.
- [ ] `saveCharacter` / `saveOwnCharacter` persist the opaque `character` object.
- [ ] **HP decoupling:** `preserveHp` keeps the stored current HP when saving the rest of the sheet.
- [ ] `saveCharacterHp` / `saveOwnCharacterHp` update only HP; `getCharacterHp` reads it back.
- [ ] `saveCharacterHpBulk` updates many characters' HP; skips entries that aren't real characters.
- [ ] `getCharacterList` excludes the requester's own characters; `getOwnCharacterList` returns only theirs.
- [ ] `getNPCList` returns only the caller's NPCs.
- [ ] `setNPC` toggles the `npc` flag; protects NPCs where required.
- [ ] `deleteCharacter` removes the doc and pulls it from the owning user; `deleteOwnCharacter` only affects the caller's.
- [ ] `getCharacter` (privileged) vs `getOwnCharacter` (ownership-checked via `isOwnedByUser`).
- [ ] **`exportCharacters`** returns every character with a resolved `owner` ({userID, name} or null).
- [ ] **`importCharacters`** creates new, **unowned** docs from a list; returns `{created}`; rejects non-array body (400).
- [ ] **`reassignCharacter`** pulls a char from any owner and adds it to the target; rejects when char/user missing (404).
- [ ] **`reassignCharacter` rejects NPCs (400).**

## API — Admin (`api/admin`)
- [ ] `getUserList` returns id/name/master/admin/character only (no password/session).
- [ ] `setAdmin` / `setMaster` flip the respective flag.
- [ ] **`setPassword`** sets another user's password (then login works with the new one).
- [ ] `setPassword` rejects passwords shorter than 8 chars (400) and missing user/body (400/404).

## API — Settings (`api/settings`)
- [ ] `changeOwnPassword` requires the correct current password; rejects wrong current (401).
- [ ] `deleteOwnAccount` deletes the user and all of their characters, then destroys the session.
- [ ] `deleteAccount` (admin) deletes a target user and their characters.

## API — Books (`api/books`)
- [ ] `getBookList` returns the file names in `books/pdf`; the directory is auto-created if missing.
- [ ] `uploadBook` accepts a PDF (multer) → 200; the file lands in `books/pdf`.
- [ ] Non-PDF upload is rejected (no `req.file`) → 400.
- [ ] `deleteBook` removes a named file → 200; missing file → 404.
- [ ] `deleteBook` is path-traversal safe (`path.basename`; refuses names escaping `books/pdf`).

## API — Monster & Encounter (`api/monster`, `api/encounter`)
- [ ] Monster: create / list / update / delete / get-by-id, gated to master|admin.
- [ ] Encounter: create / list / update / delete, gated to master.

## API — CORS / app wiring (`api/server.js`)
- [ ] An `OPTIONS` preflight returns **204** with the `Access-Control-*` headers, before auth/static can reject it.
- [ ] Mirrored privileged vs `/me` routes enforce ownership (a normal user cannot act on others' data).

## Web — character sheet model & math (`web/src/Pages/character-sheet/sheet`)
- [ ] `DnDCharacter` / `Color` enum shape is stable (snapshot of default object).
- [ ] Ability modifier calculation from score (e.g. 14 → +2).
- [ ] "Re-Calculate Modifiers" derives saves/skills correctly from scores + proficiency.
- [ ] HP bar fill reflects current vs max HP.

## Web — initiative entry helpers (`web/src/Pages/initiative`)
- [ ] `calcHp` formats `hp(+temp)/max` (temp only shown when > 0).
- [ ] `calcMaxHp` accounts for temp HP exceeding max.
- [ ] **`acDisplay`** renders `"14"` normally and `"14 (+2)"` when shield is active.
- [ ] Save accessors (`strSave`…`chaSave`) render signed values and fall back to 0 on NaN.
- [ ] Dead detection (hp === 0) drives the dead styling/icon.
- [ ] `getColor` maps each `ColorMarkerEnum` to the right colour.
- [ ] `getIcon` returns a tooltip-wrapped icon for every `StatusEffectsEnum`, with a description.
- [ ] HP visibility: NPC HP hidden from players unless `shareHp` (or master).

## Web — shared
- [ ] `withAuth` HOC redirects to `/login` on a 401 from `/api/me`.
- [ ] Axios is configured with the API prefix and sends credentials (cookies).

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

## Books viewer
- [ ] The Books page lists available PDFs and opens one in the viewer.

## Monster & Encounter editors
- [ ] Create, edit, and delete a monster (master/admin).
- [ ] Build an encounter from monsters and add it to the initiative board.
