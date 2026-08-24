# cairn design system

Everything here is enforced by tokens in `src/index.css`. Components reference semantic names
(`bg-panel`, `text-signal`), never raw hex. If you find a hex value in a component, that is a bug.

## Where the look came from

`BUILD_SPEC.md` section 11 asked for a flat technical logbook: no gradients, no shadows, no rounded
corners, no celebration. That was built, then the user rejected it and asked for something "exciting
and modern". The current design is the override. Do not restore the flat look by citing the spec.

## Palettes

Both themes are complete token sets. Dark is the default; light overrides the same variables.

| token | dark | light | use |
|---|---|---|---|
| `ground` | `#090d15` | `#f4f7fb` | page background, text on saturated fills |
| `panel` | `#131a27` | `#ffffff` | card surface |
| `panel-2` | `#1b2433` | `#eef2f8` | inputs, nested surfaces, hover |
| `rule` | `#273246` | `#c8d4e2` | borders and dividers |
| `ink` | `#e9eef6` | `#14202e` | primary text |
| `muted` | `#90a0b4` | `#51647c` | secondary text |
| `dim` | `#5d6e84` | `#5f7186` | micro labels, metadata |
| `signal` | `#5eead4` | `#0f766e` | completion, progress, success |
| `accent` | `#818cf8` | `#4f46e5` | gradient partner, secondary emphasis |
| `flag` | `#fbbf24` | `#b45309` | flags, unsaved, behind pace |
| `bad` | `#fb7185` | `#be123c` | failure, missed, destructive |

**Contrast is a hard requirement, not a preference.** Light mode shipped broken once: teal text was
3.80:1 and button labels 3.54:1. Every text pair must clear 4.5:1 in both themes. Because
`ratio(a, b) === ratio(b, a)`, a `signal` dark enough to read on white automatically makes white
readable on `signal`. Check before changing any colour:

```
node -e "const L=h=>{const c=h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>{const[x,y]=[L(a),L(b)].sort((p,q)=>q-p);return((x+.05)/(y+.05)).toFixed(2)};console.log(r('#0f766e','#ffffff'))"
```

## Theme mechanics

- Default is dark. `prefers-color-scheme: light` applies the light set unless the user forced dark.
- `data-theme="light"` / `"dark"` on `<html>` overrides the system, set by `ThemeToggle`.
- The preference is stored in `state.theme` in Postgres, not browser storage, so the sign-in screen
  follows the OS until data loads. Deliberate; the spec bans browser storage for app data.
- `--shadow-surface` and `--glow-strength` are themed too. Never hardcode a shadow.

## Type

IBM Plex Sans for prose, IBM Plex Mono for anything numeric, label-like or metadata. Numerals use
`tabular-nums` so figures do not jitter as they change.

The `.micro` class is the workhorse label: 10px mono, uppercase, `0.16em` tracking, `muted`. Use it
for every panel title and field label. Body copy sits at 12 to 14px; stat values at 26px mono
semibold.

## Surfaces and shape

`.surface` is the card treatment: subtle top-lit gradient, 1px `rule` border, `--radius-lg`, and the
themed shadow. `Card` wraps it. Radii: `sm` 6px for chips and small controls, `md` 10px for inputs
and buttons, `lg` 14px for cards, full round for status pills and icon buttons.

`.field` is the input treatment, including the teal focus glow. Use it rather than restyling inputs.

## Colour semantics

One meaning per colour, consistently:

- `signal` only for completion and progress. `accent` only as its gradient partner and for secondary
  emphasis, never as a second success colour.
- `flag` only for flags, unsaved state and behind-pace.
- `bad` only for failure, missed days and destructive actions.
- Gradients run `signal -> accent`, and only on things that represent progress: completed timeline
  tiles, progress bars, the checked checkbox, the primary button, the day number.

Percentage-driven scales run danger to green: `bad` below 50, `flag` to 89, `signal` to 99, gradient
at 100. See `toneFor` in `DayStrip.tsx` for the canonical implementation.

## Motion

Transitions are 150 to 200ms for interaction feedback, 300 to 500ms for bars and fills that animate
a value change. Buttons scale to `0.97` on press. Everything is disabled under
`prefers-reduced-motion`, including confetti, which is hidden outright rather than shortened.

## Interaction rules

- Every interactive element gets `cursor: pointer` from the base layer. Buttons and selects default
  to an arrow in browsers, which is why this is handled globally rather than per component.
- Focus is one softened outline at 70% opacity with a 3px offset. Do not add a second ring on top;
  that was fixed once already.
- Task rows are clickable anywhere to toggle. Nested controls are excluded by the `INTERACTIVE`
  selector and by wrapping sub-regions in `[data-row-interactive]`. Any new nested control inside a
  row needs that wrapper or it will toggle the task when clicked.
- Destructive actions confirm in place: the button re-labels to a confirm state rather than opening a
  dialog. Reset is the exception and requires typing the word.

## Writing

- No em dashes anywhere. Use a comma, colon or full stop. En dashes in time ranges are fine.
- No emoji.
- Never hardcode the day count in copy. Read `state.totalDays`.
- Every metric carries a one-line plain reading underneath saying what the number means.
- Empty states say what will appear and what produces it. Never a blank panel or a zero chart.
- Errors are specific about what went wrong and what to do. Never a generic failure.

## Layout

`max-w-6xl` content column. Cards are `gap-6` apart, grids `gap-4`. The shell is a flex column with
`flex-1` on `main` so the footer stays at the bottom on short pages. The header is sticky with a
blurred background.

Responsive: the timeline is a single scrolling row, stat grids collapse 6 to 3 to 2 to 1, and side
by side panels stack below `lg`. Charts are `viewBox` SVG at `w-full`, so they scale rather than
overflow.
