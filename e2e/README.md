# Acceptance tests (Playwright)

End-to-end tests that drive the **real** stack — the Express API (`:4000`) and
the CRA web app (`:3000`) — through a browser, the way a user would. They are a
standalone package (the monorepo has no root package manager), mirroring how
`api/` and `web/` are installed independently.

## Prerequisites

- A **MongoDB on `127.0.0.1:27017`** (the API dev env in `api/nodemon.json`
  points there). From the repo root you can start one with `./mongo.sh`
  (Docker), or run any local `mongod`.
- The tests assume the seeded default admin (`admin` / `asdasdasd`), which the
  API bootstraps into an empty `users` collection on first connect.

## Install

```sh
cd e2e
npm install
npx playwright install chromium   # one-time browser download
```

## Run

```sh
# starts the api + web servers itself (reusing them if already running),
# against the Mongo above:
npm test

npm run test:headed   # watch it in a browser
npm run test:ui       # Playwright UI mode
npm run report        # open the last HTML report
```

To run against an already-running stack (and skip Playwright's own server
startup), point it at the base URL:

```sh
E2E_BASE_URL=http://localhost:3000 npm test
```

## What's covered

`global-setup.ts` provisions two stable test users via the admin API before the
suite runs (a plain `e2e_user` and a master `e2e_master`); identity-mutating
tests (password change, account delete) mint their own throwaway users.

- `auth.spec.ts` — login/redirect/logout, and access control (no Admin nav or
  initiative master controls for a normal user).
- `character.spec.ts` — create/autosave, colour picker + EN/DE toggle + player
  name persistence, list + delete, and the two-column responsive layout.
- `admin-users.spec.ts` — register, toggle master, set password (then log in
  with it), delete user.
- `admin-characters.spec.ts` — export-all + per-row export (downloads), import
  (unowned), reassign a PC, NPC not reassignable.
- `books.spec.ts` — PDF upload/delete, non-PDF rejection, viewer lists + opens.
- `settings.spec.ts` — change/verify own password, wrong-current rejection,
  delete own account, displayed version.
- `initiative.spec.ts` — add player/monster/NPC/encounter, sort + clear,
  next/prev + J/K hotkeys + round wrap, panel auto-open, AC `(+shield)` display,
  Leben speichern → sheets, dead-state ordering + red/grey rows, gold turn
  accent, hidden/NPC tag, drag-to-reorder, and the player view (hidden NPCs +
  NPC HP hidden unless shared).
- `monster-encounter.spec.ts` — create/edit/delete a monster, build an encounter
  and add it to the board.

Tests use unique (timestamped) names and clean up after themselves, so they are
safe to re-run against the same database.

### Gotchas
- Run from the `e2e/` directory — Playwright's `testDir`/config only resolves
  there; running from the repo root makes it scan the web Jest tests and fail.
- `global-setup.ts` is in the config import graph, so it must NOT import anything
  under `tests/` (that would pull spec files into the config phase and break
  `test.describe`). It inlines its constants for that reason.
- Chakra's `NumberInput`/`Switch`/`Select` don't reliably fire React `onChange`
  under Playwright; tests assert rendered output and persist via stable controls,
  with the edit *logic* covered by the web unit tests.
