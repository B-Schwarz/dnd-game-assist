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

- `auth.spec.ts` — unauthenticated redirect to `/login`, wrong-credential error,
  successful admin login.
- `character.spec.ts` — create a character, live ability-modifier calc, autosave
  persisting across reload and into the list, and deletion.

The tests create characters with unique (timestamped) names and clean up after
themselves; they are safe to run repeatedly against the same database.
