"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function adminUpdateOrderStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Không có quyền");

  const id = asString(formData.get("id"));
  const status = asString(formData.get("status"));

  if (!id || !status) throw new Error("Thiếu dữ liệu");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/orders");
}
