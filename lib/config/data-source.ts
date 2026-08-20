import { getRuntimeConfig, type ConfiguredDataSource } from "@/lib/config/runtime";

export type { ConfiguredDataSource } from "@/lib/config/runtime";

export function getConfiguredDataSource(): ConfiguredDataSource {
  return getRuntimeConfig().dataSource;
}