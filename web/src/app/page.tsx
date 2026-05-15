import Link from "next/link";

import { Header } from "@/components/header";
import { MissingSupabaseEnv } from "@/components/missing-supabase-env";
import { ProductsGrid } from "@/components/products-grid";
import type { Product } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SearchParams = {
  q?: string;
  type?: string;
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

function buildQuery(params: SearchParams, nextPage: number) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.type) sp.set("type", params.type);
  if (params.material) sp.set("material", params.material);
  if (params.minPrice) sp.set("minPrice", params.minPrice);
  if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
  sp.set("page", String(nextPage));
  return sp.toString();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 12;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select(
      "id,name,type,material,price,quantity,image_url,description,size,created_at,updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.type) query = query.eq("type", params.type);
  if (params.material) query = query.eq("material", params.material);
  if (params.minPrice) query = query.gte("price", Number(params.minPrice));
  if (params.maxPrice) query = query.lte("price", Number(params.maxPrice));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query.range(from, to);

  const products = (data ?? []) as Product[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-full bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Danh sách sản phẩm</h1>
            <p className="text-sm text-zinc-600">
              {error ? "Không tải được dữ liệu." : `${total} sản phẩm`}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800"
          >
            Thanh toán
          </Link>
        </div>

        <form className="mb-6 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Tìm kiếm..."
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm"
          />
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tất cả loại</option>
            <option value="tote">Tote</option>
            <option value="crossbody">Đeo chéo</option>
            <option value="backpack">Balo</option>
          </select>
          <select
            name="material"
            defaultValue={params.material ?? ""}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tất cả chất liệu</option>
            <option value="vải">Vải</option>
            <option value="da">Da</option>
            <option value="cotton">Cotton</option>
          </select>
          <input
            name="minPrice"
            defaultValue={params.minPrice ?? ""}
            placeholder="Giá từ"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="maxPrice"
            defaultValue={params.maxPrice ?? ""}
            placeholder="Giá đến"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800">
            Lọc
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-red-600">
            {String(error.message)}
          </div>
        ) : (
          <ProductsGrid products={products} />
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            Trang {page}/{totalPages}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/?${buildQuery(params, Math.max(1, page - 1))}`}
              className={`rounded-md border px-3 py-1.5 text-sm hover:bg-white ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Trước
            </Link>
            <Link
              href={`/?${buildQuery(params, Math.min(totalPages, page + 1))}`}
              className={`rounded-md border px-3 py-1.5 text-sm hover:bg-white ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Sau
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
