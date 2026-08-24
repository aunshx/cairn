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
VITE_SIGNUP_CODE=<optional access code for creating an account>
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

### Keeping it to one person

This app is built for a single user. There are three levels of lock, and only the last two are real.

**1. Access code (convenience).** Set `VITE_SIGNUP_CODE` in `.env` and the Create account form asks
for it. Vite inlines env vars into the bundle at build time, so this code is readable by anyone who
opens devtools. It stops a stranger who wanders onto the URL. It does not stop anyone who tries.

**2. Turn sign-ups off (recommended, one toggle).** Once your own account exists, go to
Authentication → Sign In / Providers → Email and turn off **Allow new users to sign up**. Nobody can
create an account after that, whatever they send. This is the simplest real lock.

**3. Enforce the code in Postgres.** If you want to keep sign-ups open but gated, enforce the code
server-side where the client cannot reach it. The app already sends the code as user metadata.

```sql
create table signup_codes (
  code text primary key,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz
);

alter table signup_codes enable row level security;
-- no policies: only the trigger below, which is security definer, may read it

insert into signup_codes (code) values ('pick-something-long-and-random');

create or replace function public.enforce_signup_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  supplied text := new.raw_user_meta_data ->> 'signup_code';
  matched  text;
begin
  select code into matched
    from signup_codes
   where code = supplied and used_by is null
     for update;

  if matched is null then
    raise exception 'invalid or already used signup code';
  end if;

  update signup_codes set used_by = new.id, used_at = now() where code = matched;
  return new;
end;
$$;

create trigger enforce_signup_code
  before insert on auth.users
  for each row execute function public.enforce_signup_code();
```

Each code works exactly once. A sign-up without a valid one fails at the database, and the app
surfaces it as "That access code is not valid."

Row-level security already means a second account could never see your data — it would get its own
empty row. These controls are about who can create an account at all.

### Email confirmation

For a single-user instance, turn off **Confirm email** under Authentication → Sign In / Providers →
Email. Otherwise the first sign-up cannot sign in until the confirmation link is opened, and the free
tier has no SMTP configured.

### Projects pause

Free Supabase projects pause after about a week of inactivity. When that happens the app shows a load
error with a retry button; open the Supabase dashboard, resume the project, then retry.

## Themes

Light and dark, with a third setting that follows the operating system. The control is in the
header, and the choice is stored in Postgres with everything else rather than in browser storage, so
it follows you between machines. Before your data loads — on the sign-in screen — the system
preference applies.

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
- Applications as records — company, position, job URL and a status you move along as you hear back
  (applied → screen → onsite → offer, or rejected / ghosted) — with their own Jobs tab in the catalog

Day types run a three-work-day cycle: every 4th day is **M**, a mock and revision day. The rest
alternate **A** and **B**, skipping M days — 16 A days, 16 B days, 10 M days. Every second B day
swaps its build slot for a mechanism implementation, which is where the target of 8 mechanisms
comes from.

Targets: DSA 262, HLD 31, LLD 19, GFE 18, Mechanisms 8, Behavioral 19, Applications 96, Mocks 20.

GFE is the one target the schedule does not fully afford: the timed `gfe` slot runs on A days only,
so 16 of the 18 components get a slot. The last two have to be ticked directly in the catalog.
