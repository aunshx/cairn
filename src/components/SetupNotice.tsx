export const SCHEMA_SQL = `create table tracker (
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
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);`

const STEPS = [
  {
    title: '1 · Create the table',
    body: 'In the Supabase dashboard open SQL Editor and run this once. The default on user_id is what lets the client write without ever sending a user id.',
    code: SCHEMA_SQL,
  },
  {
    title: '2 · Find the keys',
    body: 'Press Connect in the project header, or open Project Settings → API Keys. Copy the Project URL, then the client key — newer projects show it as a publishable key beginning sb_publishable_, older ones as the anon / public key. It is meant to ship in the browser and is safe with row-level security on. Never copy the secret or service_role key into this project.',
  },
  {
    title: '3 · Point the app at it',
    body: 'Copy .env.example to .env in the project root, fill both values, and restart the dev server.',
    code: `VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>`,
  },
  {
    title: '4 · Deploy',
    body: 'Netlify: build command npm run build, publish directory dist. Set both variables under Site settings → Environment variables, then redeploy so the build picks them up.',
  },
]

export function SetupNotice() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-mono text-[13px] uppercase tracking-[0.3em] text-signal">cairn</h1>
      <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-muted">
        Supabase is not configured, so there is nowhere to read or write your days. Four steps and
        the app comes up.
      </p>

      <ol className="mt-8 space-y-px border border-rule bg-rule">
        {STEPS.map((step) => (
          <li key={step.title} className="bg-panel p-4 sm:p-5">
            <h2 className="micro text-ink">{step.title}</h2>
            <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-muted">{step.body}</p>
            {step.code && (
              <pre className="mt-3 overflow-x-auto border border-rule bg-panel-2 p-3 font-mono text-[11px] leading-relaxed text-ink">
                {step.code}
              </pre>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-6 font-mono text-[11px] text-dim">
        Free Supabase projects pause after about a week of inactivity. If the app stops loading, open
        the dashboard and resume the project.
      </p>
    </main>
  )
}
