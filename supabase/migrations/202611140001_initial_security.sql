-- Samadhan Setu hosted foundation.
-- Apply in the Supabase SQL editor before enabling public sign-ups.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en','hi')),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.grievances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (char_length(description) between 10 and 5000),
  location text not null check (char_length(location) between 2 and 300),
  language text not null default 'en',
  category_id text not null default 'needs_review',
  complaint_draft text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.grievances enable row level security;
create policy "grievances_select_own" on public.grievances for select to authenticated using (auth.uid() = user_id);
create policy "grievances_insert_own" on public.grievances for insert to authenticated with check (auth.uid() = user_id);
create policy "grievances_update_own" on public.grievances for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "grievances_delete_own" on public.grievances for delete to authenticated using (auth.uid() = user_id);
create index if not exists grievances_user_created_idx on public.grievances(user_id, created_at desc);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  grievance_id uuid not null references public.grievances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (char_length(note) between 3 and 2000),
  reference_number text,
  created_at timestamptz not null default now()
);
alter table public.followups enable row level security;
create policy "followups_select_own" on public.followups for select to authenticated using (auth.uid() = user_id);
create policy "followups_insert_own" on public.followups for insert to authenticated with check (auth.uid() = user_id and exists (select 1 from public.grievances g where g.id = grievance_id and g.user_id = auth.uid()));
create policy "followups_delete_own" on public.followups for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "avatar_read_own" on storage.objects for select to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar_update_own" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();


-- Structured grievance fields used by the citizen dashboard.
alter table public.grievances add column if not exists classification jsonb not null default '{}'::jsonb;
alter table public.grievances add column if not exists guidance jsonb not null default '{}'::jsonb;
alter table public.followups add column if not exists status text not null default 'Citizen-recorded update';
