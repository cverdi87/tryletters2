-- daily-briefing.sql
-- Run in the Supabase SQL editor. Safe to re-run (guarded).
--
-- The Daily Briefing is a saved set of SOURCES the user wants delivered each
-- day: Letters publications, podcast shows (from podcast_subscriptions-land),
-- and topics. Plus a delivery time and a public/private flag. The arrays hold
-- ids directly, so this does NOT depend on a publication-follow table (there
-- isn't one) — adding a publication to your briefing IS the relationship.

create table if not exists briefing_preferences (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  publication_ids uuid[]  not null default '{}',
  podcast_show_ids uuid[] not null default '{}',
  topics          text[]  not null default '{}',
  delivery_time   time    not null default '07:00',
  is_public       boolean not null default false,
  enabled         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- keep updated_at honest
create or replace function touch_briefing_updated_at() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists briefing_touch on briefing_preferences;
create trigger briefing_touch before update on briefing_preferences
  for each row execute function touch_briefing_updated_at();

alter table briefing_preferences enable row level security;

-- Owner can do anything with their own row.
drop policy if exists briefing_own_all on briefing_preferences;
create policy briefing_own_all on briefing_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anyone may READ a row the owner has marked public (powers the
-- "What I'm Reading" block on a profile). Read-only; no write path.
drop policy if exists briefing_public_read on briefing_preferences;
create policy briefing_public_read on briefing_preferences
  for select using (is_public = true);
