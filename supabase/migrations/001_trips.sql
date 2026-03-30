-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  home_currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trips table
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image_url text,
  destination text not null,
  start_date date not null,
  end_date date,
  status text default 'active' check (status in ('active', 'completed', 'planned')),
  is_public boolean default false,
  public_slug text unique,
  budget numeric(12,2),
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Days table
create table public.days (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  title text,
  raw_notes text not null,
  ai_reframed text,
  use_ai_version boolean default false,
  mood text check (mood in ('amazing', 'good', 'okay', 'tired', 'rough')),
  weather jsonb,
  location jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(trip_id, date)
);

-- Day images table
create table public.day_images (
  id uuid default uuid_generate_v4() primary key,
  day_id uuid references public.days(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  caption text,
  tags text[] default '{}',
  storage_path text not null,
  created_at timestamptz default now()
);

-- Costs table
create table public.costs (
  id uuid default uuid_generate_v4() primary key,
  day_id uuid references public.days(id) on delete cascade not null,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12,2) not null,
  currency text default 'INR',
  amount_inr numeric(12,2),
  category text default 'misc' check (category in ('food','transport','accommodation','activities','shopping','misc')),
  note text,
  created_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function update_updated_at();
create trigger update_trips_updated_at before update on public.trips for each row execute function update_updated_at();
create trigger update_days_updated_at before update on public.days for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();