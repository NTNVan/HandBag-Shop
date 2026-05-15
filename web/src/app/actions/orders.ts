"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CartItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export async function createOrderFromCartAction(formData: FormData) {
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const cartJson = String(formData.get("cart_json") ?? "[]");

  if (!customerName || !phone || !address) {
    throw new Error("Thiếu thông tin giao hàng");
  }

  let items: CartItemInput[];
  try {
    items = JSON.parse(cartJson) as CartItemInput[];
  } catch {
    items = [];
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      customer_name: customerName,
      phone,
      address,
      total_amount: totalAmount,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const orderItemsPayload = items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    quantity: i.quantity,
    price: i.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) throw itemsError;

  revalidatePath("/orders");
  redirect("/orders");
}
