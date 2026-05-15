import Link from "next/link";

export function MissingSupabaseEnv() {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h1 className="text-xl font-semibold">Chưa cấu hình Supabase</h1>
      <p className="mt-2 text-sm text-zinc-600">
        App cần các biến môi trường `NEXT_PUBLIC_SUPABASE_URL` và
        `NEXT_PUBLIC_SUPABASE_ANON_KEY` để chạy.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/" className="rounded-md border px-3 py-1.5 text-sm">
          Trang chủ
        </Link>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        Xem chi tiết trong file `web/README.md` và copy `.env.example` → `.env`.
      </p>
    </div>
  );
}
