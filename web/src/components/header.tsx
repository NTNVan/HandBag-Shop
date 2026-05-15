import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          HandbagShop
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Sản phẩm
          </Link>
          {user ? (
            <Link href="/orders" className="hover:underline">
              Đơn hàng
            </Link>
          ) : null}
          {profile?.role === "admin" ? (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <form action={signOutAction}>
              <button className="rounded-md border px-3 py-1.5 hover:bg-zinc-50">
                Đăng xuất
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border px-3 py-1.5 hover:bg-zinc-50"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-zinc-800"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
