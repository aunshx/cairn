# cairn

A single-page interview-prep tracker. Vite + React 19 + TypeScript + Tailwind v4, Supabase for auth
and Postgres, deployed static. Single user by design.

## Read these first

- **`SUMMARY.md`**: what the project is, how it is put together, what the code actually does now.
- **`DESIGN.md`**: the design system, palettes, contrast rules, writing style.
- **`README.md`**: setup, schema SQL, deploy, access control.

## Commands

```
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build, must pass
npm run lint     # oxlint, must be clean
```

There is no test runner. Verify with a throwaway SSR probe, then delete it:

```
cat > src/probe.tsx <<'EOF'
  ... seeded state, renderToString, console.log real values ...
EOF
npx vite build --ssr src/probe.tsx --outDir .probe --logLevel error && node .probe/probe.js
rm -rf src/probe.tsx .probe
```

The output directory must be inside the project so Node resolves `react-dom`. This catches render
crashes and lets you print actual numbers instead of asserting they are right.

## Hard rules

- **No code comments.** The user asked for this explicitly. The codebase has none. Do not add any.
- **No em dashes**, in code, copy or docs. Comma, colon or full stop instead.
- **No AI attribution** in commits, README, or code. No `Co-Authored-By`, no "generated with".
- **Commits**: one logical change, short imperative lowercase subject, no trailing period, push after
  each. Work directly on `main`; there are no branches.
- **No new dependencies** without asking. Charts are hand-written SVG. Confetti is hand-rolled.

## Things that will bite you

1. **`validateState` in `src/lib/types.ts` rebuilds state field by field on read.** Add a field to
   `TrackerState` or `DayRecord` and forget it there, and the data saves fine then vanishes on
   reload. Always add the validator line, and prove it with a JSON round-trip deep-diff.

2. **The programme shape is state, not constants.** `state.totalDays` and `state.cycle` are user
   editable. All targets come from `planTargets(state)` by walking the schedule. Never hardcode 42,
   262, or any day count, in logic or in copy.

3. **Schedule functions take `cycle` with a default of 4.** Omitting it compiles and is silently
   wrong. Always pass `state.cycle`.

4. **All mutations go through `update(recipe)`** from `useTracker`. Recipes are pure
   `(state) => state` functions living in `useTracker.ts`. Components hold UI state only.

5. **Metrics are pure functions in `src/lib/metrics.ts`.** Do not compute a figure inside a metrics
   component.

6. **Contrast**: both themes must clear 4.5:1 on text. Light mode shipped broken once. `DESIGN.md`
   has the checker command.

7. **New nested controls inside a task row** need a `[data-row-interactive]` wrapper, or clicking
   them will toggle the task.

## Working style the user expects

They iterate fast and in short messages, often several in flight at once. They want the change made
and pushed, not discussed. Alongside that:

- Say plainly when a request contradicts the spec, then do what they asked. This has happened for the
  visual direction, the celebration animation, and the day-cycle split.
- Verify rather than assert. When they ask "does this persist" or "is light mode working", check it
  and show the output. Both of those questions found real bugs.
- Flag genuine ambiguity instead of guessing when the answer changes the work materially, for example
  the 3+1 split, which invalidated four targets.
