# Testing layout-only PRs on cu-bettr

Use this skill when reviewing/verifying a PR that touches header/main/shell layout without changing data or auth code.

## Devin Secrets Needed
None for testing. (Optional: `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` if you want to run the dev server against the real backend instead of stubbing — see below.)

## Two gates to be aware of

1. **Vercel preview URL on this project is auth-protected.** Vercel Deployment Protection is enabled for previews, so opening the per-PR preview link in a logged-out browser returns `401 Authentication Required`. This may or may not be true in the future — if it is, don't try to fight it; use the workaround below.
2. **The app's main entry shows a full-screen loader until Supabase responds.** `App.jsx` sets `loading: true` and only flips to `false` after `supabase.from('habits').select(...)` resolves. Without Supabase env vars (or a stub), the page is permanently a spinner — you will see no header, no layout, nothing useful for visual verification.

## Preferred workflow (no secrets required)

1. **BEFORE comparator:** open `https://cu-bettr.vercel.app` (production / `main` branch) in the desktop browser. Production is publicly reachable and reflects the pre-PR state — perfect side-by-side baseline.
2. **AFTER state:** check out the PR branch locally and stub `src/lib/supabase.js` with a minimal mock client that returns 5–8 seeded habits. The stub must support the chained calls the app uses: `.from(...).select(...).order(...)` (return the builder from `.select()` and `.order()`, not a Promise — otherwise `.order` is called on a Promise and the page stays stuck on the loader forever). The builder must also be `await`-able (implement a `.then` that resolves to `{ data, error: null }`).
3. Run `npx astro dev --host 0.0.0.0 --port 4321` and open `http://localhost:4321/`.
4. **Do not commit the stub.** Revert with `git checkout -- src/lib/supabase.js` before posting results.

## Concrete assertions for any sticky-header / shell-alignment PR

Measure objectively with the browser console — don't rely on screenshots alone:

```js
const logo = document.querySelector('header img');
const firstLabel = Array.from(document.querySelectorAll('main *')).find(el => el.textContent.trim().toUpperCase() === 'FOCUS LAYER');
const headerInner = document.querySelector('header > div');
const main = document.querySelector('main');
console.log(JSON.stringify({
  viewportWidth: window.innerWidth,
  logoLeft: Math.round(logo.getBoundingClientRect().left),
  labelLeft: Math.round(firstLabel.getBoundingClientRect().left),
  delta: Math.round(firstLabel.getBoundingClientRect().left - logo.getBoundingClientRect().left),
  headerInnerLeft: Math.round(headerInner.getBoundingClientRect().left),
  headerInnerWidth: Math.round(headerInner.getBoundingClientRect().width),
  mainLeft: Math.round(main.getBoundingClientRect().left),
  mainWidth: Math.round(main.getBoundingClientRect().width),
}));
```

For sticky + glass:

```js
const h = document.querySelector('header');
const s = getComputedStyle(h);
console.log(JSON.stringify({
  position: s.position, // expect 'sticky'
  top: Math.round(h.getBoundingClientRect().top), // expect 0 after scrolling
  zIndex: s.zIndex,
  bgColor: s.backgroundColor, // alpha should be the recipe's value (e.g. 0.6)
  backdropFilter: s.backdropFilter, // expect 'blur(...) saturate(...)'
  borderBottom: s.borderBottom,
}));
```

Pass criteria for a sticky-header alignment PR:
- `delta === 0` (or within ~1px) at desktop width — logo and first body label share the same left edge.
- `headerInnerLeft === mainLeft` and `headerInnerWidth === mainWidth` — shared shell column.
- `position === 'sticky'` and `top === 0` after scrolling.
- Recipe values match the PR description.

## Resizing for the narrow-viewport regression check

The shell has `xdotool` available; use it to drive the browser window without leaving the desktop test environment:

```
xdotool search --name "CU Bettr" windowsize 420 800 windowmove 0 0
```

Then restore with:

```
xdotool search --name "CU Bettr" windowsize 100% 100% windowmove 0 0
```

`wmctrl` is **not** installed by default on this VM — don't reach for it.

## Reporting

- Post **one** comment on the PR with collapsible `<details>` sections, leading with the headline before/after table.
- Include the Devin session link.
- Attach a short annotated screen recording (use `computer` action `record_annotate` with `setup` / `test_start` / `assertion` types).
- Write the long-form report to a `.md` file with inline image attachments and link it from the PR comment.

## Things this app's layout does NOT do (don't waste time testing them)

- It does not have unit/integration tests in the repo.
- It does not have Storybook or visual-regression CI.
- The only CI checks today are Vercel build, Vercel Preview Comments, and Devin Review.
