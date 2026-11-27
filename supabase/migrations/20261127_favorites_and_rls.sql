-- Create favorites table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  recipe_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

-- Enable Row Level Security on favorites
alter table public.favorites enable row level security;

-- Ownership policies for favorites (strictly per-user)
create policy "Users can view their own favorites"
  on public.favorites
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites
  for delete
  using (auth.uid() = user_id);

-- Ensure recipes has user_id for personal recipe ownership
alter table public.recipes
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Enable Row Level Security on recipes
alter table public.recipes enable row level security;

-- Ownership policies for personal recipes
-- Public/seed recipes (user_id is null) remain readable; personal recipes are isolated to their owner.
create policy "Users can view public or own recipes"
  on public.recipes
  for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.recipes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes
  for delete
  using (auth.uid() = user_id);
