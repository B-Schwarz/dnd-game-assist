# D&D Game Assistant

A self-hosted web app for running **Dungeons & Dragons 5e (2024)** games at the
table. Players keep their character sheets online; the Dungeon Master runs
combat from a shared initiative tracker, builds monsters and encounters, and
serves the group's rulebooks — all from one place.

> **Status:** v2.0 · **License:** [MIT](LICENSE)

---

## Highlights

- **2024 character sheets** — a full two-page 5e (2024) sheet embedded in the
  app: abilities, saves and skills with proficiency/expertise pips, a live HP
  bar, spell slots and a prepared-spell list, equipment & inventory, and a
  character portrait. Auto-saves on every change, with an **EN/DE language
  toggle** and a per-character marker colour.
- **Backstory attachments** — upload a PDF/DOCX/TXT backstory per character
  (stored server-side, up to 100 MB) and download it later.
- **Initiative / combat tracker** — the DM's command centre: turn & round
  tracking, drag-to-reorder, hidden combatants, shields shown as `AC 14 (+2)`,
  concentration/rage markers, dead-combatant handling, and one-click HP sync
  back to the players' sheets (which poll for changes live). Keyboard shortcuts
  `J`/`K` step through combatants.
- **Monster & encounter editors** — build reusable monsters and pre-load whole
  encounters into the tracker with automatic initiative (DM-only).
- **Role-gated admin** — manage users and roles, set passwords, and
  import / export / reassign character sheets.
- **Rulebook viewer** — upload PDFs and read them in-app.

---

## Tech stack

| Layer    | Stack                                                            |
|----------|------------------------------------------------------------------|
| Frontend | React 18 · TypeScript · Vite · Chakra UI                          |
| Backend  | Node · Express · Mongoose 8 (session-based auth)                  |
| Database | MongoDB 8                                                        |
| Tests    | Jest + supertest (API) · Vitest + Testing Library (web) · Playwright (e2e) |
| Runtime  | Docker / Docker Compose                                          |

It's a **monorepo with no root package manager** — the `api` and `web` apps are
installed and built independently (each has its own `yarn.lock`).

---

## Repository layout

```
api/     Express + Mongoose backend. Single entry point (server.js); one folder
         per domain (auth, character, initiative, monster, encounter, admin,
         settings, books, db). See api/README.md for the full endpoint table.
web/     Vite frontend (React + TS). Pages under web/src/Pages/<domain>. The
         2024 character sheet lives in web/src/Pages/character-sheet/sheet/.
e2e/     Standalone Playwright acceptance suite (its own package.json).
migration/  Python scripts to move data from a 1.x deployment to 2.0.
Books/   PDF rulebooks baked into the API image and served from /api/books.
```

---

## Getting started

### Prerequisites

- Node.js (LTS) and **yarn**
- A local **MongoDB on `127.0.0.1:27017`** for development
  (`./mongo.sh` starts one in Docker, or use any local `mongod`)

### Run everything (dev)

```bash
./dev.sh        # starts the API (nodemon) and web (Vite) together; Ctrl+C stops both
```

Then open **http://localhost:3000** and log in with the seeded admin account
(see [Roles](#roles--first-login)).

### Run the apps individually

```bash
# API — http://localhost:4000  (nodemon injects dev env vars via api/nodemon.json)
cd api && yarn install && npm run dev

# Web — http://localhost:3000
cd web && yarn install && npm start
```

### Full stack with Docker

```bash
docker-compose up --build      # app on http://localhost:5000
```

This builds the web bundle, then the API (which serves the static web build in
production), plus a MongoDB container.

> **Note:** on Linux kernel 6.19+, stock `mongo:8.0` aborts on startup
> (SERVER-121912). The compose file and `mongo.sh` set
> `GLIBC_TUNABLES=glibc.cpu.hwcaps=-SHSTK` to work around it (harmless on older
> kernels).

---

## Configuration

The backend is configured via environment variables (injected by
`api/nodemon.json` in dev, and by `docker-compose.yml` / your host in prod):

| Variable            | Purpose                                   | Dev default                        |
|---------------------|-------------------------------------------|------------------------------------|
| `DB_URI`            | MongoDB connection string                 | `mongodb://127.0.0.1:27017/dnd`    |
| `CORS_URL`          | Allowed origin for the web app            | `http://localhost:3000`            |
| `DND_COOKIE_SECRET` | Session cookie secret                     | _(set in nodemon.json)_            |
| `NODE_ENV`          | `production` serves the static web build  | —                                  |

The frontend reads `REACT_APP_API_PREFIX` (API base URL) and
`REACT_APP_VERSION` from its `.env[.mode]` files; in production the prefix is
empty so the API is same-origin.

### Persistent data (Docker)

Two named volumes keep runtime-writable data across image rebuilds:

- `books` → `/app/books/pdf` — admin-uploaded rulebooks (seeded on first run
  from the PDFs baked into the image)
- `attachments` → `/app/attachments` — per-character backstory documents

MongoDB persists to the `./mongo_volume` bind mount.

---

## Roles & first login

Auth is **session-based**. On first connect to an empty database the API seeds a
default admin:

```
username: admin
password: asdasdasd
```

**Change this immediately** on any real deployment (Settings → password).

There are three role flags that compose on top of a normal user:

- **user** — owns and edits their own character sheets
- **master** (DM) — runs the initiative tracker and the monster/encounter editors
- **admin** — manages users, roles, and character import/export/reassignment

Most data endpoints come in mirrored pairs: a privileged route
(`/api/char`, master/admin) and a self-scoped route (`/api/char/me`, owner-only).

---

## Testing

```bash
# API — Jest + supertest against an in-memory MongoDB (no local DB needed)
cd api && npm test                     # run one suite: npm test -- <pattern>

# Web — Vitest + Testing Library (jsdom)
cd web && CI=true npm test             # run one: CI=true npm test -- <pattern>

# Acceptance — Playwright against the real stack (needs MongoDB + seeded admin)
cd e2e && npm install && npx playwright install chromium && npm test
```

`npm run build` in `web/` is the type-check gate (its `tsc` step fails on any
type error before Vite builds). CI (`.github/workflows/ci.yml`) runs three jobs
on every PR — API unit tests, web unit tests + production build, and the
Playwright acceptance suite — all of which must pass to merge.

---

## Further reading

- [`api/README.md`](api/README.md) — full HTTP endpoint reference (URL, method, params, role, return)
- [`e2e/README.md`](e2e/README.md) — running the Playwright acceptance suite
- [`migration/README.md`](migration/README.md) — migrating a 1.x deployment to 2.0
- `CLAUDE.md` — architecture notes and conventions for contributors
