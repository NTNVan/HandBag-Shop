-- Supabase Storage policies (product-images bucket)
-- This migration attempts to create the bucket automatically (idempotent).

-- Create bucket (public) if it doesn't exist yet
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage objects
alter table if exists storage.objects enable row level security;

-- Public read for product images
-- Note: Storage policies are on storage.objects

-- Allow public read (anon + authenticated)
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

-- Allow admin write (insert/update/delete)
drop policy if exists "admin_write_product_images_insert" on storage.objects;
create policy "admin_write_product_images_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

drop policy if exists "admin_write_product_images_update" on storage.objects;
create policy "admin_write_product_images_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

drop policy if exists "admin_write_product_images_delete" on storage.objects;
create policy "admin_write_product_images_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
);
