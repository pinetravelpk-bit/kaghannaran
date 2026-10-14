-- Kaghan Naran Directory — database schema
-- Run in the Supabase SQL editor (or `supabase db push`).

-- gen_random_uuid() is built into Postgres 13+ (Supabase).

-- ───────────────────────── Enums ─────────────────────────
do $$ begin
  create type user_role as enum ('traveller','business','guide','moderator','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('draft','pending','changes_requested','approved','rejected','suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type road_status as enum ('open','caution','closed','seasonal');
exception when duplicate_object then null; end $$;

-- ───────────────────────── Profiles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  role user_role not null default 'traveller',
  created_at timestamptz not null default now()
);

-- Staff check used by RLS policies.
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'));
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- New sign-ups get a profile. Self-chosen role is limited to traveller / business / guide.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare chosen text := coalesce(new.raw_user_meta_data->>'role', 'traveller');
begin
  if chosen not in ('traveller','business','guide') then chosen := 'traveller'; end if;
  insert into public.profiles (id, full_name, email, phone, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email, new.raw_user_meta_data->>'phone', chosen::user_role);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own profile but never their own role.
create or replace function public.protect_role() returns trigger
language plpgsql as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ───────────────────────── Places ─────────────────────────
create table if not exists public.stops (
  slug text primary key,
  sort_order int not null,
  name text not null,
  name_ur text,
  kind text not null default '',
  side_trip boolean not null default false,
  altitude int,
  description text not null default '',
  image_url text,
  places jsonb not null default '[]'::jsonb  -- [{name, note, isNew, warning, image}]
);

create table if not exists public.trails (
  slug text primary key,
  name text not null,
  mode text not null check (mode in ('Jeep','Hike','Trek','Walk')),
  start_from text not null default '',
  time_note text not null default '',
  stop_slug text references public.stops(slug) on delete set null,
  sort_order int not null default 0
);

-- ───────────────────────── Business types (approval rules) ─────────────────────────
create table if not exists public.business_types (
  slug text primary key,
  name text not null,
  grp text not null,
  icon text not null default 'Store',
  description text not null default '',
  individual boolean not null default false,
  admin_only boolean not null default false,
  fields jsonb not null default '[]'::jsonb,     -- [{key,label,type,options,required}]
  documents jsonb not null default '[]'::jsonb,  -- [{key,label,required,hint}]
  checklist jsonb not null default '[]'::jsonb   -- ["Phone number answered", ...]
);

-- ───────────────────────── Listings ─────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid references public.profiles(id) on delete set null,
  type_slug text not null references public.business_types(slug),
  name text not null,
  phone text not null,
  whatsapp text,
  stop_slug text references public.stops(slug) on delete set null,
  address text not null default '',
  description text not null default '',
  price_from int,
  attributes jsonb not null default '{}'::jsonb,
  image_url text,
  gallery text[] not null default '{}',
  status listing_status not null default 'pending',
  featured boolean not null default false,
  verified boolean not null default false,
  checklist jsonb not null default '{}'::jsonb,
  rating numeric(2,1),
  review_count int not null default 0,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_type_idx on public.listings(type_slug);
create index if not exists listings_stop_idx on public.listings(stop_slug);

-- Owners can't approve themselves: when a non-staff user edits, status goes back to review.
create or replace function public.listing_owner_guard() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if not public.is_staff() then
    new.featured := old.featured;
    new.verified := old.verified;
    new.checklist := old.checklist;
    new.rating := old.rating;
    new.review_count := old.review_count;
    if old.status = 'suspended' then
      new.status := 'suspended';
    elsif new.status <> 'draft' then
      new.status := 'pending';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists listings_owner_guard on public.listings;
create trigger listings_owner_guard before update on public.listings
  for each row execute function public.listing_owner_guard();

create or replace function public.listing_insert_guard() returns trigger
language plpgsql as $$
begin
  if not public.is_staff() then
    new.owner_id := auth.uid();
    new.featured := false; new.verified := false; new.checklist := '{}'::jsonb;
    if new.status not in ('draft','pending') then new.status := 'pending'; end if;
    if exists (select 1 from public.business_types where slug = new.type_slug and admin_only) then
      raise exception 'This listing type can only be added by staff';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists listings_insert_guard on public.listings;
create trigger listings_insert_guard before insert on public.listings
  for each row execute function public.listing_insert_guard();

create table if not exists public.listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  doc_key text not null,
  label text not null,
  storage_path text not null, -- path inside the private "documents" bucket
  uploaded_at timestamptz not null default now()
);

create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default '',
  action text not null check (action in ('submitted','resubmitted','approved','rejected','changes_requested','suspended','note')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  status listing_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ───────────────────────── Live info & community ─────────────────────────
create table if not exists public.road_segments (
  id uuid primary key default gen_random_uuid(),
  segment text not null,
  note text not null default '',
  status road_status not null default 'open',
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz,
  location text not null default '',
  stop_slug text references public.stops(slug) on delete set null,
  description text not null default '',
  submitted_by uuid references public.profiles(id) default auth.uid(),
  status listing_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  employer text not null,
  stop_slug text references public.stops(slug) on delete set null,
  job_type text not null default 'Seasonal',
  salary text,
  description text not null default '',
  contact text not null,
  posted_by uuid references public.profiles(id) default auth.uid(),
  status listing_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default '',
  action text not null,
  target text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  alert_banner text not null default '',
  hero_video_url text not null default '',
  emergency_numbers jsonb not null default '[{"label":"Rescue & ambulance","number":"1122"},{"label":"Police","number":"15"}]',
  auto_publish_events boolean not null default false,
  require_docs_for_guides boolean not null default true
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ───────────────────────── Row level security ─────────────────────────
alter table public.profiles enable row level security;
alter table public.stops enable row level security;
alter table public.trails enable row level security;
alter table public.business_types enable row level security;
alter table public.listings enable row level security;
alter table public.listing_documents enable row level security;
alter table public.moderation_events enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.road_segments enable row level security;
alter table public.events enable row level security;
alter table public.jobs enable row level security;
alter table public.activity_log enable row level security;
alter table public.site_settings enable row level security;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_staff());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- public reference data: anyone reads, staff write
do $$ declare t text; begin
  foreach t in array array['stops','trails','business_types','road_segments','site_settings'] loop
    execute format('drop policy if exists "%1$s read" on public.%1$s', t);
    execute format('create policy "%1$s read" on public.%1$s for select using (true)', t);
    execute format('drop policy if exists "%1$s staff write" on public.%1$s', t);
    execute format('create policy "%1$s staff write" on public.%1$s for all using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

-- listings
drop policy if exists "listings public read" on public.listings;
create policy "listings public read" on public.listings for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_staff());
drop policy if exists "listings owner insert" on public.listings;
create policy "listings owner insert" on public.listings for insert
  with check (auth.uid() is not null);
drop policy if exists "listings owner update" on public.listings;
create policy "listings owner update" on public.listings for update
  using (owner_id = auth.uid() or public.is_staff());
drop policy if exists "listings staff delete" on public.listings;
create policy "listings staff delete" on public.listings for delete using (public.is_staff());

-- documents: owner + staff only
drop policy if exists "docs owner/staff" on public.listing_documents;
create policy "docs owner/staff" on public.listing_documents for all
  using (public.is_staff() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()))
  with check (public.is_staff() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));

-- moderation history: staff write; owner can read own
drop policy if exists "mod read" on public.moderation_events;
create policy "mod read" on public.moderation_events for select
  using (public.is_staff() or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
drop policy if exists "mod write" on public.moderation_events;
create policy "mod write" on public.moderation_events for insert
  with check (public.is_staff() or (action in ('submitted','resubmitted') and exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())));

-- notifications
drop policy if exists "notif own" on public.notifications;
create policy "notif own" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "notif own update" on public.notifications;
create policy "notif own update" on public.notifications for update using (user_id = auth.uid());
drop policy if exists "notif staff insert" on public.notifications;
create policy "notif staff insert" on public.notifications for insert with check (public.is_staff());

-- reviews
drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_staff());
drop policy if exists "reviews insert" on public.reviews;
create policy "reviews insert" on public.reviews for insert with check (user_id = auth.uid());
drop policy if exists "reviews staff" on public.reviews;
create policy "reviews staff" on public.reviews for update using (public.is_staff());

-- events & jobs: approved public; anyone signed in may submit; staff moderate
do $$ declare t text; begin
  foreach t in array array['events','jobs'] loop
    execute format('drop policy if exists "%1$s read" on public.%1$s', t);
    execute format('create policy "%1$s read" on public.%1$s for select using (status = ''approved'' or public.is_staff())', t);
    execute format('drop policy if exists "%1$s submit" on public.%1$s', t);
    execute format('create policy "%1$s submit" on public.%1$s for insert with check (auth.uid() is not null and status = ''pending'')', t);
    execute format('drop policy if exists "%1$s staff" on public.%1$s', t);
    execute format('create policy "%1$s staff" on public.%1$s for update using (public.is_staff())', t);
    execute format('drop policy if exists "%1$s staff delete" on public.%1$s', t);
    execute format('create policy "%1$s staff delete" on public.%1$s for delete using (public.is_staff())', t);
  end loop;
end $$;

-- activity log: staff only
drop policy if exists "activity staff" on public.activity_log;
create policy "activity staff" on public.activity_log for all using (public.is_staff()) with check (public.is_staff());

-- ───────────────────────── Storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('listing-media','listing-media', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('documents','documents', false) on conflict do nothing;

-- Files go under "<user id>/..." so owners can only write to their own folder.
drop policy if exists "media read" on storage.objects;
create policy "media read" on storage.objects for select using (bucket_id = 'listing-media');
drop policy if exists "media write own" on storage.objects;
create policy "media write own" on storage.objects for insert
  with check (bucket_id in ('listing-media','documents') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "docs read own or staff" on storage.objects;
create policy "docs read own or staff" on storage.objects for select
  using (bucket_id = 'documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
drop policy if exists "storage staff all" on storage.objects;
create policy "storage staff all" on storage.objects for all
  using (bucket_id in ('listing-media','documents') and public.is_staff())
  with check (bucket_id in ('listing-media','documents') and public.is_staff());
