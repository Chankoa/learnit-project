export type ConfiguredDataSource = "mock" | "supabase";

export function getConfiguredDataSource(): ConfiguredDataSource {
  const configuredSource = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

  if (configuredSource === "mock" || configuredSource === "supabase") {
    return configuredSource;
  }

  throw new Error(
    `Unsupported NEXT_PUBLIC_DATA_SOURCE value: ${configuredSource}. Use "mock" or "supabase".`
  );
}