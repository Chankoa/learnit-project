import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getRuntimeConfig } from "@/lib/config/runtime";

export function createAdminClient() {
  const { serviceRoleKey, url: supabaseUrl } = getRuntimeConfig().supabase;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}