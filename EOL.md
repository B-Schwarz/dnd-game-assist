# EOL / Deprecated Packages

Audit date: **2026-06-30**. Sources: `npm view <pkg> deprecated` (authoritative for npm-flagged), [endoflife.date](https://endoflife.date) (runtime platforms), and upstream project status.

Re-check before acting — dates and statuses move. Most items below are coupled to the framework majors intentionally held back during the 2026-06-30 conservative dependency update (React 19, Chakra v3, Mongoose 8, etc.).

## Runtime platforms (EOL)

| Component | Where | Status | Date | Notes / remediation |
|---|---|---|---|---|
| ~~**MongoDB 6.0**~~ | `docker-compose.yml`, `mongo.sh` | ✅ **Resolved 2026-06-30** → `mongo:8.0` | — | Bumped to 7.0 (Phase 1), then to 8.0 (EOL 2029-10) once Mongoose 8 (Phase 2) landed. **Note:** on Linux kernel 6.19+ mongo:8.0 aborts on startup (SERVER-121912 — TCMalloc rseq ABI bug); both files set `GLIBC_TUNABLES=glibc.cpu.hwcaps=-SHSTK` to work around it (verified on kernel 7.0.14; harmless on older kernels). Remove when the upstream TCMalloc fix ships. |

Not EOL (for reference): Node `lts` base image (Node 24 LTS, EOL 2028-04); **Express 4** — endoflife.date reports `eol: false` (maintenance + security support).

## Frameworks / libraries — unmaintained or EOL (runtime, in use)

| Package | Where | Status | Notes / remediation |
|---|---|---|---|
| ~~**create-react-app / `react-scripts` 5.0.1**~~ | `web` (build toolchain) | ✅ **Resolved 2026-06-30** → migrated to **Vite 8 + Vitest 4** | Replaced react-scripts with Vite (build/dev) and Vitest (tests). Dropped `react-scripts`, `@babel/plugin-proposal-private-property-in-object` (CRA-transitive), `web-vitals` + the unused `reportWebVitals`, and `@types/jest`. The `REACT_APP_*` env contract is preserved via a `vite.config.ts` `define` (no source churn); output stays in `build/` for the API to serve. `yarn audit` for `web` went from CRA's long advisory list to **0 vulnerabilities**, and this unblocks future React 19 / Chakra v3 work. |
| ~~**`mongoose` 6.13.x**~~ | `api` | ✅ **Resolved 2026-06-30** → `^8.24.1` | Upgraded to Mongoose 8 (bundles mongodb driver v6). Fixed the 7→8 breaking changes in handlers: removed callback args from `deleteOne`/`deleteMany`/`updateOne` (callbacks dropped in v7) and `await`ed them, and switched `mongoose.Types.ObjectId(x)` → `new mongoose.Types.ObjectId(x)`. Unlocked MongoDB 8.0. |
| ~~**`moment` 2.x**~~ | `api` | ✅ **Resolved 2026-06-30** → removed | Was a direct dependency but imported nowhere in source; dropped entirely (no replacement needed). |

## npm-flagged deprecated packages (in use)

| Package | Version | Where | Deprecation message → remediation |
|---|---|---|---|
| ~~**`uuid`**~~ | 9.0.1 → 11.1.1 | `api` (runtime) | ✅ **Resolved 2026-06-30.** Bumped to `uuid@11` (keeps the CommonJS `{ v4 }` API used in `user.model.js`; 12–14 are ESM-only). |
| ~~**`@types/lz-string`**~~ | 1.5.0 | `web` (dev) | ✅ **Resolved 2026-06-30** → removed. Also dropped the `lz-string` runtime dep (unused in source; now only present transitively). |
| ~~**`@babel/plugin-proposal-private-property-in-object`**~~ | 7.21.11 | `web` (dev) | ✅ **Resolved 2026-06-30** → removed with the CRA→Vite migration (it was pulled in transitively by react-scripts). |

## Suggested order of remediation

1. ✅ **Quick wins (done 2026-06-30):** `uuid@9 → 11`; remove `moment` (unused); remove `lz-string` + `@types/lz-string` (unused); `mongo:6.0 → 7.0`. API (106) + web (89) test suites and `CI=true npm run build` all green.
2. ✅ **Medium (done 2026-06-30):** Mongoose 6 → 8 (`^8.24.1`) + MongoDB 8.0. Handler call-sites fixed for the v7 callback removal and `new`-required `ObjectId`. API suite 106/106 green; `strictQuery` deprecation warning gone.
3. ✅ **Large/structural (done 2026-06-30):** Replaced Create React App with Vite 8 + Vitest 4 — clears the dev-toolchain audit items (`web` now audits to **0 vulnerabilities**) and unblocks React 19 / Chakra v3. Build (`tsc && vite build`) and the 89-test Vitest suite are green; the dev server, production bundle, and a headless dev-page smoke were verified.
