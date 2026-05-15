import { redirect } from "next/navigation";

import { Header } from "@/components/header";
import { MissingSupabaseEnv } from "@/components/missing-supabase-env";
import type { Product } from "@/lib/db/types";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  adminCreateProductAction,
  adminDeleteProductAction,
  adminUpdateProductAction,
  adminUploadProductImageAction,
} from "@/app/actions/admin-products";
import { adminUpdateOrderStatusAction } from "@/app/actions/admin-orders";

export default async function AdminPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="min-h-full bg-zinc-50">
        <Header />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">
          <MissingSupabaseEnv />
        </main>
      </div>
    );
  }

  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,type,material,price,quantity,image_url,description,size,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  const products = (data ?? []) as Product[];

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id,created_at,status,total_amount,customer_name,phone,address")
    .order("created_at", { ascending: false })
    .limit(20);

  if (ordersError) throw ordersError;

  return (
    <div className="min-h-full bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-zinc-600">Quản lý sản phẩm.</p>

        <div className="mt-6 rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Thêm sản phẩm</h2>
          <form action={adminCreateProductAction} className="mt-3 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">Tên</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="name"
                  required
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Loại</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="type"
                  placeholder="tote/crossbody/backpack"
                  required
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Chất liệu</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="material"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Kích thước</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="size"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Giá</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="price"
                  type="number"
                  required
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Tồn kho</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  name="quantity"
                  type="number"
                  required
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium">Mô tả</div>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                name="description"
                rows={3}
              />
            </label>

            <button className="w-fit rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800">
              Thêm
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-600">ID: {p.id}</div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <form action={adminUpdateProductAction} className="grid gap-3">
                  <input type="hidden" name="id" value={p.id} />

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium">Tên</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="name"
                        defaultValue={p.name}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-medium">Loại</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="type"
                        defaultValue={p.type}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-medium">Chất liệu</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="material"
                        defaultValue={p.material ?? ""}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-medium">Kích thước</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="size"
                        defaultValue={p.size ?? ""}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-medium">Giá</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="price"
                        type="number"
                        defaultValue={p.price}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-medium">Tồn kho</div>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        name="quantity"
                        type="number"
                        defaultValue={p.quantity}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <div className="text-sm font-medium">Mô tả</div>
                    <textarea
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      name="description"
                      rows={3}
                      defaultValue={p.description ?? ""}
                    />
                  </label>

                  <button className="w-fit rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800">
                    Lưu
                  </button>
                </form>

                <div className="grid gap-3">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium">Ảnh</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {p.image_url ? (
                        <a
                          href={p.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Xem ảnh hiện tại
                        </a>
                      ) : (
                        "Chưa có"
                      )}
                    </div>

                    <form
                      action={adminUploadProductImageAction}
                      className="mt-3 flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        className="w-full text-sm"
                        name="file"
                        type="file"
                        accept="image/*"
                        required
                      />
                      <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50">
                        Upload
                      </button>
                    </form>
                  </div>

                  <form action={adminDeleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="w-fit rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100">
                      Xóa sản phẩm
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Đơn hàng (gần đây)</h2>
          <div className="mt-3 space-y-3">
            {(orders ?? []).length === 0 ? (
              <div className="text-sm text-zinc-600">Chưa có đơn hàng.</div>
            ) : (
              (orders ?? []).map((o) => (
                <div key={o.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">Mã: {o.id}</div>
                    <div className="text-sm text-zinc-600">
                      {new Date(o.created_at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">
                    {o.customer_name} · {o.phone}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">{o.address}</div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="text-zinc-600">Tổng: </span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("vi-VN").format(o.total_amount)}{" "}
                        ₫
                      </span>
                    </div>

                    <form
                      action={adminUpdateOrderStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="rounded-md border px-2 py-1 text-sm"
                      >
                        <option>Chờ xác nhận</option>
                        <option>Đã xác nhận</option>
                        <option>Đang giao</option>
                        <option>Đã giao</option>
                        <option>Đã hủy</option>
                      </select>
                      <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50">
                        Cập nhật
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
