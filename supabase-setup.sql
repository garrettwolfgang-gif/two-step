-- Two Step beta database setup for Supabase.
-- Paste this into Supabase SQL Editor and run it once.
-- This is prototype access: it lets the public browser key read/write beta data.
-- Before a real launch, replace these permissive policies with Supabase Auth + stricter RLS.

create table if not exists public.two_step_profiles (
  email text primary key,
  name text not null,
  password text,
  location text default 'A',
  min_age int default 13,
  max_age int default 18,
  gender_preference text default 'any',
  age int default 13,
  gender text default 'female',
  photo text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.two_step_checkins (
  email text primary key,
  name text not null,
  event_id text not null,
  checked_in_at text,
  safety jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.two_step_invites (
  id text primary key,
  from_email text not null,
  from_name text not null,
  to_email text not null,
  to_name text not null,
  event_id text,
  event_name text,
  created_at_text text,
  created_at timestamptz default now()
);

create table if not exists public.two_step_messages (
  id text primary key,
  pair text not null,
  event_id text,
  event_name text,
  from_email text not null,
  from_name text not null,
  to_email text not null,
  text text not null,
  created_at_text text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.two_step_reports (
  id text primary key,
  reporter_email text not null,
  reported_email text not null,
  reason text not null,
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.two_step_blocks (
  blocker_email text not null,
  blocked_email text not null,
  created_at timestamptz default now(),
  primary key (blocker_email, blocked_email)
);

alter table public.two_step_profiles enable row level security;
alter table public.two_step_checkins enable row level security;
alter table public.two_step_invites enable row level security;
alter table public.two_step_messages enable row level security;
alter table public.two_step_reports enable row level security;
alter table public.two_step_blocks enable row level security;

drop policy if exists "two_step_beta_profiles_all" on public.two_step_profiles;
create policy "two_step_beta_profiles_all" on public.two_step_profiles for all using (true) with check (true);

drop policy if exists "two_step_beta_checkins_all" on public.two_step_checkins;
create policy "two_step_beta_checkins_all" on public.two_step_checkins for all using (true) with check (true);

drop policy if exists "two_step_beta_invites_all" on public.two_step_invites;
create policy "two_step_beta_invites_all" on public.two_step_invites for all using (true) with check (true);

drop policy if exists "two_step_beta_messages_all" on public.two_step_messages;
create policy "two_step_beta_messages_all" on public.two_step_messages for all using (true) with check (true);

drop policy if exists "two_step_beta_reports_all" on public.two_step_reports;
create policy "two_step_beta_reports_all" on public.two_step_reports for all using (true) with check (true);

drop policy if exists "two_step_beta_blocks_all" on public.two_step_blocks;
create policy "two_step_beta_blocks_all" on public.two_step_blocks for all using (true) with check (true);
