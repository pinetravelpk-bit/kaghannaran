-- Automatic road status + admin-managed weather areas.
-- Run after 0001_init.sql and seed.sql.
begin;

-- ───────── road segments: automatic checks with manual override ─────────
-- mode 'auto'   → status comes from live checks (Google Maps travel time, weather, season)
-- mode 'manual' → status/note set by staff, until manual_until (null = until switched back)
alter table public.road_segments
  add column if not exists mode text not null default 'auto' check (mode in ('auto', 'manual')),
  add column if not exists manual_until timestamptz,
  add column if not exists from_lat double precision,
  add column if not exists from_lon double precision,
  add column if not exists to_lat double precision,
  add column if not exists to_lon double precision,
  add column if not exists normal_km numeric,
  add column if not exists open_months int[];

-- coordinates for the seeded N-15 segments (approximate town centres; Google snaps them to the road)
update public.road_segments r set from_lat = v.flat, from_lon = v.flon, to_lat = v.tlat, to_lon = v.tlon, normal_km = v.km, open_months = v.months
from (values
  ('Balakot → Kiwai',          34.548, 73.351, 34.676, 73.452, 24,  null::int[]),
  ('Kiwai → Kaghan → Naran',   34.676, 73.452, 34.909, 73.651, 59,  null::int[]),
  ('Naran → Batakundi',        34.909, 73.651, 34.948, 73.737, 16,  null::int[]),
  ('Batakundi → Babusar Top',  34.948, 73.737, 35.149, 74.036, 55,  array[6,7,8,9,10]),
  ('Babusar Top → Chilas',     35.149, 74.036, 35.420, 74.094, 40,  array[6,7,8,9,10])
) as v(segment, flat, flon, tlat, tlon, km, months)
where r.segment = v.segment and r.from_lat is null;

-- ───────── weather areas ─────────
create table if not exists public.weather_areas (
  slug text primary key,
  name text not null,
  lat double precision not null,
  lon double precision not null,
  alt int not null default 0,
  sort_order int not null default 0,
  on_home boolean not null default false,
  advisory text not null default '',
  advisory_level text not null default 'info' check (advisory_level in ('info', 'warning', 'danger')),
  override_label text,
  override_temp numeric,
  override_until timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.weather_areas enable row level security;
drop policy if exists "weather_areas read" on public.weather_areas;
create policy "weather_areas read" on public.weather_areas for select using (true);
drop policy if exists "weather_areas staff write" on public.weather_areas;
create policy "weather_areas staff write" on public.weather_areas for all using (public.is_staff()) with check (public.is_staff());

insert into public.weather_areas (slug, name, lat, lon, alt, sort_order, on_home) values
  ('balakot',        'Balakot',        34.548, 73.351,  980, 0, true),
  ('kiwai',          'Kiwai',          34.676, 73.452, 1450, 1, false),
  ('shogran',        'Shogran',        34.637, 73.468, 2360, 2, false),
  ('kaghan',         'Kaghan',         34.778, 73.523, 2050, 3, true),
  ('naran',          'Naran',          34.909, 73.651, 2400, 4, true),
  ('saif-ul-malook', 'Saif-ul-Malook', 34.877, 73.693, 3224, 5, false),
  ('batakundi',      'Batakundi',      34.948, 73.737, 2700, 6, false),
  ('lulusar',        'Lulusar Lake',   35.081, 73.940, 3410, 7, false),
  ('babusar-top',    'Babusar Top',    35.149, 74.036, 4173, 8, true)
on conflict (slug) do nothing;

commit;
