"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Dùng Supabase Auth (email/password).
        </p>

        <form
          className="mt-6 space-y-3 rounded-lg border bg-white p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const supabase = createSupabaseBrowserClient();
              const { error: signInError } =
                await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
              if (signInError) throw signInError;
              router.push("/");
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block">
            <div className="text-sm font-medium">Email</div>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium">Mật khẩu</div>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="text-sm text-zinc-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="underline">
              Đăng ký
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
