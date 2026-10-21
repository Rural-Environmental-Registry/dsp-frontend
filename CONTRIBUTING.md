# Contributing to rer-dsp-frontend

Thank you for your interest in contributing to the DSP frontend.

This repository is the web interface of the **DSP (Data Sharing Platform)**,
part of the Rural Environmental Registry (RER). It shows environmental data,
maps, and downloads for partner institutions.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

Full project documentation lives in
[dsp-docs](https://github.com/Rural-Environmental-Registry/dsp-docs).
The guide below covers this module only.

---

## What belongs here

Changes to the web interface belong in this repository:

- Screens and components under `src/`
- Calls to the DSP API under `src/services`
- Tests under `tests/unit`
- This module's `README.md`

The interface reads labels, hierarchy, screens, and KPI cards from
`GET /config/installation`. Do not hardcode adopter-specific labels in Vue.
Map layers come from the backend (`GET /map/getBaseMaps` and
`GET /map/getLayers`). Downloads go through the backend API. The map itself
talks to GeoServer Exhibition (WMS/WFS) through
`@rural-environmental-registry/map_component`.

Other DSP work belongs in its own repository:

| Change | Repository |
|--------|------------|
| Architecture, installation, and platform guides | [dsp-docs](https://github.com/Rural-Environmental-Registry/dsp-docs) |
| REST API | [dsp-backend](https://github.com/Rural-Environmental-Registry/dsp-backend) |
| Stack orchestration, gateway, and adopter configuration | [dsp-core](https://github.com/Rural-Environmental-Registry/dsp-core) |
| Source-database migration | [dsp-job-data-migration](https://github.com/Rural-Environmental-Registry/dsp-job-data-migration) |
| Pre-generated download files | [dsp-job-geo-file-generation](https://github.com/Rural-Environmental-Registry/dsp-job-geo-file-generation) |
| Shared Leaflet map package | [`@rural-environmental-registry/map_component`](https://www.npmjs.com/package/@rural-environmental-registry/map_component) |

---

## How to contribute

### 1. Bugs and features

1. Open an issue describing the problem or the change in the dsp-core repository:
   https://github.com/Rural-Environmental-Registry/dsp-core/issues
2. Fork the repository
3. Create a branch from `develop`: `git checkout -b feat/short-description`
4. Make the change
5. Run the tests: `npm run test`
6. Commit with a clear message
7. Open a pull request against `develop`

### 2. Interface changes

Keep each piece in the folder that already owns it:

| Area | Folder |
|------|--------|
| Screens (Home, Geoservices, About) | `src/views` |
| Reusable UI | `src/components` |
| HTTP calls | `src/services` |
| Request and response types | `src/types` |
| Routes | `src/router` |
| Formatting and map helpers | `src/utils` |

About page Markdown is rendered in `src/utils/renderMarkdown.ts` (`marked` and
DOMPurify). If About is disabled in configuration, hide the screen and the menu
item. Cover the change with a test in `tests/unit`, next to the matching area
(`views`, `components`, `services`, `utils`).

### 3. Documentation of this module

Keep `README.md` limited to this module: purpose, stack, and where it fits.
Platform-wide guides (architecture, quick start, full installation) go to
[dsp-docs](https://github.com/Rural-Environmental-Registry/dsp-docs), in both
`docs/pt-br/` and `docs/en/`.

---

## Local setup

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

The dev server listens on port 5173. The application base path is `/dsp/`
(`VITE_BASE_URL`). The API base is `/dsp-backend` (`VITE_DSP_API_URL`). When
that variable is missing at build time, the app reads `urlBackend` from
`public/config/env.json`.

The preferred way to exercise the full stack (API, map, gateway) is `./start.sh`
in [dsp-core](https://github.com/Rural-Environmental-Registry/dsp-core). Through
the gateway the interface is at http://localhost:8026/dsp/.

Run the tests:

```bash
npm run test
```

Coverage:

```bash
npm run coverage
```

Type-check and production build:

```bash
npm run build
```

---

## Code standards

- Vue 3 (Composition API), TypeScript, Vite, Tailwind CSS, Vitest
- Tests use jsdom
- The public path stays `/dsp/`. In Docker the app is served there and does not publish a host port
- Business data and installation text come from the backend. The frontend does not talk to the adopter source database
- KPI cards use `GET /config/installation` for labels and `POST /totalizer/` for values
- Do not add a local fallback for map layer configuration. A failure must stay visible in the UI

---

## Review process

1. **Tests** — `npm run test` must pass
2. **Peer review** — at least one maintainer reviews the pull request
3. **Merge** — approved pull requests are merged into `develop`

---

## Commit message format

Use conventional commits:

```
feat: hide the About menu item when the page is disabled
fix: keep KPI cards at zero until the totalizer responds
test: cover the initial map view from installation config
docs: describe the dev server in the module README
```

**Types:**

- `feat:` — new behavior
- `fix:` — bug fix
- `test:` — tests only
- `docs:` — documentation only
- `refactor:` — internal change with the same behavior

---

## Getting help

- **Questions or bugs:** open an issue in the dsp-core repository:
  https://github.com/Rural-Environmental-Registry/dsp-core/issues
- **Stuck on a pull request:** ask in the pull request
- **Platform behavior:** see
  [dsp-docs](https://github.com/Rural-Environmental-Registry/dsp-docs)

---

## License

By contributing, you agree that your contributions will be licensed under the
[GNU General Public License v3.0](LICENSE).

---

**Thank you for helping improve the DSP frontend.**
