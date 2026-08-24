# cairn

A 42-day interview preparation tracker. One page, three views, one row in Postgres.

Vite + React 19 + TypeScript + Tailwind. Supabase for auth and storage. Charts are hand-written SVG.

## Local setup

```
npm i
cp .env.example .env
npm run dev
```

Fill `.env` with the two values from your Supabase project:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

If either is missing the app renders setup instructions instead of the tracker, so a misconfigured
deploy fails loudly rather than silently.

## Supabase

### Schema

Run this once in the SQL Editor.

```sql
create table tracker (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
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

There is no anon policy and no delete policy: the foreign key cascade handles account deletion.

`default auth.uid()` on `user_id` is what lets the client insert without ever sending a user id. The
policies derive the owner from the JWT, so a read or write can only ever touch one row.

### Keys

Press **Connect** in the project header, or open Project Settings → API Keys. Copy **Project URL**
into `VITE_SUPABASE_URL`, and the client key into `VITE_SUPABASE_ANON_KEY`.

Supabase now issues that client key as a **publishable key** beginning `sb_publishable_`. Older
projects show it as the **anon / public** key, a JWT beginning `eyJ`. Either works here — the
variable keeps the `ANON_KEY` name for continuity.

This key is designed to ship in the browser and is safe to commit once row-level security is
enabled — it grants nothing on its own, because every policy above requires an authenticated JWT.
This is not a leaked credential. The **secret** key (previously **service_role**) is a different
thing entirely and must never appear in this repository, in `.env`, or in a Netlify variable for
this site.

### Email confirmation

For a single-user instance, turn off **Confirm email** under Authentication → Sign In / Providers →
Email. Otherwise the first sign-up cannot sign in until the confirmation link is opened, and the free
tier has no SMTP configured.

### Projects pause

Free Supabase projects pause after about a week of inactivity. When that happens the app shows a load
error with a retry button; open the Supabase dashboard, resume the project, then retry.

## Save states

The indicator in the header is also the button that opens settings.

| State | Meaning |
| --- | --- |
| **Unsaved** (amber) | Edited, not yet written. A write is queued 700ms after the last keystroke. |
| **Saving…** (grey) | A write is in flight. |
| **Saved** (green) | Postgres matches what is on screen. |
| **Save failed — retrying** (red) | The write failed. It retries every 5s, and immediately when the browser comes back online. |

While anything is unsaved there is also a background flush every 20s and a warning if you try to
close the tab. State is snapshotted before each write and compared after, so an edit made mid-flight
is never dropped.

If the initial load fails the app shows the error and a retry button rather than opening empty — an
empty screen would save over good data on the first keystroke.

All application data lives in Postgres. The only thing in browser storage is the Supabase auth
session, which the client persists so a reload does not sign you out.

## Deploy to Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Site settings → Environment variables: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then
  redeploy so the build picks them up. Vite inlines these at build time, not at runtime.

`public/_redirects` contains `/*  /index.html  200` so a refresh on any path serves the app instead
of a 404.

## Shape of the data

One JSON blob per user, validated field by field on read, so a partial or stale blob fills in with
defaults rather than crashing.

- 42 days, each with checked tasks, counter values, a DSA log, per-task notes and a day note
- Six catalogs — the NeetCode 250, HLD, LLD, GFE, Mechanisms, Behavioral — with notes that persist
  across all 42 days. Every problem links to NeetCode, and to LeetCode as a fallback.
- Catalog-backed tasks are picked, not prescribed: choose what you actually did from the list, or
  type something that is not on it
- Delta logs, a spaced-repetition redo queue at +3 / +10 / +30 days, and measured mechanism results

Day types run a three-work-day cycle: every 4th day is **M**, a mock and revision day. The rest
alternate **A** and **B**, skipping M days — 16 A days, 16 B days, 10 M days. Every second B day
swaps its build slot for a mechanism implementation, which is where the target of 8 mechanisms
comes from.

Targets: DSA 262, HLD 31, LLD 19, GFE 18, Mechanisms 8, Behavioral 19, Applications 96, Mocks 20.

GFE is the one target the schedule does not fully afford: the timed `gfe` slot runs on A days only,
so 16 of the 18 components get a slot. The last two have to be ticked directly in the catalog.
