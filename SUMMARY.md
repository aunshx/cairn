# cairn, orientation for a new session

A single-page interview-prep tracker. Vite + React 19 + TypeScript + Tailwind v4, Supabase for auth
and storage, deployed as static files. 100 commits on `main`, no branches, pushed to
`github.com/aunshx/cairn`.

Read this before `BUILD_SPEC.md`. The spec is the original brief and **parts of it are now stale**;
where they disagree, this file and the code are correct. The stale sections are listed at the bottom.

## Running it

```
npm i
cp .env.example .env      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SIGNUP_CODE
npm run dev               # http://localhost:5173
npm run build             # tsc -b && vite build
npm run lint              # oxlint, currently clean
```

Without the two Supabase vars the app renders `SetupNotice` instead of the tracker. The schema SQL
lives in `README.md` and in `SetupNotice.tsx` (`SCHEMA_SQL`), and the two must be kept in step.

## The one non-obvious thing about persistence

Everything is a single `jsonb` blob in one row: `tracker.data`, keyed by `user_id` with
`default auth.uid()`. Writes are `upsert({ data: wholeState })`.

**`validateState` in `src/lib/types.ts` rebuilds the object field by field on read.** A field added
to `TrackerState` or `DayRecord` but forgotten there will save fine and silently vanish on reload.
This has been the single most likely way to break the app. Any new field needs a line in
`validateState` / `validateDay`, and the cheap way to prove it is a JSON round-trip deep-diff (see
Verifying below).

## Architecture

```
src/lib/
  types.ts      TrackerState, DayRecord, all shapes, validateState, plan constants
  schedule.ts   day types, task lists per day type, date maths
  catalogs.ts   HLD / LLD / GFE / Mechanisms / Behavioral / DSA catalogs, pick encode/decode
  neetcode.ts   generated: 250 problems, name/category/difficulty/url/slugs
  metrics.ts    every derived figure, pure functions taking TrackerState
  problems.ts   URL to problem-title parsing
  supabase.ts   client singleton, isConfigured, SIGNUP_CODE
  status.ts     application status colour tokens
src/hooks/
  useAuth.ts    session boot, sign in/up/out, specific error copy
  useTracker.ts the store: load, debounce, retry, save status, plus every mutation recipe
```

**State.** One `TrackerState` in `useTrackerStore`, exposed via `TrackerContext`. All mutations go
through `update(recipe)` where a recipe is `(state) => state`, defined in `useTracker.ts`. There are
no other writers. Components hold only UI state (open/closed, drafts, filters).

**Save semantics.** 700ms debounce, 20s background flush while dirty, 5s retry on failure and on
`online`, `beforeunload` guard, snapshot-compare so a mid-flight edit is never dropped, and a 401
path that refreshes the token then holds unsaved work in memory behind the sign-in screen.

**Metrics are pure.** Nothing is computed inside a metrics component; they all call `metrics.ts`.

## The programme model, read this before touching the schedule

The 42-day / 3+1 shape is **not hardcoded**. `state.totalDays` and `state.cycle` are user-editable in
Settings, and **all eight targets are derived by walking the schedule** in `planTargets(state)`.

- Every `cycle`-th day is type `M` (mock and revision). Others alternate A, B, skipping M days.
- `workIndex(day, cycle) = day - floor((day - 1) / cycle)`; odd is A, even is B.
- Schedule functions take `cycle` as a parameter with a default. **The default is a trap**: a call
  site that omits it silently uses 4. Always pass `state.cycle`.

Current defaults produce:

| shape | A | B | M | DSA | apps | mocks | mech |
|---|---|---|---|---|---|---|---|
| 42 days, 3+1 | 16 | 16 | 10 | 262 | 96 | 20 | 8 |
| 42 days, 6+1 | 18 | 18 | 6 | 258 | 108 | 12 | 9 |

Saving a programme change **clears `days` and resets to day 1** on purpose: a given day no longer
falls on the same date or carries the same tasks. Catalogs, applications, deltas and redos survive.

## Behaviour worth knowing

- **Nothing is auto-assigned.** HLD, LLD, GFE, Behavioral and the mechanism slot are all *pickers*:
  you choose what you actually did, or type something off-list. The old next-unchecked projection was
  deleted.
- **DSA is logged inline** on the `dsa1` / `dsa2` rows with NeetCode type-ahead. Adding a problem
  bumps that row's counter so the burn-up cannot undercount. Anything matched to the list ticks
  itself off in the DSA catalog. Pasting a URL resolves through both NeetCode and LeetCode slugs, so
  `neetcode.io/problems/duplicate-integer` becomes "Contains Duplicate".
- **Applications are top-level records**, not day data, because status outlives the day they were
  sent. Each carries the day it was sent. Jobs tab in the catalog manages them.
- **Mock days** show a revision panel collecting everything logged or picked in the previous
  `cycle - 1` days. Its per-item ticks use namespaced `done` keys (`revise:d1:dsa:0`) which are
  invisible to completion metrics, since those only count tasks in that day's schedule.
- **Timeline colour** scales danger to green by completion, but the red/0% band only applies to days
  whose date has passed. Today and future days use a neutral or in-progress tone.

## Verifying changes

There is no test runner. The pattern used throughout is a throwaway SSR probe, which catches
render crashes and lets you print real values:

```
cat > src/probe.tsx <<'EOF'
  ... import components, build a seeded state, renderToString, console.log ...
EOF
npx vite build --ssr src/probe.tsx --outDir .probe --logLevel error && node .probe/probe.js
rm -rf src/probe.tsx .probe
```

Output must go **inside the project** so Node can resolve `react-dom`. Always delete the probe after.
Run `npx tsc -b` and `npm run lint` before committing; both are currently clean.

## Conventions

- Commit messages: short, imperative, lowercase, no trailing period. Commit one logical change,
  push after each. No AI attribution anywhere, per the spec.
- **No code comments.** The user asked for this explicitly; the codebase has none.
- **No em dashes** anywhere, in code or docs. En dashes in time ranges are fine.
- Copy must never hardcode the day count. Read `state.totalDays`.
- Both light and dark themes must pass 4.5:1 on text. The light palette was fixed once already
  (`#0e9384 -> #0f766e` teal, `#7b8ca1 -> #5f7186` dim) after failing.

## Where the spec is stale

`BUILD_SPEC.md` still describes, and the code no longer does:

- **Visual direction (section 11).** It forbids gradients, shadows, rounded corners and celebration
  animation. The user overrode all of that: the app uses rounded surfaces, elevation, teal-to-indigo
  gradients, and confetti on finishing a day.
- **The plotting-paper grid.** Removed, replaced with soft radial glows.
- **Rest days.** Replaced by M days, then the cycle became configurable.
- **Fixed targets.** All derived now.
- **Gym.** Strength in the morning, Cardio in its own evening block, both with activity chips
  (CST, BB, LA, Cycling, Run, Inc Walk) and an editable duration.
- **Auto-assigned catalog tasks and the standalone DSA log.** Replaced as described above.

Sections still accurate: 1 (stack), 2 (auth), 3 (RLS, plus `default auth.uid()`), 4 (save
semantics), 5 (data model, extended), 12 (README), 13 (repository and commit discipline).

## Open items

- **Mechanism target caps at 12**, the catalog size. A long programme affords more mechanism days
  than there are entries, so the bar completes while mechanism days keep coming.
- **GFE affords 16 slots against 18 entries** at 42 days / 3+1, since `gfe` only runs on A days. The
  last two must be ticked in the catalog directly.
- **Access code is client-side only.** `VITE_SIGNUP_CODE` is inlined into the bundle by Vite. The
  real lock is turning off sign-ups in Supabase, or the Postgres trigger documented in `README.md`.
- **Theme flashes to system** on the sign-in screen, because the preference lives in Postgres and has
  not loaded yet. Deliberate: the spec bans browser storage for app data.
