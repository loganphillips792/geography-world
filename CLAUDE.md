# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server on port 5173
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

There are no tests, no linter, and no typecheck step configured.

## Stack

Vite + React 18 SPA. Key runtime dependencies:
- **react-simple-maps** — map rendering (TopoJSON + D3); supports nested `<Geographies>` layers inside one `<ZoomableGroup>`
- **react-router-dom v7** — `BrowserRouter`; both `/country/:alpha2` and `/state/:stateCode` are shareable URLs
- **i18n-iso-countries** — alpha-2 ↔ numeric ↔ English-name lookups
- **countries-list** — alpha-2 → continent code (used for the country game's continent filter)
- **flagcdn.com** — country flag images by alpha-2 (`w40` tooltip/sidebar, `w80` game banner, `w160` modal). No state flags.
- **TopoJSON sources** —
  - `cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` (~100KB, fetched on mount)
  - `cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` (~1MB, lazy-fetched only when the "Show US states" setting toggles on)

## Architecture

### Two parallel ID systems

The app speaks two universal lowercase IDs that flow through URLs, click events, and rendering:

| Domain | ID | Examples | Source |
|-|-|-|-|
| Countries | ISO 3166-1 alpha-2 | `us`, `fr`, `xk` | `i18n-iso-countries` + `NAME_OVERRIDES` |
| US states | USPS postal abbreviation | `ca`, `ny`, `tx` | hardcoded `FIPS_TO_STATE` map |

Routes mirror this: `/country/:alpha2` and `/state/:stateCode`. When adding features, derive from these IDs — never from display names or numeric IDs.

### Resolvers in `src/lib/`

- **`lib/countries.js`** — `resolveAlpha2(geo)` converts a world-atlas geography (numeric ISO id) to alpha-2. Falls back to `NAME_OVERRIDES` keyed by `geo.properties.name` for territories Natural Earth tags with non-ISO numeric ids (Kosovo `-099`, `N. Cyprus`, `Somaliland`). If a territory doesn't highlight or click, add it here. Also exports `getContinent(alpha2)` and `extractCountriesFromTopology(topology)` (the latter produces the game's country pool).
- **`lib/states.js`** — `FIPS_TO_STATE` (FIPS code → `{postal, name}`), plus `getStateByFips`, `getStateByPostal`, and `PLAYABLE_STATES` (50 states excluding DC and PR — used as the state-game pool).

### Routes and modals

`App.jsx` always renders `<WorldMap>`, `<Sidebar>`, and the floating buttons. A `<Routes>` block conditionally renders `<CountryModal>` or `<StateModal>` as an **overlay** (not a separate page) so map zoom/pan, prefetched flags, and game state survive modal open/close. Modals close by navigating to `/`, not `navigate(-1)` — direct-link visitors get the map underneath, not an empty history stack.

### US states as a second `<Geographies>` layer

When `settings.showUSStates` is true and `usStatesTopology` has loaded, `WorldMap.jsx` renders a second `<Geographies>` block inside the same `<ZoomableGroup>`, after the world layer so it draws on top. State `<Geography>` elements emit their own click events (postal codes) and tooltips (state names, no flag). The state-layer click handler routes to `/state/<postal>` outside of games and to `onStateClick` during games.

### Game system

Game state lives in `App.jsx` (`INITIAL_GAME` shape). One state shape covers two game types:
- `type: 'country'` — pool from `extractCountriesFromTopology`, filterable by continent, mode `name | flag | both`
- `type: 'state'` — pool from `PLAYABLE_STATES`, name-only

Click routing during a game (`gameActive = game.status === 'playing'`):
- `WorldMap` emits `onCountryClick(alpha2)` for country geos and `onStateClick(postal)` for state geos.
- `App.handleCountryClick` only evaluates if `game.type === 'country'`.
- `App.handleStateClick` evaluates if `game.type === 'state'`; if `game.type === 'country'` it forwards to `handleCountryClick('us')` so state-area clicks during a country game still count as US.
- An effect in `App.jsx` auto-enables `settings.showUSStates` when a state game starts (so states are visible without the user toggling them manually).

Feedback flashes the **target** geometry green (correct) or red (incorrect) — `feedbackAlpha2` for country games, `feedbackPostal` for state games. Both are passed to `WorldMap`.

Sidebar and map tooltips are disabled while a game is active to prevent cheating; sidebar list is dimmed but still scrollable.

### Settings

`Settings.jsx` is a modal, not a route — opening/closing isn't in the URL. State (`showUSStates`) lives in `App.jsx`. The us-atlas TopoJSON is lazy-fetched in a `useEffect` the first time `showUSStates` flips on, then cached in App state for the session.

### Flag prefetch

`WorldMap.jsx` fires `new Image(); img.src = ...` for all ~250 alpha-2 codes on mount. This warms the browser HTTP cache so hover tooltips, sidebar items, the modal, and the game banner all hit cache instead of network. Image objects are GC'd; only the cached bytes persist.

### Styling

All styles are inline (no CSS file beyond `src/index.css` for resets). Dark palette: background `#0a0e1a`, surfaces `#111827`/`#1f2937`, accent `#3b82f6`, success `#10b981`, error `#ef4444`, text `#e0e6ed`, muted `#9ca3af`. Floating buttons: 48px circle, `#3b82f6`, bottom-left, stacked (play at `bottom: 16`, gear at `bottom: 80`). Reuse this palette and pattern when adding new UI.

## Deployment note

`BrowserRouter` requires the host to fall back to `index.html` for unknown paths so `/country/jp` and `/state/ca` direct-loads work in production. Vite's dev server does this automatically. A static host (Vercel, Netlify, GitHub Pages) needs an SPA rewrite rule before deploy.
