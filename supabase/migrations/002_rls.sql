-- Row Level Security
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.days enable row level security;
alter table public.day_images enable row level security;
alter table public.costs enable row level security;

-- Profiles: users can only see and edit their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Trips: own trips + public trips readable by anyone
create policy "trips_select_own" on public.trips for select using (auth.uid() = user_id or is_public = true);
create policy "trips_insert_own" on public.trips for insert with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips for update using (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips for delete using (auth.uid() = user_id);

-- Days: own only (public trip days readable if trip is public)
create policy "days_select" on public.days for select using (
  auth.uid() = user_id or
  exists (select 1 from public.trips where trips.id = days.trip_id and trips.is_public = true)
);
create policy "days_insert_own" on public.days for insert with check (auth.uid() = user_id);
create policy "days_update_own" on public.days for update using (auth.uid() = user_id);
create policy "days_delete_own" on public.days for delete using (auth.uid() = user_id);

-- Day images: same as days
create policy "day_images_select" on public.day_images for select using (
  auth.uid() = user_id or
  exists (
    select 1 from public.days
    join public.trips on trips.id = days.trip_id
    where days.id = day_images.day_id and trips.is_public = true
  )
);
create policy "day_images_insert_own" on public.day_images for insert with check (auth.uid() = user_id);
create policy "day_images_delete_own" on public.day_images for delete using (auth.uid() = user_id);

-- Costs: own only
create policy "costs_select_own" on public.costs for select using (auth.uid() = user_id);
create policy "costs_insert_own" on public.costs for insert with check (auth.uid() = user_id);
create policy "costs_update_own" on public.costs for update using (auth.uid() = user_id);
create policy "costs_delete_own" on public.costs for delete using (auth.uid() = user_id);

-- Storage bucket for trip images
insert into storage.buckets (id, name, public) values ('trip-images', 'trip-images', true);

create policy "trip_images_select" on storage.objects for select using (bucket_id = 'trip-images');
create policy "trip_images_insert" on storage.objects for insert with check (
  bucket_id = 'trip-images' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "trip_images_delete" on storage.objects for delete using (
  bucket_id = 'trip-images' and auth.uid()::text = (storage.foldername(name))[1]
);