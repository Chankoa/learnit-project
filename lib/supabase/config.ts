const supabaseUrlKey = "NEXT_PUBLIC_SUPABASE_URL";
const supabasePublishableKey = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const supabaseLegacyAnonKey = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseKey();

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

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseKey());
}
