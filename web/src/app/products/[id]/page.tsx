import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart";
import { Header } from "@/components/header";
import { MissingSupabaseEnv } from "@/components/missing-supabase-env";
import type { Product } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,type,material,price,quantity,image_url,description,size,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) notFound();
  if (!data) notFound();

  const product = data as Product;

  return (
    <div className="min-h-full bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-600 hover:underline">
            ← Quay lại
          </Link>
          <div className="flex items-center gap-2">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                disabled: product.quantity <= 0,
              }}
            />
            <Link
              href="/checkout"
              className="rounded-md border px-3 py-2 text-sm hover:bg-white"
            >
              Thanh toán
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="mt-2 text-sm text-zinc-600">
            {product.type} · {product.material ?? ""}
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            <div>
              <div className="text-zinc-600">Giá</div>
              <div className="font-medium">
                {new Intl.NumberFormat("vi-VN").format(product.price)} ₫
              </div>
            </div>
            <div>
              <div className="text-zinc-600">Tồn kho</div>
              <div className="font-medium">{product.quantity}</div>
            </div>
            {product.size ? (
              <div>
                <div className="text-zinc-600">Kích thước</div>
                <div className="font-medium">{product.size}</div>
              </div>
            ) : null}
            {product.description ? (
              <div>
                <div className="text-zinc-600">Mô tả</div>
                <div className="whitespace-pre-wrap">{product.description}</div>
              </div>
            ) : null}
          </div>

          {product.image_url ? (
            <div className="mt-5">
              {/* Keep it simple; Next Image needs domain allowlist */}
              <a
                href={product.image_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-600 hover:underline"
              >
                Xem ảnh
              </a>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
