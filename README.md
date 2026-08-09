# my-dashboard

A personal productivity dashboard with a pastel/typewriter visual theme.
The home page is a dashboard of compact summary tiles — one per section —
and clicking a tile, or a link in the horizontal nav bar, opens that
section's full page.

(Placeholder name: rename the `name` field in `package.json` whenever you
settle on a real one.)

## Features

- **Dashboard home** — a summary tile per section (open task count,
  reminders left today, current focus timer state, active habit streaks,
  weekly stats, today's date), each linking to its full page
- **Task board** — grouped by area (work / study / personal / side
  project)
- **Focus timer** — 25/5/15-minute modes, can be linked to a specific
  task, browser notifications on session end, and keeps running in the
  background even if you navigate to another page
- **Reminders** — a daily checklist plus day/week/month/year progress
  bars
- **Brain dump** — a separate quick-capture list for anything that isn't
  a tagged task
- **Habit tracker** — daily streaks with a 7-day grid per habit
- **Weekly stats** — tasks done, focus sessions, and top area this week
- **Mini calendar** — current month, today highlighted
- **Dark mode** — toggle in the header, persists across reloads

## Tech stack

- **[React 18](https://react.dev/)** — UI, function components + hooks
  only, no class components
- **[Vite 5](https://vitejs.dev/)** — dev server, bundler, and build
  tool
- **[React Router 7](https://reactrouter.com/)** (`react-router-dom`) —
  client-side routing (`BrowserRouter`, `Routes`, `NavLink`)
- **Plain CSS** — a single global stylesheet (`src/index.css`) using CSS
  custom properties for theming; no CSS framework or CSS-in-JS
- **`localStorage`** — all persistence, behind a small storage module so
  a real backend (e.g. Supabase) can be swapped in later without
  touching components
- No backend, no build-time environment variables, no test suite — this
  is a static site by design (see [Deploying to Cloudflare
  Pages](#deploying-to-cloudflare-pages) below)

## Develop

```
npm install
npm run dev
```

Opens a dev server with hot reload, typically at http://localhost:5173.

## Build

```
npm run build
```

Produces a static, deployable site in `dist/`. Nothing server-side is
required — it's plain HTML/CSS/JS.

## Preview the production build locally

```
npm run preview
```

## Deploying to Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `my-dashboard` (if this folder isn't the repo root)

`public/_redirects` (copied into `dist/` on build) routes all paths to
`index.html` so client-side routing works on direct loads/refreshes of a
section page (e.g. `/focus`), not just navigation from the home page.

No environment variables or backend are needed for the current
localStorage-backed version.

## Pages / routes

| Route         | Page                                    |
|----------------|------------------------------------------|
| `/`            | Dashboard — summary tile per section      |
| `/reminders`   | Daily reminders + day/week/month/year bars|
| `/tasks`       | Task board, grouped by area               |
| `/focus`       | Focus timer                               |
| `/braindump`   | Brain dump / quick capture                |
| `/habits`      | Habit tracker with streaks                |
| `/stats`       | This week's stats                         |
| `/calendar`    | Mini calendar                             |

## Project structure

```
src/
  components/     one component per section, each owning its own piece of
                   state, plus a named `*Summary` export used by the
                   dashboard tile (e.g. TaskBoard.jsx exports both
                   `TaskBoard` and `TasksSummary`)
  pages/
    Dashboard.jsx the "/" route: a grid of *Summary tiles
  hooks/
    useFocusTimer.js  the timer's state + effects, lifted to App level so
                   it keeps running while you're on a different page
  lib/
    storage.js    tiny get/set/remove wrapper around localStorage
    areas.js      task areas + focus timer mode definitions
    date.js       date-key / streak / week helpers
  App.jsx         router setup, hero, nav bar, and the state that's
                   genuinely shared across pages (tasks, focus session
                   log, the focus timer)
  index.css       all styles, including the CSS custom properties and
                   the html[data-theme="dark"] overrides
```

## Swapping storage for a real backend

All persistence goes through `src/lib/storage.js` (`getItem` / `setItem` /
`removeItem`). Components never touch `localStorage` directly — they only
call these three functions. To move to Supabase (or anything else) later,
reimplement that module's internals; the components won't need to change.
