import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export { isSupabaseConfigured };

export async function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. Auth routes can refresh them later.
        }
      }
    }
  });
}

export async function createOptionalClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient();
}
