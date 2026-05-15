-- HandbagShop (Supabase Postgres) schema + RLS
-- Apply this in Supabase SQL Editor (or via migrations if using Supabase CLI)

create extension if not exists pgcrypto;

-- Profiles for app-level metadata (role, full name)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Automatically create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  material text,
  price numeric(12,2) not null,
  quantity integer not null default 0,
  image_url text,
  description text,
  size text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_amount numeric(12,2) not null,
  status text not null default 'Chờ xác nhận',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  quantity integer not null,
  price numeric(12,2) not null
);

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: users can read/update their own profile; admins can read all
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- products: everyone can read; only admins can write
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
on public.products for delete
to authenticated
using (public.is_admin());

-- orders: users manage their own; admins manage all
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- order_items: users can select/insert items for their own orders; admins for all
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
on public.order_items for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

-- Seed: optional sample products (you can remove if not desired)
insert into public.products (name, type, material, price, quantity, image_url, description, size)
values
  ('Túi Tote Canvas Hoa Hồng', 'tote', 'vải', 250000, 15, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', 'Túi tote nữ phong cách Hàn Quốc, chất vải canvas bền đẹp', '35x40x12cm'),
  ('Túi Đeo Chéo Mini Da Thật', 'crossbody', 'da', 450000, 8, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 'Túi đeo chéo mini sang trọng, chất liệu da PU cao cấp', '18x15x8cm')
on conflict do nothing;
