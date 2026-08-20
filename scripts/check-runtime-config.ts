import { loadEnvConfig } from "@next/env";

import { getRuntimeConfig, validateRuntimeConfig } from "../lib/config/runtime";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const validation = validateRuntimeConfig();

console.log("Runtime config check");

for (const warning of validation.warnings) {
  console.warn(`WARN ${warning}`);
}

if (validation.errors.length > 0) {
  for (const error of validation.errors) {
    console.error(`ERROR ${error}`);
  }

  process.exitCode = 1;
} else {
  const config = getRuntimeConfig();
  const checks = [
    ["NEXT_PUBLIC_DATA_SOURCE", config.dataSource],
    ["NEXT_PUBLIC_SUPABASE_URL", config.supabase.url ? "OK" : "not configured"],
    ["NEXT_PUBLIC_SUPABASE_KEY", config.supabase.publishableKey ? "OK" : "not configured"],
    ["NEXT_PUBLIC_APP_URL", config.appUrl ? "OK" : "not configured"],
    ["AI_PROVIDER", config.ai.provider],
    ["AI_MODEL", config.ai.model ? "OK" : "not configured"],
    ["AI_API_KEY", config.ai.apiKey ? "PRESENT" : "not configured"]
  ] as const;

  for (const [name, status] of checks) {
    console.log(`${name.padEnd(30, ".")} ${status}`);
  }
}