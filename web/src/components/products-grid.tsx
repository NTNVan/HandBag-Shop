"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/db/types";
import { addToCart, readCart } from "@/lib/cart";

export function ProductsGrid({ products }: { products: Product[] }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = readCart();
    setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0));
  }, []);

  const formatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  return (
    <div>
      <div className="mb-4 text-sm text-zinc-600">Giỏ hàng: {cartCount}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border bg-white p-4">
            <div className="mb-2 text-sm text-zinc-600">
              {p.type} · {p.material ?? ""}
            </div>
            <Link
              href={`/products/${p.id}`}
              className="text-base font-semibold hover:underline"
            >
              {p.name}
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-medium">
                {formatter.format(p.price)} ₫
              </div>
              <div className="text-xs text-zinc-600">Còn: {p.quantity}</div>
            </div>
            <button
              className="mt-3 w-full rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
              disabled={p.quantity <= 0}
              onClick={() => {
                const cart = addToCart(
                  { productId: p.id, name: p.name, price: p.price },
                  1,
                );
                setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0));
              }}
            >
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
