# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install       # install dependencies
npm run dev       # start Vite dev server with HMR (http://localhost:5173)
npm run build     # production build to dist/ (static, no server required)
npm run preview   # serve the dist/ build locally to sanity-check it
```

There is no test suite and no linter configured in this project.

## Architecture

This is a client-only React + Vite SPA with `react-router-dom` for routing. All persistence is `localStorage`; there is no backend.

### State ownership: local vs. lifted

Most section components (`RemindersCard`, `BrainDump`, `Habits`) own their state entirely: they read from `localStorage` via `src/lib/storage.js` on mount and write back on every change, with no state shared elsewhere. `Calendar` has no state at all — it's computed from `Date.now()` at render time.

Two pieces of state are lifted to `App.jsx` because more than one route/component needs to read or mutate them:
- `tasks` — read by the task board, the focus timer (to populate the "link a task" dropdown and bump `focusSessions`), and stats.
- `sessionLog` — appended to by the focus timer, read by stats.

The focus timer's own runtime state (mode, remaining seconds, running/paused, linked task) is *not* local to the `FocusTimer` component — it lives in the `useFocusTimer` hook, called once in `App.jsx`, specifically so the countdown keeps running (interval, notifications, tab title) when the user navigates away from `/focus` to another page. `FocusTimer` (the full page) and `FocusSummary` (the dashboard tile) are both just presentational, driven by the same `timer` object passed down as a prop.

### Dashboard tiles vs. full pages

The `/` route (`src/pages/Dashboard.jsx`) renders a grid of compact "summary tile" components — `RemindersSummary`, `TasksSummary`, `FocusSummary`, `BrainDumpSummary`, `HabitsSummary`, `StatsSummary`, `CalendarSummary`. Each of these is a **named export colocated in the same file as the section's full component** (e.g. `src/components/TaskBoard.jsx` exports both `TaskBoard` and `TasksSummary`), not a separate file — keep new sections following this pattern rather than centralizing summaries elsewhere.

Since a summary tile and its full page are never mounted at the same time (different routes), summary components for storage-backed sections (reminders, brain dump, habits, calendar) just call `getItem()` directly on render for a read-only snapshot — they don't need their own `useEffect`/subscribe machinery. Summaries for the two lifted-state sections (tasks, focus) receive their data as props from `App.jsx` instead.

### The storage module is the only localStorage boundary

`src/lib/storage.js` exports `getItem`/`setItem`/`removeItem`, all namespaced under a `focus-dashboard:` prefix. Components never call `localStorage` directly. This is intentional: swapping in a real backend later (e.g. Supabase) means reimplementing this one module, not touching any component. Keep it that way when adding new persisted state.

### Routing and deployment

`App.jsx` wraps everything in `BrowserRouter` and renders the hero + horizontal nav (`NavLink`, active-state via `isActive`) above `<Routes>`. Because this is client-side (HTML5 history) routing, direct loads of a non-root path (e.g. refreshing `/focus`) need a server-side rewrite to `index.html`. That's what `public/_redirects` (`/* /index.html 200`) provides — it's required for Cloudflare Pages and gets copied into `dist/` automatically by Vite's build.

### Styling

Single global stylesheet, `src/index.css`. All colors are CSS custom properties on `:root`, re-themed under `html[data-theme="dark"]` — App.jsx toggles that attribute on `<html>` and persists the choice via the storage module. When adding new UI, use the existing custom properties (`--card-bg`, `--ink`, `--ink-dim`, `--line`, `--shadow`, etc.) rather than hardcoding colors, so dark mode stays correct for free.
