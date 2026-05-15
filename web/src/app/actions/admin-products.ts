"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: FormDataEntryValue | null) {
  const num = Number(asString(value));
  return Number.isFinite(num) ? num : NaN;
}

export async function adminCreateProductAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Không có quyền");

  const name = asString(formData.get("name"));
  const type = asString(formData.get("type"));
  const material = asString(formData.get("material"));
  const price = asNumber(formData.get("price"));
  const quantity = asNumber(formData.get("quantity"));
  const size = asString(formData.get("size"));
  const description = asString(formData.get("description"));

  if (!name || !type || !Number.isFinite(price) || !Number.isFinite(quantity)) {
    throw new Error("Dữ liệu không hợp lệ");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert({
    name,
    type,
    material: material || null,
    price,
    quantity,
    size: size || null,
    description: description || null,
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adminUpdateProductAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Không có quyền");

  const id = asString(formData.get("id"));
  if (!id) throw new Error("Thiếu id");

  const name = asString(formData.get("name"));
  const type = asString(formData.get("type"));
  const material = asString(formData.get("material"));
  const price = asNumber(formData.get("price"));
  const quantity = asNumber(formData.get("quantity"));
  const size = asString(formData.get("size"));
  const description = asString(formData.get("description"));

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (name) payload.name = name;
  if (type) payload.type = type;
  payload.material = material || null;
  if (Number.isFinite(price)) payload.price = price;
  if (Number.isFinite(quantity)) payload.quantity = quantity;
  payload.size = size || null;
  payload.description = description || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/products/${id}`);
}

export async function adminDeleteProductAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Không có quyền");

  const id = asString(formData.get("id"));
  if (!id) throw new Error("Thiếu id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adminUploadProductImageAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Không có quyền");

  const id = asString(formData.get("id"));
  const file = formData.get("file");

  if (!id) throw new Error("Thiếu id");
  if (!(file instanceof File)) throw new Error("Thiếu file");

  const supabase = await createSupabaseServerClient();

  const safeName = file.name.replaceAll("/", "-");
  const path = `${id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) throw updateError;

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/products/${id}`);
}
