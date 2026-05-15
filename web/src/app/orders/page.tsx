import Link from "next/link";
import { redirect } from "next/navigation";

import { Header } from "@/components/header";
import { MissingSupabaseEnv } from "@/components/missing-supabase-env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export default async function OrdersPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="min-h-full bg-zinc-50">
        <Header />
        <main className="mx-auto w-full max-w-3xl px-4 py-8">
          <MissingSupabaseEnv />
        </main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id,created_at,status,total_amount,customer_name,phone,address,notes",
    )
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;

  const orderRows = (orders ?? []) as OrderRow[];
  const orderIds = orderRows.map((o) => o.id);

  let itemRows: OrderItemRow[] = [];
  if (orderIds.length) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("id,order_id,product_id,product_name,quantity,price")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;
    itemRows = (items ?? []) as OrderItemRow[];
  }
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const item of itemRows) {
    const arr = itemsByOrder.get(item.order_id) ?? [];
    arr.push(item);
    itemsByOrder.set(item.order_id, arr);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Đơn hàng</h1>
          <Link href="/checkout" className="text-sm underline">
            Thanh toán
          </Link>
        </div>

        {orderRows.length === 0 ? (
          <div className="rounded-lg border bg-white p-5 text-sm text-zinc-600">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="space-y-4">
            {orderRows.map((o) => (
              <div key={o.id} className="rounded-lg border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">Mã: {o.id}</div>
                  <div className="text-sm text-zinc-600">
                    Trạng thái: {o.status}
                  </div>
                </div>

                <div className="mt-2 text-sm text-zinc-600">
                  {new Date(o.created_at).toLocaleString("vi-VN")}
                </div>

                <div className="mt-3 grid gap-1 text-sm">
                  <div>
                    <span className="text-zinc-600">Người nhận: </span>
                    {o.customer_name}
                  </div>
                  <div>
                    <span className="text-zinc-600">SĐT: </span>
                    {o.phone}
                  </div>
                  <div>
                    <span className="text-zinc-600">Địa chỉ: </span>
                    {o.address}
                  </div>
                  {o.notes ? (
                    <div>
                      <span className="text-zinc-600">Ghi chú: </span>
                      {o.notes}
                    </div>
                  ) : null}
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium">Sản phẩm</div>
                  <div className="mt-2 space-y-2">
                    {(itemsByOrder.get(o.id) ?? []).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">{it.product_name}</div>
                          <div className="text-zinc-600">SL: {it.quantity}</div>
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat("vi-VN").format(it.price)} ₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-zinc-600">Tổng</div>
                  <div className="text-base font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(o.total_amount)} ₫
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
