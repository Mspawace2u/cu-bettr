# cu-bettr — repo fingerprint & guardrails

**Trigger:** When working in the `cu-bettr` repo.

## Purpose of app
Low-pressure habit-tracking SPA for AuDHD users recovering from burnout. Uses "Habit Layering" — grade friction on a 1-3 scale per habit, auto-suggest new layers after 7-10 low-resistance entries. Built as a dopamine-first, non-judgmental retrospective view (no shame-driven streak counters).

See committed `/misc-docs/prd.md` for full product brief.

## Stack fingerprint
- Astro 6 SSR + `@astrojs/vercel` 10
- React 19 (`.jsx`)
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Framer Motion 12, Lucide React, canvas-confetti
- Data: `@supabase/supabase-js` 2
- Overrides: `path-to-regexp` 6.3.0, `vite` ^7

## Observed design system (strict — follow, don't silently "fix")
- **Base:** `#050505` bg, `#F3F4F6` text (`--color-brand-foreground`), `#5B6B7F` muted (`--color-brand-muted`)
- **Brights in use (as CSS custom properties):**
  - `--color-brand-primary: #ffe44d` Highlighter Yellow
  - `--color-brand-secondary: #9b5cff` Electric Purple
  - `--color-brand-accent1: #2de2e6` Totes Turquoise
  - `--color-brand-accent2: #ff2f92` Punk Rock Pink
- **Font pair:** Urbanist + Kumbh Sans (option 8 from approved 9-pair list). Loaded via Google Fonts `@import url()` at top of `global.css`.
- **Sticky header:** standardized via PR #1. Shared `--shell-max-w: 480px` and `--shell-pad-x: 1.5rem` layout tokens.

## Run locally (if needed)
```bash
npm install
npm run dev
```
Required env vars (not in repo — source from user or `.env`):
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- Any service-role key if migrations needed

## Supabase notes
- Wipe-and-reset script: `npm run nuke` (runs `scratch/nuke-db.js`) — destructive, user-initiated only
- `/misc-docs/App-with-DevTools.jsx` is a dev-only reference component with inspection tools; don't merge it into `src/components/App.jsx`

## Known issues / backlog
*(none currently tracked — update this file when issues surface)*

## Agent Army alignment
Follows Patty's Agent Army design system (see user Knowledge note). Compliments `gig-spottr-bot` as the second live reference implementation.
