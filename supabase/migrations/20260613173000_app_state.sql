-- Unified key/value persistence for dashboard feature state that was previously
-- ephemeral (notes, tasks/projectMeta, chats, calendar events, meetings, booking
-- services, bookings, custom columns, guides, ...). Each top-level feature slice is
-- stored as one JSONB row keyed by a stable string, shared across the team.
create table if not exists public.app_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

grant select, insert, update, delete on public.app_state to authenticated;
grant all on public.app_state to service_role;

alter table public.app_state enable row level security;

-- Any authenticated team member can read and write shared dashboard state.
create policy "app_state read auth" on public.app_state
  for select to authenticated using (true);
create policy "app_state write auth" on public.app_state
  for all to authenticated using (true) with check (true);
