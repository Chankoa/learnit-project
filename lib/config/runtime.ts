const localAppUrl = "http://localhost:3000";

export type ConfiguredDataSource = "mock" | "supabase";
export type AIProvider = "mock" | "openai" | "openai-compatible";

type RuntimeEnvironment = Record<string, string | undefined>;

export type RuntimeConfigValidation = {
  errors: string[];
  warnings: string[];
};

export type RuntimeConfig = {
  adminEnabled: boolean;
  ai: {
    apiKey?: string;
    baseUrl: string;
    maxInputChars: number;
    maxOutputTokens: number;
    model: string;
    provider: AIProvider;
    rateLimitPerHour: number;
    timeoutMs: number;
  };
  appUrl: string;
  authEnabled: boolean;
  dataSource: ConfiguredDataSource;
  demoMode: boolean;
  supabase: {
    publishableKey?: string;
    serviceRoleKey?: string;
    url?: string;
  };
};

function getOptionalValue(value: string | undefined, name: string, errors: string[]) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized) {
    errors.push(`${name} must not be empty when defined.`);
    return undefined;
  }

  return normalized;
}

function getBoolean(
  value: string | undefined,
  name: string,
  fallback: boolean,
  errors: string[]
) {
  const normalized = getOptionalValue(value, name, errors);

  if (normalized === undefined) {
    return fallback;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  errors.push(`${name} must be "true" or "false".`);
  return fallback;
}

function getPositiveInteger(
  value: string | undefined,
  name: string,
  fallback: number,
  errors: string[]
) {
  const normalized = getOptionalValue(value, name, errors);

  if (normalized === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(normalized) || Number(normalized) < 1) {
    errors.push(`${name} must be a positive integer.`);
    return fallback;
  }

  return Number(normalized);
}

function normalizeAbsoluteUrl(value: string, name: string, errors: string[]) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    errors.push(`${name} must be an absolute HTTP(S) URL.`);
    return undefined;
  }
}

function getPublicAppUrlFromEnvironment(environment: RuntimeEnvironment, errors: string[]) {
  const configuredUrl = getOptionalValue(
    environment.NEXT_PUBLIC_APP_URL ?? environment.NEXT_PUBLIC_SITE_URL,
    "NEXT_PUBLIC_APP_URL",
    errors
  );

  if (configuredUrl) {
    return normalizeAbsoluteUrl(configuredUrl, "NEXT_PUBLIC_APP_URL", errors);
  }

  const vercelUrl = getOptionalValue(environment.VERCEL_URL, "VERCEL_URL", errors);

  if (vercelUrl) {
    return normalizeAbsoluteUrl(`https://${vercelUrl}`, "VERCEL_URL", errors);
  }

  if (environment.NODE_ENV === "development" || !environment.NODE_ENV) {
    return localAppUrl;
  }

  errors.push("NEXT_PUBLIC_APP_URL is required outside development when VERCEL_URL is unavailable.");
  return undefined;
}

function getProvider(environment: RuntimeEnvironment, errors: string[]): AIProvider {
  const configured = getOptionalValue(environment.AI_PROVIDER, "AI_PROVIDER", errors);

  if (configured === undefined) {
    return "mock";
  }

  if (configured === "mock" || configured === "openai" || configured === "openai-compatible") {
    return configured;
  }

  errors.push('AI_PROVIDER must be "mock", "openai", or "openai-compatible".');
  return "mock";
}

function getDataSource(environment: RuntimeEnvironment, errors: string[]): ConfiguredDataSource {
  const configured = getOptionalValue(
    environment.NEXT_PUBLIC_DATA_SOURCE,
    "NEXT_PUBLIC_DATA_SOURCE",
    errors
  );

  if (configured === undefined) {
    return "mock";
  }

  if (configured === "mock" || configured === "supabase") {
    return configured;
  }

  errors.push('NEXT_PUBLIC_DATA_SOURCE must be "mock" or "supabase".');
  return "mock";
}

function getConfig(environment: RuntimeEnvironment, validation: RuntimeConfigValidation): RuntimeConfig {
  const { errors } = validation;
  const dataSource = getDataSource(environment, errors);
  const provider = getProvider(environment, errors);
  const supabaseUrl = getOptionalValue(environment.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL", errors);
  const publishableKey = getOptionalValue(
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    errors
  );
  const apiKey = getOptionalValue(
    environment.OPENAI_API_KEY ?? environment.AI_API_KEY,
    "OPENAI_API_KEY",
    errors
  );
  const configuredModel = getOptionalValue(
    environment.OPENAI_MODEL ?? environment.AI_MODEL,
    "OPENAI_MODEL",
    errors
  );
  const configuredBaseUrl = getOptionalValue(environment.AI_BASE_URL, "AI_BASE_URL", errors);
  const baseUrl = normalizeAbsoluteUrl(
    configuredBaseUrl ?? "https://api.openai.com/v1",
    "AI_BASE_URL",
    errors
  ) ?? "https://api.openai.com/v1";

  if (/\/(responses|chat\/completions)$/i.test(baseUrl)) {
    errors.push("AI_BASE_URL must be an API base URL and must not end with /responses or /chat/completions.");
  }

  if (supabaseUrl) {
    normalizeAbsoluteUrl(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL", errors);
  }

  if (dataSource === "supabase" && (!supabaseUrl || !publishableKey)) {
    errors.push(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required when NEXT_PUBLIC_DATA_SOURCE=supabase."
    );
  }

  if (provider !== "mock" && (!apiKey || !configuredModel)) {
    errors.push("OPENAI_API_KEY and OPENAI_MODEL are required when AI_PROVIDER is not mock.");
  }

  const appUrl = getPublicAppUrlFromEnvironment(environment, errors) ?? localAppUrl;

  if (environment.VERCEL_ENV === "production" && appUrl.startsWith("http://localhost")) {
    errors.push("NEXT_PUBLIC_APP_URL must not use localhost in Vercel Production.");
  }

  if (environment.VERCEL_ENV === "preview" && appUrl.startsWith("http://localhost")) {
    errors.push("NEXT_PUBLIC_APP_URL must not use localhost in Vercel Preview.");
  }

  return {
    adminEnabled: getBoolean(environment.NEXT_PUBLIC_ENABLE_ADMIN, "NEXT_PUBLIC_ENABLE_ADMIN", true, errors),
    ai: {
      apiKey,
      baseUrl,
      maxInputChars: getPositiveInteger(
        environment.FORGE_AI_MAX_INPUT_CHARS,
        "FORGE_AI_MAX_INPUT_CHARS",
        3000,
        errors
      ),
      maxOutputTokens: getPositiveInteger(
        environment.FORGE_AI_MAX_OUTPUT_TOKENS,
        "FORGE_AI_MAX_OUTPUT_TOKENS",
        1200,
        errors
      ),
      model: configuredModel ?? (provider === "mock" ? "forge-mock-v1" : ""),
      provider,
      rateLimitPerHour: getPositiveInteger(
        environment.FORGE_AI_RATE_LIMIT_PER_HOUR,
        "FORGE_AI_RATE_LIMIT_PER_HOUR",
        8,
        errors
      ),
      timeoutMs: getPositiveInteger(environment.AI_TIMEOUT_MS, "AI_TIMEOUT_MS", 25000, errors)
    },
    appUrl,
    authEnabled: getBoolean(environment.NEXT_PUBLIC_ENABLE_AUTH, "NEXT_PUBLIC_ENABLE_AUTH", true, errors),
    dataSource,
    demoMode: getBoolean(environment.NEXT_PUBLIC_DEMO_MODE, "NEXT_PUBLIC_DEMO_MODE", false, errors),
    supabase: {
      publishableKey,
      serviceRoleKey: getOptionalValue(
        environment.SUPABASE_SERVICE_ROLE_KEY,
        "SUPABASE_SERVICE_ROLE_KEY",
        errors
      ),
      url: supabaseUrl
    }
  };
}

export function validateRuntimeConfig(environment: RuntimeEnvironment = process.env): RuntimeConfigValidation {
  const validation: RuntimeConfigValidation = { errors: [], warnings: [] };
  getConfig(environment, validation);

  if (environment.NEXT_PUBLIC_SITE_URL) {
    validation.warnings.push("NEXT_PUBLIC_SITE_URL is a legacy alias; use NEXT_PUBLIC_APP_URL instead.");
  }

  if (environment.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    validation.warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is a legacy alias; use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY instead.");
  }

  if (environment.AI_API_KEY || environment.AI_MODEL) {
    validation.warnings.push("AI_API_KEY and AI_MODEL are legacy aliases; use OPENAI_API_KEY and OPENAI_MODEL instead.");
  }

  return validation;
}

export function getRuntimeConfig(environment: RuntimeEnvironment = process.env): RuntimeConfig {
  const validation: RuntimeConfigValidation = { errors: [], warnings: [] };
  const config = getConfig(environment, validation);

  if (validation.errors.length > 0) {
    throw new Error(`Invalid runtime configuration: ${validation.errors.join(" ")}`);
  }

  return config;
}

export function getPublicAppUrl() {
  return getRuntimeConfig().appUrl;
}

export function getPublicRuntimeConfig() {
  const config = getRuntimeConfig();

  return {
    adminEnabled: config.adminEnabled,
    appUrl: config.appUrl,
    authEnabled: config.authEnabled,
    dataSource: config.dataSource,
    demoMode: config.demoMode,
    supabaseConfigured: Boolean(config.supabase.url && config.supabase.publishableKey)
  };
}
