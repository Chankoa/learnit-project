import "server-only";

export type ForgeAIProviderName = "mock" | "openai" | "openai-compatible";

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function getProviderName(value: string | undefined): ForgeAIProviderName {
  if (value === "openai" || value === "openai-compatible") {
    return value;
  }

  return process.env.OPENAI_API_KEY || process.env.AI_API_KEY ? "openai" : "mock";
}

function normalizeOpenAIBaseUrl(value: string) {
  const normalized = value.trim().replace(/\/+$/, "");

  if (normalized.endsWith("/chat/completions")) {
    return normalized.replace(/\/chat\/completions$/, "");
  }

  if (normalized.endsWith("/responses")) {
    return normalized.replace(/\/responses$/, "");
  }

  return normalized;
}

export function getForgeAIConfig() {
  const provider = getProviderName(process.env.AI_PROVIDER);
  const customBaseUrl = process.env.AI_BASE_URL?.trim();

  return {
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
    baseUrl: normalizeOpenAIBaseUrl(customBaseUrl || "https://api.openai.com/v1"),
    baseUrlSource: customBaseUrl ? "custom" : "default",
    maxInputChars: getPositiveInteger(process.env.FORGE_AI_MAX_INPUT_CHARS, 3000),
    model:
      process.env.OPENAI_MODEL || process.env.AI_MODEL || (provider === "mock" ? "forge-mock-v1" : ""),
    provider,
    rateLimitPerHour: getPositiveInteger(process.env.FORGE_AI_RATE_LIMIT_PER_HOUR, 8),
    timeoutMs: getPositiveInteger(process.env.AI_TIMEOUT_MS, 25000)
  };
}
