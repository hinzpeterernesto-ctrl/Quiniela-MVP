-- ─────────────────────────────────────────────────────────────────────────────
-- QUINIELA MUNDIAL 2026 — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Helper
create schema if not exists private;

create or replace function private.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  avatar_url    text,
  country       char(2),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  constraint display_name_length check (char_length(display_name) between 1 and 40)
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.touch_updated_at();

-- Auto-create profile on signup
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'Player')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ─── TOURNAMENTS ─────────────────────────────────────────────────────────────

create table public.tournaments (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────

create table public.teams (
  id           uuid primary key default gen_random_uuid(),
  code         char(3) unique not null,
  name         text not null,
  flag_url     text,
  group_letter char(1),
  created_at   timestamptz not null default now()
);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────

create type public.match_status as enum ('scheduled','live','halftime','finished','postponed','cancelled');
create type public.match_stage  as enum ('group','round_of_16','quarter','semi','third_place','final');

create table public.matches (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments(id) on delete cascade,
  external_id      text unique,
  stage            public.match_stage not null,
  group_letter     char(1),
  home_team_id     uuid not null references public.teams(id),
  away_team_id     uuid not null references public.teams(id),
  kickoff_at       timestamptz not null,
  venue            text,
  status           public.match_status not null default 'scheduled',
  home_score       smallint,
  away_score       smallint,
  minute           smallint,
  scored_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint different_teams check (home_team_id <> away_team_id)
);

create index matches_tournament_kickoff on public.matches (tournament_id, kickoff_at);
create index matches_status on public.matches (status, kickoff_at) where status in ('scheduled','live','halftime');

create trigger matches_updated_at before update on public.matches
  for each row execute function private.touch_updated_at();

-- ─── GROUPS ──────────────────────────────────────────────────────────────────

create table public.groups (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments(id) on delete restrict,
  name            text not null,
  slug            text unique not null,
  invite_code     text unique not null,
  owner_id        uuid not null references public.profiles(id) on delete restrict,
  is_private      boolean not null default true,
  max_members     int not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint name_length check (char_length(name) between 3 and 50)
);

create index groups_owner on public.groups (owner_id);
create index groups_invite_code on public.groups (invite_code);

create trigger groups_updated_at before update on public.groups
  for each row execute function private.touch_updated_at();

-- ─── MEMBERSHIPS ─────────────────────────────────────────────────────────────

create type public.member_role as enum ('owner','admin','member');

create table public.memberships (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index memberships_user on public.memberships (user_id);

-- ─── PREDICTIONS ─────────────────────────────────────────────────────────────

create table public.predictions (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  group_id       uuid not null references public.groups(id) on delete cascade,
  home_score     smallint not null check (home_score >= 0 and home_score <= 30),
  away_score     smallint not null check (away_score >= 0 and away_score <= 30),
  is_joker       boolean not null default false,
  points_awarded numeric(8,2),
  bonus_awarded  numeric(8,2) not null default 0,
  is_scored      boolean not null default false,
  scored_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint one_prediction unique (user_id, match_id, group_id)
);

create index predictions_group_match on public.predictions (group_id, match_id);
create index predictions_user_group  on public.predictions (user_id, group_id);
create index predictions_unscored    on public.predictions (match_id) where is_scored = false;

create trigger predictions_updated_at before update on public.predictions
  for each row execute function private.touch_updated_at();

-- ─── GROUP STANDINGS ─────────────────────────────────────────────────────────

create table public.group_standings (
  group_id           uuid not null references public.groups(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  total_points       numeric(10,2) not null default 0,
  exact_scores       int not null default 0,
  correct_results    int not null default 0,
  predictions_made   int not null default 0,
  predictions_scored int not null default 0,
  current_streak     int not null default 0,
  best_streak        int not null default 0,
  last_scored_at     timestamptz,
  updated_at         timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index standings_leaderboard on public.group_standings (group_id, total_points desc, exact_scores desc);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text,
  payload    jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread on public.notifications (user_id, created_at desc) where read_at is null;

-- ─── REALTIME ────────────────────────────────────────────────────────────────

drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  public.group_standings,
  public.matches,
  public.notifications;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.teams             enable row level security;
alter table public.tournaments       enable row level security;
alter table public.matches           enable row level security;
alter table public.groups            enable row level security;
alter table public.memberships       enable row level security;
alter table public.predictions       enable row level security;
alter table public.group_standings   enable row level security;
alter table public.notifications     enable row level security;

-- Helper
create or replace function private.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.memberships where group_id = gid and user_id = auth.uid());
$$;

-- Profiles
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_update_own"    on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Public read-only tables
create policy "teams_select"       on public.teams       for select using (true);
create policy "tournaments_select" on public.tournaments for select using (true);
create policy "matches_select"     on public.matches     for select using (true);

-- Groups
create policy "groups_select_member" on public.groups for select using (private.is_group_member(id));
create policy "groups_insert_auth"   on public.groups for insert with check (auth.uid() = owner_id);
create policy "groups_update_owner"  on public.groups for update using (auth.uid() = owner_id);

-- Memberships
create policy "memberships_select_member" on public.memberships for select using (private.is_group_member(group_id));
create policy "memberships_delete_self"   on public.memberships for delete using (auth.uid() = user_id);

-- Predictions: own always, others only after kickoff
create policy "predictions_select_own" on public.predictions for select using (auth.uid() = user_id);
create policy "predictions_select_group_after_kickoff" on public.predictions
  for select using (
    private.is_group_member(group_id)
    and exists (select 1 from public.matches m where m.id = match_id and m.kickoff_at <= now())
  );
create policy "predictions_insert" on public.predictions
  for insert with check (
    auth.uid() = user_id
    and private.is_group_member(group_id)
    and exists (select 1 from public.matches m where m.id = match_id and m.kickoff_at > now())
  );
create policy "predictions_update" on public.predictions
  for update using (
    auth.uid() = user_id
    and exists (select 1 from public.matches m where m.id = match_id and m.kickoff_at > now())
  );

-- Standings & notifications
create policy "standings_select_member"  on public.group_standings for select using (private.is_group_member(group_id));
create policy "notifications_own"        on public.notifications    for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications    for update using (auth.uid() = user_id);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

create or replace function public.join_group_by_code(p_invite_code text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_group_id uuid;
  v_count    int;
  v_max      int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select id, max_members into v_group_id, v_max
  from public.groups where invite_code = upper(p_invite_code);

  if v_group_id is null then raise exception 'Invalid invite code'; end if;

  select count(*) into v_count from public.memberships where group_id = v_group_id;
  if v_count >= v_max then raise exception 'Group is full'; end if;

  insert into public.memberships (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end; $$;

revoke all on function public.join_group_by_code(text) from public;
grant execute on function public.join_group_by_code(text) to authenticated;

-- ─── SEED DATA ───────────────────────────────────────────────────────────────

insert into public.tournaments (slug, name, starts_at, ends_at, is_active) values
  ('world-cup-2026', 'FIFA World Cup 2026', '2026-06-11', '2026-07-19', true)
on conflict (slug) do nothing;

insert into public.teams (code, name, flag_url, group_letter) values
  ('ARG', 'Argentina',     '🇦🇷', 'A'),
  ('ESP', 'España',        '🇪🇸', 'A'),
  ('FRA', 'Francia',       '🇫🇷', 'B'),
  ('BRA', 'Brasil',        '🇧🇷', 'B'),
  ('ENG', 'Inglaterra',    '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'C'),
  ('GER', 'Alemania',      '🇩🇪', 'C'),
  ('POR', 'Portugal',      '🇵🇹', 'D'),
  ('ITA', 'Italia',        '🇮🇹', 'D'),
  ('USA', 'Estados Unidos','🇺🇸', 'E'),
  ('MEX', 'México',        '🇲🇽', 'E'),
  ('NED', 'Países Bajos',  '🇳🇱', 'F'),
  ('BEL', 'Bélgica',       '🇧🇪', 'F'),
  ('URU', 'Uruguay',       '🇺🇾', 'G'),
  ('COL', 'Colombia',      '🇨🇴', 'G'),
  ('CRO', 'Croacia',       '🇭🇷', 'H'),
  ('MAR', 'Marruecos',     '🇲🇦', 'H')
on conflict (code) do nothing;

-- Insert sample matches (using subqueries for team IDs)
do $$
declare
  v_tournament_id uuid;
  v_arg uuid; v_esp uuid; v_fra uuid; v_bra uuid;
  v_eng uuid; v_ger uuid; v_por uuid; v_ita uuid;
begin
  select id into v_tournament_id from public.tournaments where slug = 'world-cup-2026';
  select id into v_arg from public.teams where code = 'ARG';
  select id into v_esp from public.teams where code = 'ESP';
  select id into v_fra from public.teams where code = 'FRA';
  select id into v_bra from public.teams where code = 'BRA';
  select id into v_eng from public.teams where code = 'ENG';
  select id into v_ger from public.teams where code = 'GER';
  select id into v_por from public.teams where code = 'POR';
  select id into v_ita from public.teams where code = 'ITA';

  insert into public.matches (tournament_id, stage, group_letter, home_team_id, away_team_id, kickoff_at, venue, status, home_score, away_score) values
    (v_tournament_id, 'group', 'A', v_arg, v_esp, now() - interval '2 hours', 'MetLife Stadium', 'finished', 2, 1),
    (v_tournament_id, 'group', 'B', v_fra, v_bra, now() + interval '30 minutes', 'Rose Bowl', 'scheduled', null, null),
    (v_tournament_id, 'group', 'C', v_eng, v_ger, now() + interval '3 hours', 'AT&T Stadium', 'scheduled', null, null),
    (v_tournament_id, 'group', 'D', v_por, v_ita, now() + interval '1 day', 'SoFi Stadium', 'scheduled', null, null)
  on conflict do nothing;
end $$;
