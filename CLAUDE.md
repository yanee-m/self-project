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

### Personalization (profile, palettes, fonts)

`src/lib/profile.js` defines `DEFAULT_PROFILE` and the pickable option lists (`SPARKLE_OPTIONS`, `PALETTES`, `FONT_PAIRINGS`). The `profile` object is lifted to `App.jsx` (same pattern as `tasks`/`sessionLog`) because both the hero (title, tagline, sparkle, greeting) and `/settings` need it. `App.jsx` sets `data-palette` and `data-font` attributes on `<html>` in an effect, mirroring how `data-theme` already works — palettes and font pairings are pure CSS overrides of a small set of variables (`--accent-bg`, `--accent-ink`, `--accent2`, `--accent2-ink`, `--hero-grad`, `--mono`, `--sans`), never JS branching. The pastel palette is the zero-cost default: it just points `--accent*` at the existing `--mint-*`/`--sun-*` tokens, so it inherits dark-mode correctness for free; forest/ocean/sunset each define their own full light+dark variable set. When adding a UI element that should react to the theme palette (not just light/dark), use `--accent-bg`/`--accent-ink` for primary actions and `--accent2`/`--accent2-ink` for highlights — don't reach for `--mint-*`/`--sun-*` directly outside of area-color swatches.

Tagline falls back to `dailyQuote()` (`src/lib/quotes.js`, date-seeded so it's stable within a day) whenever `profile.heroTagline` is empty — there's no separate "use rotating quote" toggle, an empty field just means "rotate."

### Custom task areas

Task areas are no longer hardcoded. `src/lib/areas.js` exports `DEFAULT_AREAS` (seed data) and `getAreas()` (a read-only snapshot via `getItem`, for components like `Stats` that need area labels but don't own area state). `TaskBoard` owns the live `areas` array itself (same local-state-with-storage-sync pattern as `RemindersCard`/`Habits`) and renders an inline "manage areas" panel for add/rename/recolor/delete. Each area is `{ key, label, icon, color }` where `color` is one of the five fixed swatch keys in `AREA_COLORS` (`pink`/`lav`/`blue`/`mint`/`sun`) — never a free-form hex value, so area colors stay theme-correct in both light/dark and across palettes. Deleting an area is blocked (button `disabled`) while any task still references its key, to avoid orphaning tasks. The CSS classes are generic per-color (`.lt-pink`, `.row-mint`, etc.), not per-area-key, so custom areas render correctly without new CSS.

### Completion feedback and toasts

Checking off a task, reminder, or habit day triggers a brief `.pop` class (added to the row's state for ~600ms via a `setTimeout` ref, same pattern in all three components) that plays the `celebrate-pop` keyframe in `index.css`. Habits additionally show a `.toast` (fixed-position, auto-dismissing) when a streak crosses a milestone in `MILESTONES` (`Habits.jsx`) — compute the streak before and after the toggle with the pure `habitStreak()` helper and compare, since `setHabits` is async.

### Known gap: hover-only delete buttons on touch

Delete (`×`) buttons across Tasks, Reminders, Brain Dump, Habits, Calendar events, and the areas manager are revealed via `:hover` (`opacity:0` by default). This doesn't work on touchscreens. Tracked as a deliberate deferred fix — if you touch one of these components, consider whether it's in scope to fix visibility there too.
