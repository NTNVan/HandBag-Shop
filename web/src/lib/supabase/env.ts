// IMPORTANT:
// - Client bundles must reference env vars via direct property access
//   (process.env.NEXT_PUBLIC_*) so Next.js can inline them at build time.
// - Dynamic indexing (process.env[name]) won't be inlined and will be undefined in the browser.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseUrl(): string {
  if (!SUPABASE_URL) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_URL");
  }
  return SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return SUPABASE_ANON_KEY;
}
