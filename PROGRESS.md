# Progress Log

<!-- LLM instructions: Read this file at the start of every session.
     Acknowledge its contents to the user, ask clarifying questions
     if anything is ambiguous, then continue from the first pending task.
     Update completed tasks as you finish them.
     Delete this file once all tasks are marked complete. -->

## Status: IN PROGRESS

---

## Completed

- [x] **Point 1 — Article system enhancements**
  - Added `types` field to every article in `articlesData.js`
  - Built filter chip UI in `ArticlesPage.jsx` (All / Performance / Product / LLM·AI)
  - Filter state synced to URL query param (`?type=performance`)
  - Chip active state uses MUI `variant`/`color` props for reliability
  - Article list uses `key={activeType}` + `animate` to re-stagger on filter change

- [x] **Point 2 — Navbar architecture**
  - Desktop: name (left) + inline links (right)
    - Landing page: section links + Articles + Projects + social icons + theme controls
    - All other pages: Articles + Projects + theme controls only
  - Mobile: name (left) + hamburger (right) — hamburger is mobile-only (`xs`–`sm`)
    - Drawer contains: section links (landing only) → Articles → Projects → social + theme at bottom
  - Social icons (LinkedIn, GitHub, email): landing page only on both desktop and mobile
  - `themeAnchor` state moved from `Layout.jsx` into `TopNav.jsx`

- [x] **Point 3 — Projects section**
  - Confirmed route structure: `/projects` list + `/projects/:slug` detail
  - Fixed Holdings Analyzer heading text clipping: `lineHeight` increased, `pb: "0.05em"` added to both heading instances

- [x] **Point 4 — Performance Planner UX**
  - `PageManager.jsx` empty state: single "Calibrate from Lighthouse" button; import demoted to a small text link labelled "Resuming work? Import a saved session"
  - `PageManager.jsx` page list header: "Calibrate new page" (contained, primary); "Import session" (text button with tooltip explaining it restores a previous session)
  - Export remains a per-page download icon — correct as a final-step action, no change needed

- [x] **Point 5 — 12 performance articles**
  - All typed `["performance"]`, dates range 2026-03-01 → 2026-04-19
  - Beginner: browser-rendering-pipeline, critical-rendering-path
  - Intermediate: resource-loading-strategies, intersection-observer-debounce-throttle, browser-networking-and-caching, reflow-repaint-layout-thrashing, core-web-vitals, lighthouse-and-rum
  - Advanced: resource-hints, bundle-optimization, http2-and-http3, service-workers-and-caching

- [x] **Point 6 — Progress log system**
  - This file (`PROGRESS.md`) created at project root
  - `CLAUDE.md` updated with a "Progress Log" rule instructing future sessions to check it

---

## Pending

- [ ] **Point 7 — Update REFERENCE.md for Performance Planner**
  - File: `src/projects/perf-planner/REFERENCE.md`
  - Reason: Point 4 changed `PageManager.jsx` — the entry-point UX (empty state + page list header)
  - What to document: updated UX flow — Lighthouse calibration is now the primary entry point; JSON import is secondary (restore-session framing); export remains a per-page icon action

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Article `types` are separate from `tags` | `tags` are display labels; `types` drive filtering logic |
| Hamburger is mobile-only | Desktop gets inline links; hamburger only needed at smaller breakpoints |
| Social icons on landing page only | Keeps non-landing navbars minimal and focused |
| Lighthouse calibration as primary entry | Matches the intended workflow: calibrate → vary → export |
| JSON import framed as "restore session" | Removes confusion about when to use it |
| 12 performance articles, no stub entries | Every article has full content — no placeholders committed |
