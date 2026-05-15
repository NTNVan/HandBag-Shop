"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { readCart, removeFromCart, updateQuantity } from "@/lib/cart";
import { createOrderFromCartAction } from "@/app/actions/orders";

export function CheckoutClient() {
  const [cart, setCart] = useState(() => readCart());

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart],
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thanh toán</h1>
        <Link href="/" className="text-sm text-zinc-600 hover:underline">
          ← Tiếp tục mua
        </Link>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Giỏ hàng</h2>
          {cart.length === 0 ? (
            <div className="mt-3 text-sm text-zinc-600">Giỏ hàng trống.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {cart.map((i) => (
                <div
                  key={i.productId}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-sm text-zinc-600">
                      {new Intl.NumberFormat("vi-VN").format(i.price)} ₫
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="w-20 rounded-md border px-2 py-1 text-sm"
                      type="number"
                      min={1}
                      value={i.quantity}
                      onChange={(e) => {
                        const next = updateQuantity(
                          i.productId,
                          Number(e.target.value),
                        );
                        setCart(next);
                      }}
                    />
                    <button
                      className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
                      onClick={() => {
                        const next = removeFromCart(i.productId);
                        setCart(next);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-zinc-600">Tổng cộng</div>
                <div className="font-semibold">
                  {new Intl.NumberFormat("vi-VN").format(total)} ₫
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
          <form action={createOrderFromCartAction} className="mt-3 space-y-3">
            <input
              type="hidden"
              name="cart_json"
              value={JSON.stringify(cart)}
            />

            <label className="block">
              <div className="text-sm font-medium">Họ tên</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                name="customer_name"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Số điện thoại</div>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                name="phone"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Địa chỉ</div>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                name="address"
                rows={3}
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Ghi chú</div>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                name="notes"
                rows={2}
              />
            </label>

            <button
              disabled={cart.length === 0}
              className="w-full rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Đặt hàng
            </button>

            <div className="text-xs text-zinc-600">
              Lưu ý: cần đăng nhập để đặt hàng.
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
