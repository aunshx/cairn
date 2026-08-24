# Build spec: 42-day interview prep tracker

A single-page web app tracking a 42-day interview preparation program. No framework, no bundler, no npm install. Deployed as static files on Netlify. Supabase for auth and Postgres.

Deliverable: a working Vite project pushed to GitHub and deployable on Netlify.

Do not ask clarifying questions. Build it, then tell me what you would change about the spec.

---

# 1. Stack

Vite + React 19 + TypeScript + Tailwind CSS. Supabase for auth and Postgres.

```
npm create vite@latest . -- --template react-ts
npm i @supabase/supabase-js
npm i -D tailwindcss @tailwindcss/vite
```

Strict TypeScript. No `any`. No class components. Function components with hooks throughout.

Charts are hand-written SVG components. Do not add a charting library.

**All application data lives in Postgres. No localStorage or sessionStorage for app data.** The one exception is the auth session, which the Supabase client persists itself so the user is not logged out on every reload. This is deliberate; do not work around it.

Config from Vite env vars, with a `.env.example` committed and `.env` ignored:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If either is missing at runtime, render setup instructions instead of the app: the SQL below, where to find the anon key, and the deploy steps.

---

# 1b. Project structure

```
src/
  main.tsx
  App.tsx                     route between auth gate and app shell
  lib/
    supabase.ts               client singleton
    types.ts                  TrackerState and all data shapes
    schedule.ts               day type, task lists, date maths
    catalogs.ts               HLD / LLD / GFE / Behavioral data
    metrics.ts                every derived figure, pure functions
  hooks/
    useAuth.ts                session, sign in, sign up, sign out
    useTracker.ts             load, mutate, debounce, retry, save status
  components/
    AuthGate.tsx
    Header.tsx
    DayStrip.tsx
    SaveStatus.tsx
    today/  TodayView.tsx TaskRow.tsx CounterControl.tsx NoteField.tsx
            DsaLog.tsx RedoQueue.tsx DeltaLog.tsx DayNote.tsx
    metrics/ MetricsView.tsx StatBlock.tsx BurnUpChart.tsx Heatmap.tsx
            TrackCoverage.tsx SlipList.tsx RevisionHealth.tsx RecentNotes.tsx
    catalog/ CatalogView.tsx CatalogRow.tsx
    ui/     Card.tsx Button.tsx Checkbox.tsx Tabs.tsx Modal.tsx EmptyState.tsx
```

**State.** One `TrackerState` object in `useTracker`, exposed through context. Mutations go through a single `update(recipe)` function that produces the next state immutably, marks dirty, and schedules a flush. No Redux, no Zustand; this is one object with one writer.

**Derived values.** Everything in the metrics view is a pure function in `metrics.ts` taking `TrackerState` and returning numbers. No metrics computed inside components. Unit-testable even if no tests are written.

**Types.** Define `TrackerState`, `DayRecord`, `DsaEntry`, `Redo`, `Delta`, `CatalogKey`, `DayType` in `types.ts` and import them everywhere. The JSON blob in Postgres is typed on read with a validation function that fills in missing fields rather than trusting the shape.

**Styling.** Tailwind utilities, with the palette wired into `@theme` as named tokens so components reference `bg-panel` and `text-signal` rather than raw hex. No inline style objects except for computed chart geometry and dynamic widths.

---

# 2. Authentication

Supabase Auth, email and password. No magic links (they need SMTP config on the free tier).

**Signed out:** a centered card. Sign in and Create account in one form with a toggle. Email, password, submit. Errors render inline in the card's voice, specific about what went wrong: wrong password, email not confirmed, password too short. Never a generic failure.

**Signed in:** the app, with the user's email and a Sign out control in the settings panel.

**Boot sequence:** call `getSession()` first and render a loading state until it resolves, so the app does not flash the sign-in screen for an already-authenticated user. Subscribe to `onAuthStateChange` and re-render on sign in and sign out.

**Token expiry:** the SDK refreshes automatically. If a write fails with 401 after a refresh attempt, show the sign-in screen with the unsaved state held in memory, and flush it once they sign back in. Do not discard their work.

# 3. Authorization

Row-level security. A user can read and write exactly one row: their own.

```sql
create table tracker (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table tracker enable row level security;

create policy "own row select" on tracker
  for select to authenticated using (auth.uid() = user_id);
create policy "own row insert" on tracker
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own row update" on tracker
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

No anon policy. No delete policy: the cascade handles account deletion.

Reads and writes never pass a user id from the client. The policy derives it from the JWT. On first sign-in, upsert an empty row.

# 4. Save semantics

This matters more than any feature. Losing a day of notes kills the habit.

- Debounce writes 700ms after any mutation.
- Status indicator in the header, four states: amber "Unsaved", grey "Saving…", green "Saved", red "Save failed — retrying".
- Failed writes retry every 5s and immediately on the `online` event.
- Background flush every 20s while dirty.
- `beforeunload` warning when there are unsaved changes.
- Snapshot state before the request and compare after; if it changed mid-flight, flush again. Never drop a mutation.
- If the initial load fails, show the error and a retry button. Do not render the app with empty state, because the first save would overwrite good data with nothing.

---

# 5. Data model

One JSON blob per user:

```js
{
  start: "2026-08-25",
  day: 1,
  days: {
    "1": {
      done: {},                // taskId -> bool
      n: {},                   // taskId -> count for counter tasks
      dsa: [{name, flag, solved}],
      notes: {},               // taskId -> note, scoped to this day
      note: "",                // freeform day note
      finished: false,
      finishedAt: "2026-08-25T20:14:00Z"
    }
  },
  hld: {}, lld: {}, gfe: {}, mech: {}, beh: {},   // catalog index -> bool
  mechResults: {},             // mech index -> the number measured, free text
  notes: {},                   // "hld:4" -> note, persists across all 42 days
  deltas: [{day, prob, missed, wrong, ask}],
  redos: [{name, due:[d1,d2,d3], cleared:[]}]
}
```

## Day type

- Three work days then one mock day: every 4th day is type `M` (`day % 4 === 0`).
- All other days alternate A, B, skipping M days.
- `workIndex = day - floor((day-1)/4)`; odd is A, even is B.
- There are no rest days. 32 A/B days and 10 M days across the 42.

---

# 6. Views

Three top-level views behind a small tab control: **Today**, **Metrics**, **Catalog**. Today is the default and the one optimized for a foggy 5am. Metrics is where the reflection lives.

## Header (all views)

Large day number `01/42`, day type badge (A · HLD / B · LLD / Rest), the calendar date derived from `start`, days finished, and the save status.

Below it, the signature element: a strip of 42 clickable ticks, one per day. Rest days render shorter. Finished days fill. Current day highlighted. Click to jump.

---

# 7. Today view

Session headers are non-interactive dividers with a time range. Each task row: checkbox, label, subtitle, time or counter, pencil icon expanding a textarea into `days[d].notes[taskId]`.

Counter tasks (`dsa1`: 4, `dsa2`: 3, `apps`: 3) render `−  2/4  +`. The checkbox toggles between 0 and the cap.

Four tasks pull from the catalog, showing the next unchecked item and auto-marking it when ticked:
- `design` → next HLD, on every day type, with the paired reading in the subtitle. Once all 31 HLD are done, this slot relabels to "LLD second pass" and serves the next uncleared LLD instead.
- `lld` → next LLD, on B days
- `gfe` → next GFE component
- `beh` → next behavioral item

### Day A
```
Session 1 · 05:30 – 11:00
  dsa1   4 DSA                          25-min cap each                          06:45
  design HLD problem                    reqs → 40m cold → answer key → delta     07:15
  dsa2   3 DSA                          interleaved, not slabbed                 08:35
  quiz   10 GFE quiz                                                             09:55
Break + Gym 1 · 11:15 – 12:00
  gym1   Cardio, 45 min
Session 2 · 13:00 – 18:00
  gfe    GFE component, timed 2h        no AI, no docs tab                       13:00
  apps   3 applications                 2 A-tier max, rest assembly              15:00
Evening · 18:00 – 21:00
  gym2   Weights, 60 min
  rev    Revision block                 logs → 1 DSA redo → blank-page recall    19:45
  beh    Behavioral, 15 min
  walk   Walk, 20 min
  bed    Screens off 20:30, bed 21:00
```

### Day B
Carries both design problems, so DSA drops to 5. No `quiz`, no `gfe`.
```
Session 1 · 05:30 – 11:00
  dsa1   3 DSA                          25-min cap each                          06:45
  design HLD problem                    reqs → 40m cold → answer key → delta     07:15
  dsa2   2 DSA                                                                   08:35
  lld    LLD problem                    reqs → class diagram → code core → delta 09:25
Break + Gym 1 · 11:15 – 12:00
  gym1   Cardio, 45 min
Session 2 · 13:00 – 18:00
  build  Build slot, hard 2h cap        alternates agentic / HLD mechanism        13:00
  apps   3 applications                                                          15:00
  read   Read 1 Key Tech page + blank-page recall   close it, write what you remember  16:00
Evening · 18:00 – 21:00
  gym2   Weights, 60 min
  rev    Revision block                 logs → 1 DSA redo → blank-page recall     19:45
  beh    Behavioral, 15 min
  walk   Walk, 20 min
  bed    Screens off 20:30, bed 21:00
```
Counter caps on B days: `dsa1` 3, `dsa2` 2. The `lld` task pulls from the LLD catalog exactly as `design` pulls from HLD.

### Day M — mock and revision
Lighter cognitive load by design: output and consolidation, no new material beyond the one HLD.
```
Session 1 · 05:30 – 11:00
  dsa1   4 DSA                          redos from the queue first               06:45
  design HLD problem                    reqs → 40m cold → answer key → delta     07:15
  dsa2   3 DSA                                                                   08:35
  logs   Reread every delta log to date                                          09:55
Break + Gym 1 · 11:15 – 12:00
  gym1   Cardio, 45 min
Session 2 · 13:00 – 18:00
  mock1  Mock: system design, 45 min     recorded, camera on                     13:00
  mock2  Mock: coding or behavioral      recorded, camera on                     14:00
  redo   One past LLD cold, code included                                        15:00
  li     Batch 3 LinkedIn posts          schedule Mon/Wed/Fri morning            16:00
Evening · 18:00 – 21:00
  gym2   Weights, 60 min
  rev    Revision block                  blank-page recall on today's HLD        19:45
  walk   Walk, 20 min
  bed    Screens off 20:30, bed 21:00
```

## DSA log

Input plus Add. Each entry: name, a FLAG toggle, delete. Flagging pushes `{name, due:[day+3, day+10, day+30], cleared:[]}` into `redos`. Per day, not cumulative.

## Redo queue

Flagged problems whose next uncleared due day is >= current day, soonest first. Due today renders "DUE" in amber, otherwise "d17". A check control marks that occurrence cleared and advances to the next interval. Manual add input. Delete removes it.

## Delta log

Four fields: problem name, "What I missed", "What I got wrong", "What I didn't think to ask". Save appends with the day number. Show the six most recent, newest first.

## Day note

Freeform textarea: "How it went. What broke. What to change tomorrow."

---

# 8. Metrics view

Everything computed from stored state. No extra tracking. Every number needs a one-line plain reading underneath so it means something at a glance, not just a figure.

## Row 1 — four stat blocks

- **Current streak** — consecutive finished days ending at the most recent. Rest days count if marked finished.
- **Completion rate** — checked tasks over available tasks across all finished days, as a percentage.
- **Flag rate, last 7 days** — flagged DSA over total DSA logged. Falling means retention is improving. Show the delta against the previous 7 days with a direction arrow.
- **Projected finish** — at the current 7-day rate, which day each track lands on. Show the track furthest behind pace.
- **Mocks completed** — count of `mock1` and `mock2` checked across all M days, against a target of 12.

## Row 2 — burn-up chart

Inline SVG, cumulative DSA problems against day number, with a straight target line to 252 at day 42. Actual line in the accent colour, target as a dashed rule. Area under the actual line filled at low opacity. This is the chart that answers "am I behind" honestly.

## Row 3 — completion heatmap

A 6×7 grid, one cell per day, opacity scaled to that day's completion rate. M days outlined rather than filled. Hover shows day number, type, and rate. Empty future days are hairline outlines only.

## Row 4 — two panels side by side

**Track coverage.** Horizontal bars for HLD, LLD, GFE, Behavioral, DSA. Each shows done over total, plus a thin marker at where you should be by today to finish on time. Bars past the marker in the accent colour, behind it in amber.

**Consistency by task.** The five tasks skipped most often, by percentage missed across finished days. This is the honest panel: it shows what actually gets dropped when a day goes badly. Label it "What slips first" and do not editorialize beyond that.

## Row 5 — revision health

- Redos cleared on first re-attempt, as a percentage
- Open redos and how many are overdue
- Average days between a flag and its first clear

## Row 6 — recent notes

The five most recent delta log entries and day notes interleaved by day, newest first, as a compact reading list. Clicking one jumps to that day.

**Empty states throughout:** before there is data, state what will appear here and what produces it. "Finish a few days and this shows whether your DSA pace clears 252 by day 42." Never a blank panel, never a zero chart.

---

# 9. Catalog view

Tabs: HLD, LLD, GFE, Mechanisms, Behavioral. Each row: index, checkbox, name, a short tag, pencil icon. Clicking the name or pencil expands a textarea into `notes["hld:4"]`, persisting across all 42 days. A search input filters within the active tab. A count of done over total per tab.

**HLD** (name · read-this-first):
Bitly ·, Rate Limiter · Redis, Distributed Cache · Consistent Hashing, LeetCode · PostgreSQL, WhatsApp · Real-time Updates, Tinder · Proximity Search, Yelp · Elasticsearch, Instagram · Scaling Reads, FB News Feed · Large Blobs, Ticketmaster · Contention, Online Auction · DynamoDB, Job Scheduler · Long Running Tasks, Notification System · Kafka, YouTube · Large Blobs, Dropbox ·, Web Crawler · Scaling Writes, FB Post Search · Elasticsearch, Payment System · Multi-step, YouTube Top K · Big Data DS, Metrics Monitoring · Time Series DB, Price Tracking · Change Data Capture, Local Delivery · Cassandra, Strava ·, Uber · Proximity Search, Ad Click Aggregator · Flink, Robinhood · ZooKeeper, Google Docs · Real-time Updates, Online Chess ·, ChatGPT · Vector DBs, News Aggregator ·, FB Live Comments · Real-time

**LLD** (name · source):
Parking Lot · HI, Connect Four · HI, Amazon Locker · HI, Elevator · HI, Movie Ticket Booking · HI, Inventory Management · HI concurrency first, File System · HI, Logging Service · HI, Rate Limiter · HI, LRU Cache · LC, Underground System · LC, Hit Counter · LC, Browser History · LC, Twitter · LC, Search Autocomplete · LC, In-Memory File System · LC, Snake Game · LC, Text Editor · LC, Tic Tac Toe · LC

**GFE** (name · concept), easiest to hardest:
Accordion · state, Tabs · state, Modal / Dialog · focus trap, Tooltip · positioning, Star Rating · state, Progress Bar · animation, Todo List · CRUD, Digital Clock · timers, Autocomplete · debounce + async, Data Table sort/filter · derived state, Pagination · async, Infinite Scroll · IntersectionObserver, File Upload with progress · async, Image Carousel · preload, Virtualized List · windowing, Drag and Drop List · pointer events, Nested Comments · recursion, Poll Widget · optimistic update

**Mechanisms** (name · ties to · what to measure). These are 2-hour from-scratch implementations of one mechanism inside an HLD problem, not whole systems:
Token bucket in Redis · Rate Limiter · allowed under burst vs sustained,
Consistent hashing ring · Distributed Cache · % keys remapped at 1 vs 150 vnodes,
Optimistic lock vs SELECT FOR UPDATE · Ticketmaster · double-bookings per 1000 attempts,
Append-only log with offsets · Notification System · throughput and restart behaviour,
Bloom filter · Web Crawler · false positive rate vs bits per element,
Count-min sketch + min-heap · YouTube Top K · memory vs exact, error at p99,
Geohash vs quadtree · Tinder / Uber · query latency at 1M points,
Idempotency keys + outbox · Payment System · duplicate charges under retry storm,
Presigned multipart upload · Dropbox · time to first byte, server memory,
WebSocket fan-out with rooms · FB Live Comments · connections before degradation,
LWW register then a small CRDT · Google Docs · convergence after concurrent edits,
Cosine brute force vs HNSW · ChatGPT · recall vs latency at 100k vectors

**Behavioral** — ten tagged `course`:
Why the Behavioral Matters, Decode: How Interviews Work, Select: Choosing Responses, Deliver: Telling a Good Story, The Big Three Questions, Adapting to Big Tech, Practicing, Common Pitfalls, Special Interview Types, Answering AI Questions

Then nine tagged `story`:
Resume story · 90 seconds, Hardest technical problem, Disagreement, Failure, Ambiguity, Leading without authority, Impact on people, Shipping under constraint, Why this company

---

# 10. Settings

Opened from the save-status indicator. Contains: signed-in email, Sign out, Export JSON, Import JSON (replaces state and pushes immediately), and a destructive reset behind a confirm that types the word.

---

# 11. Visual direction

A technical logbook, not a productivity app. Cool dark ground, fine plotting-paper grid at very low opacity, monospace for numerals, labels and metadata, sans for prose. Uppercase letterspaced micro-labels. One accent colour used only for completion and progress, one amber only for flags and unsaved state. No gradients, no drop shadows, no rounded pills, no emoji, no celebration animation. When a day is finished, nothing congratulates the user; the tick simply fills.

```
--ground:#101820  --panel:#18222C  --panel-2:#1E2A35  --rule:#2B3A47
--ink:#DEE6EC     --muted:#7B8B99  --dim:#546575
--signal:#63D2C3  --flag:#E4A94A   --bad:#D9736B
```

IBM Plex Mono and IBM Plex Sans from Google Fonts, system fallbacks.

Charts inherit these tokens. Grid lines at `--rule`, axis labels in mono at `--dim`, series in `--signal`, target and reference lines dashed at `--dim`.

Quality floor: responsive to mobile including the charts, visible keyboard focus, `prefers-reduced-motion` respected, no console errors, no layout shift on load.

---

# 12. README

Cover: local setup (`npm i`, copy `.env.example` to `.env`, `npm run dev`), the SQL above, where to find the anon key, that email confirmation may need disabling in Supabase Auth settings for a single-user instance, what each save state means, and that free Supabase projects pause after about a week of inactivity.

Netlify: build command `npm run build`, publish directory `dist`. Both env vars set in Site settings > Environment variables. Add a `public/_redirects` containing `/*  /index.html  200` so client routing does not 404 on refresh.

---

# 13. Repository

The project is called **cairn**. The remote already exists:

```
git remote add origin https://github.com/aunshx/cairn.git
```

Initialise the repo, add that remote, and set the branch to `main`. Use Vite's default `.gitignore`, extended with `.DS_Store` and editor directories. `.env` is ignored; `.env.example` is committed.

## Commit discipline

Commit one logical change at a time and push after each one. Do not batch the whole build into a handful of commits, and do not pad the count with trivial or empty commits. Built properly, this project lands somewhere around fifty commits on its own: scaffold, Tailwind theme, types, Supabase client, auth hook, auth gate, RLS policies, tracker hook, debounce and retry, save status, header, day strip, each Today component, each chart, each catalog, empty states, responsive passes, keyboard focus, README, deploy config. Each of those is one or more real commits.

Subject lines: short, imperative, lowercase, no trailing period. `add burn-up chart`, `fix flush race on rapid edits`, `handle 401 after token refresh`, `extract metrics into pure functions`. A body only when the reasoning is not obvious from the diff.

## Attribution

Commits are authored by the repository owner only. Do not add a `Co-Authored-By` trailer, do not add a "Generated with" line, and do not reference any AI tool in commit messages, the README, or code comments.

## Secrets

The Supabase anon key is designed to ship in the client and is safe to commit once RLS is enabled. State this explicitly in the README so it does not read as a leaked credential. The service role key must never appear anywhere in the repository.

## Push

Push to `origin main` as you go. Run `git log --oneline` at the end and show me the history.