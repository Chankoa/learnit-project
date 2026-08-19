import "server-only";

export type ForgeAIProviderName = "mock" | "openai-compatible";

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function getProviderName(value: string | undefined): ForgeAIProviderName {
  return value === "openai-compatible" ? "openai-compatible" : "mock";
}

export function getForgeAIConfig() {
  const provider = getProviderName(process.env.AI_PROVIDER);
  const customBaseUrl = process.env.AI_BASE_URL;

  return {
    apiKey: process.env.AI_API_KEY,
    baseUrl: customBaseUrl || "https://api.openai.com/v1/chat/completions",
    baseUrlSource: customBaseUrl ? "custom" : "default",
    maxInputChars: getPositiveInteger(process.env.FORGE_AI_MAX_INPUT_CHARS, 3000),
    model: process.env.AI_MODEL || (provider === "mock" ? "forge-mock-v1" : ""),
    provider,
    rateLimitPerHour: getPositiveInteger(process.env.FORGE_AI_RATE_LIMIT_PER_HOUR, 8),
    timeoutMs: getPositiveInteger(process.env.AI_TIMEOUT_MS, 25000)
  };
}
