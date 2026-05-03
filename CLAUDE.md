# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Progress Log

**At the start of every session, check whether `PROGRESS.md` exists in the project root.**

If it exists:
1. Read it fully.
2. Explicitly tell the user what is complete, what is pending, and what decisions have been recorded.
3. Ask clarifying questions if anything is ambiguous before proceeding.
4. Continue from the first pending task — do not restart completed work.

As tasks are completed, mark them `[x]` in `PROGRESS.md` and move them to the Completed section.
When all tasks are done, delete `PROGRESS.md`.

## Commands

```bash
npm run dev        # Start dev server (Vite, default port 5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint (JS/JSX only, no TypeScript)
npm run deploy     # Build + publish to GitHub Pages via gh-pages
```

## Architecture

This is a single-page React portfolio site deployed to GitHub Pages at `naveen-karthik-reddy.github.io/portfolio`.

**Routing** (`src/main.jsx`): React Router v7 with a shared `Layout` wrapper. Routes: `/` (main portfolio), `/articles` (articles list), `/articles/:slug` (article detail). All pass through `Layout`.

**Layout** (`src/Layout.jsx`): Owns all theme state. Manages dark/light mode and theme variant (persisted to `localStorage`). Creates the MUI `ThemeProvider` and renders `TopNav` + `Footer` around `<Outlet />`. Themes are defined inline as a `themes` object with `dark`/`light` color configs per variant. `scrollToSection` navigates to `/` first if on another route before scrolling.

**Main page** (`src/App.jsx`): Single scrollable page rendering all resume sections (Summary, Experience, Projects, Skills, Education, Achievements) using Framer Motion scroll-triggered animations. Experience items use collapsible MUI `Collapse`.

**Articles** (`src/pages/ArticlesPage.jsx`): Dual-mode page — shows a list when no `slug` param, shows a single article (rendered with `react-markdown`) when a slug is present.

**Data layer** (`src/data/`): All content is in plain JS files, exported from `src/data/index.js`. To update portfolio content, edit the relevant file:
- `portfolioData.js` — name, title, contact info, links
- `experienceData.js` — work history
- `projectData.js` — projects
- `skillsData.js` — skills by category (object with arrays)
- `educationData.js` — education
- `achievementData.js` — achievements list
- `articlesData.js` — articles with inline markdown content; uses `id` field as URL slug

**Styling**: MUI v7 with Emotion. No Tailwind or CSS modules. Component-level `sx` props only. Theme colors are centrally controlled via `Layout.jsx`'s `themes` object — do not hardcode colors in components; use `theme.palette.*` or `"primary.main"` etc. in `sx`.

**Deployment**: `vite.config.js` sets `base: '/'` for root domain. Change to `'/portfolio'` for GitHub Pages subdirectory deployment.

## Perf-Planner maintenance rule

`src/projects/perf-planner/REFERENCE.md` is the single source of truth for the perf-planner project.
**Update it whenever you change any file inside `src/projects/perf-planner/`.** Specifically:

- Added/removed/renamed a file → update §2 (Project Structure)
- Changed a data schema (Page, Variation, Resource, Settings, Waterfall Row) → update §3
- Added/changed/removed a reducer action → update §4
- Changed metric computation (FCP, LCP, TBT, CLS, SI) → update §5.1
- Changed waterfall generation or bar scaling → update §5.3
- Changed roadmap suggestions → update §5.4
- Changed Lighthouse import logic → update §6
- Changed curve fitting → update §7
- Changed IndexedDB schema (version bump) → update §8
- Changed export/import format → update §9
- Changed waterfall phase colors or interaction → update §11
- Changed component data flow or props → update §12
- Changed auto-save behavior → update §13
- Changed any known limitation → update §15

Keep section numbers in REFERENCE.md stable — add new sections at the end if needed.

## ESLint note

`no-unused-vars` ignores variables matching `/^[A-Z_]/` — uppercase components imported but not directly called won't error.
