import "server-only";

import { getForgeAIConfig } from "@/lib/forge-ai/config";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
const windowMs = 60 * 60 * 1000;

export function assertForgeAIRateLimit(userId: string, action: string) {
  const config = getForgeAIConfig();
  const key = `${userId}:${action}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= config.rateLimitPerHour) {
    throw new Error("Limite temporaire atteinte. Réessayez plus tard.");
  }

  current.count += 1;
}
