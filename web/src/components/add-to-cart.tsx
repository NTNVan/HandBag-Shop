"use client";

import { useState } from "react";

import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; price: number; disabled?: boolean };
}) {
  const [added, setAdded] = useState(false);

  return (
    <button
      className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
      disabled={product.disabled}
      onClick={() => {
        addToCart(
          { productId: product.id, name: product.name, price: product.price },
          1,
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Đã thêm" : "Thêm vào giỏ"}
    </button>
  );
}
