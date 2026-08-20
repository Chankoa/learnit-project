import { getRuntimeConfig } from "@/lib/config/runtime";

const supabaseUrlKey = "NEXT_PUBLIC_SUPABASE_URL";
const supabasePublishableKey = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const supabaseLegacyAnonKey = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getSupabaseKey() {
  return getRuntimeConfig().supabase.publishableKey;
}

export function getSupabaseConfig() {
  const { publishableKey: supabaseKey, url: supabaseUrl } = getRuntimeConfig().supabase;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Supabase is not configured. Set ${supabaseUrlKey} and ${supabasePublishableKey} or ${supabaseLegacyAnonKey}.`
    );
  }

  return {
    supabaseUrl,
    supabaseKey
  };
}

export function assertSupabaseConfig() {
  return getSupabaseConfig();
}

export function isSupabaseConfigured() {
  const { publishableKey, url } = getRuntimeConfig().supabase;
  return Boolean(url && publishableKey);
}
