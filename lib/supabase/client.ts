import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | null = null;

export function createClient() {
  if (!browserClient) {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    browserClient = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return browserClient;
}
