import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const getCurrentUser = cache(async () => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return (data as Profile) ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (profile.role !== "admin") return null;
  return profile;
}
