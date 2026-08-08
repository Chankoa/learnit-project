import { getConfiguredDataSource } from "@/lib/config/data-source";
import { isDemoMode } from "@/lib/config/features";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const localAppUrl = "http://localhost:3000";

function normalizeAppUrl(value?: string | null) {
  const candidate = value?.trim();

  if (!candidate) {
    return undefined;
  }

  const withProtocol =
    candidate.startsWith("http://") || candidate.startsWith("https://")
      ? candidate
      : `https://${candidate}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getPublicAppUrl() {
  return (
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeAppUrl(process.env.URL) ??
    normalizeAppUrl(process.env.DEPLOY_PRIME_URL) ??
    localAppUrl
  );
}

export function getPublicRuntimeConfig() {
  return {
    adminEnabled: process.env.NEXT_PUBLIC_ENABLE_ADMIN !== "false",
    appUrl: getPublicAppUrl(),
    authEnabled: process.env.NEXT_PUBLIC_ENABLE_AUTH !== "false",
    dataSource: getConfiguredDataSource(),
    demoMode: isDemoMode,
    supabaseConfigured: isSupabaseConfigured()
  };
}
