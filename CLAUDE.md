# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A web app to assist running Dungeons & Dragons 5e games: character sheets, a combat/initiative tracker, monster and encounter editors, role-gated admin, and a PDF book viewer. It is a monorepo with no root package manager — the `api` and `web` apps are installed and built independently.

## Repository layout

- `api/` — Express + Mongoose backend (Node). Single entry point `api/server.js`; one folder per domain (`auth`, `character`, `initiative`, `monster`, `encounter`, `admin`, `settings`, `books`, `db`).
- `web/` — Create React App frontend (React 18 + TypeScript + Chakra UI). Pages under `web/src/Pages/<domain>`.
- `web/src/Pages/character-sheet/sheet/` — the **D&D 2024 character sheet**, embedded directly in the frontend: `dnd-character.ts` (the `DnDCharacter` model + `Color` enum — the source of truth for character data shape), `CharacterSheet.tsx` (the full two-page sheet; keeps a color picker, EN/DE language toggle, and player-name field), and `character-sheet.css`. The design punch-list lives in `TODO.md` at the repo root.
- `dnd-character-sheets-master/` — **legacy / unused.** Formerly a vendored fork of the `dnd-character-sheets` library that `web` consumed via a `file:` dependency; the sheet was reimplemented in-app (above) and this directory is no longer built, imported, or referenced by `web/package.json`. Ignore it unless explicitly asked.
- `Books/` — PDF source files baked into the API image and served from `/api/books`.

## Common commands

All three packages use **yarn** (yarn.lock present in each).

### API (`cd api`)
- `npm run dev` — run with nodemon. Env vars are injected by `api/nodemon.json` (sets `DB_URI=mongodb://127.0.0.1:27017/dnd`, `CORS_URL=http://localhost:3000`, etc.), so a local MongoDB on 27017 is the only prerequisite. Listens on **4000**.
- `npm run start` — plain `node server.js` (production; requires env vars set externally).
- `npm test` — Jest unit/integration suite (see **Testing** below). No local MongoDB needed: `mongodb-memory-server` spins up an isolated Mongo per run. Run one suite: `npm test -- <pattern>` (e.g. `npm test -- initiative`).

### Web (`cd web`)
- `npm start` — CRA dev server on **3000**. Uses `.env.development` → `REACT_APP_API_PREFIX=http://localhost:4000`.
- `npm run build` — production build into `web/build/`. Uses `.env.production` (empty prefix → same-origin API). The `start`/`build` scripts inject `REACT_APP_VERSION=$npm_package_version`; the settings page reads `process.env.REACT_APP_VERSION` for the displayed version (it no longer imports `package.json`, which would have bundled the whole dependency list into the client).
- `npm test` — CRA/Jest test runner (watch mode). Run a single test: `npm test -- <pattern>` or `CI=true npm test -- <pattern>` for one-shot.
- To check for lint/type errors as the CI/Docker build would, run `CI=true npm run build` — it promotes warnings to errors and prints "Compiled successfully." on a clean tree.

### Both at once (dev)
- `./dev.sh` (repo root) — starts the API (nodemon) and web (CRA) together and shuts both down on Ctrl+C. Needs a local MongoDB on 27017. The character sheet is in-app now, so there is no separate library to compile.

### Full stack via Docker
- `docker-compose up --build` — builds the web bundle, then the API (which serves the static web build in production), plus a MongoDB container. App is exposed on **localhost:5000** → container 4000. `Dockerfile` documents the build order (it no longer builds any character-sheet library).

## Architecture notes

### API request flow
`server.js` wires every route inline with a middleware chain: `app.<method>(path, isAuth, [role], handler)`. There is no router file — to find a handler, read `server.js` to map URL → handler name, then open the matching domain folder's `index.js`. Each domain `index.js` exports plain `(req, res)` handlers; there are no controller/service layers.

### Auth and roles
- Defined in `api/auth/index.js`. Auth is **session-based**, not JWT. On login a random token is pushed onto the user's `session[]` array (stored in Mongo) and also kept in the express-session cookie (`dnd.sid`). `isAuth` looks up the user by `session.token`, attaching `req.user`.
- Three role gates compose after `isAuth`: `isMaster`, `isAdmin`, `isMasterOrAdmin` (checked against boolean `master`/`admin` flags on the User). A typical "act on anyone's data" route requires master/admin; the `/me` variant of the same route lets a normal user act only on their own data (ownership checked inside the handler, e.g. `isOwnedByUser`).
- Many endpoints come in mirrored pairs: privileged (`/api/char`) vs. self-scoped (`/api/char/me`). When adding character/initiative features, preserve this pairing.

### Data models
Mongoose schemas in `api/db/models/`: `user`, `character`, `monster`, `encounter`. Character sheet data is stored as an opaque `character` sub-document — its shape is defined by `web/src/Pages/character-sheet/sheet/dnd-character.ts`, and the backend does not interpret its fields. (Because it's opaque, sheet-model changes need no API changes; removed fields just become orphan data on existing documents.) Passwords are bcrypt-hashed in a `pre('save')` hook on the User schema.

### Bootstrap behavior
`api/db/index.js` seeds a default admin (`name: admin`, `password: asdasdasd`) on first connect if the users collection is empty. The MongoDB connection is configured via `DB_URI`.

### Frontend structure
- Routing in `web/src/App.tsx`; each route renders `<Menu selected={...}/>` plus the page. Role/auth-gating on the client uses `web/src/Pages/login/withAuth.tsx` (HOC that pings `/api/me` and redirects to `/login` on 401) and `/api/me/master` · `/api/me/admin` probes to show/hide features.
- All API calls go through `axios` with base `process.env.REACT_APP_API_PREFIX` and must send credentials (cookies) for the session to work.
- The character sheet page (`web/src/Pages/character-sheet/character.tsx`) renders `<CharacterSheet>` from `sheet/` and autosaves on change. The initiative board imports the **same** `DnDCharacter` type from `sheet/dnd-character.ts`, so the sheet model and the combat tracker are coupled through that type — but the tracker only *reads* a subset (`name`, `hp`/`maxHp`/`tempHp`, `ac`, `dex`, the six `*Save` fields, `speed`, `color`), and monster/encounter "add" flows in `initiative/add/` synthesize that same subset.
- The initiative tracker is the most complex feature: `web/src/Pages/initiative/initiave-entry.tsx` (note the misspelled filename) is the largest component, with master-only controls (turn/round, reordering, hidden players, adding players/monsters/encounters/NPCs from `initiative/add/`).
- To verify sheet/UI changes visually, the app can be driven with Playwright against a running stack (log in at `/login` with the seeded `admin`/`asdasdasd`, then create/open a character).

### Testing (API)
- Suites live in `api/__tests__/*.test.js` (Jest, `jest.config.js` runs serially). Two styles:
  - **Pure-logic** (`initiative.test.js`): the initiative board is module-level state, so tests `jest.resetModules()` + re-`require` for isolation and call the `(req, res)` handlers with a mock res (`__tests__/helpers.js`).
  - **Integration** (`auth`/`character`/`admin`/`settings`/`books`/`monster-encounter`/`user-model`/`server`): drive the real Express app with `supertest` against an in-memory Mongo. The shared harness `__tests__/db.js` provides `connect`/`clear`/`disconnect`, role-user + character factories, and a cookie-persisting `loginAgent`.
- `server.js` exports `{app, start}` and only calls `listen()` when run directly (`require.main === module`), so supertest can mount the app without binding a port. **Set env vars before requiring the app** — call the harness `connect()` (which sets `DB_URI` etc.) first, then `getApp()`.
- When a test asserts a status code that differs from the handler, the handler is usually the thing to fix — several validation bugs (missing-id → 400, `setRound` NaN, `sortPlayer` tie-break, `deleteAllMaster` round reset) were found and fixed this way.

### Testing (Web)
- CRA/Jest + React Testing Library. Run one-shot with `CI=true npm test -- <pattern>` (or `--watchAll=false`).
- The character sheet's pure math lives in `web/src/Pages/character-sheet/sheet/sheet-utils.ts` (ability modifiers, proficiency, HP%, contrast ink, the `Color`→hex map). `CharacterSheet.tsx` imports from it, so the math is unit-tested there (`sheet-utils.test.ts`) without rendering, plus a controlled-component test (`CharacterSheet.test.tsx`) that exercises the reactive wiring.
- Two CRA gotchas, both already handled — don't revert them:
  - **axios is ESM**; CRA's Jest doesn't transform it, so any test that transitively imports axios needs the `jest.transformIgnorePatterns` override in `web/package.json` (`node_modules/(?!(axios)/)`).
  - CRA sets **`resetMocks: true`**, which wipes `jest.fn` implementations before each test. In a `jest.mock('axios', …)` factory use **plain functions** (`get: () => Promise.reject(...)`), not `jest.fn(...)`, or the mocked calls return `undefined` and `.then`/`.catch` chains in mounted effects throw. See `App.test.tsx`.

### Testing (Acceptance / e2e)
- `e2e/` is a standalone Playwright package (its own `package.json`, like `api`/`web`) that drives the **real** stack through a browser. Setup: `cd e2e && npm install && npx playwright install chromium`; run with `npm test`.
- Prerequisite: a **MongoDB on 127.0.0.1:27017** (start it with `./mongo.sh` at the repo root, or any local `mongod`) and the seeded `admin`/`asdasdasd`. Playwright's `webServer` starts the API (`:4000`) and web (`:3000`) itself (reusing them if already up); point at a running stack instead with `E2E_BASE_URL=http://localhost:3000 npm test`.
- Tests create timestamp-named characters and clean up, so they're safe to re-run against the same DB. Selectors lean on stable hooks: login `#name`/`#password`, the sheet's `Character Name` placeholder, and `.dnd-ability`/`.dnd-hpbar-fill` classes. See `e2e/README.md`.

### Conventions to match
- API responses are typically bare HTTP status codes (`res.sendStatus(200/401/404)`) rather than JSON bodies; follow that style.
- Some log/comment strings are in German (`"Erfolgreiche Datenbankverbindung"`); this is expected, not a bug.
- The API README (`api/README.md`) is a hand-maintained endpoint reference table (URL / method / params / role / return). Update it when you add or change routes.
