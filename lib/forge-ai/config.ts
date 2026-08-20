import "server-only";

import { getRuntimeConfig, type AIProvider } from "@/lib/config/runtime";

export type ForgeAIProviderName = AIProvider;

export function getForgeAIConfig() {
  const { ai } = getRuntimeConfig();

  return {
    ...ai,
    baseUrlSource: process.env.AI_BASE_URL?.trim() ? "custom" : "default"
  };
}
