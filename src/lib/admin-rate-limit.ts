import { headers } from "next/headers";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 10_000;

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, LoginAttempt>();

function removeExpiredAttempts(now: number) {
  for (const [key, attempt] of attempts) {
    if (attempt.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

async function getClientKey() {
  const requestHeaders = await headers();
  const forwardedAddresses = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  return forwardedAddresses?.at(-1) || requestHeaders.get("x-real-ip") || "unknown";
}

export async function consumeLoginAttempt() {
  const now = Date.now();
  removeExpiredAttempts(now);
  const key = await getClientKey();
  const current = attempts.get(key);

  if (attempts.size >= MAX_TRACKED_CLIENTS && !current) {
    return { allowed: false, key };
  }

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, key };
  }

  if (current.count >= MAX_FAILED_ATTEMPTS) {
    return { allowed: false, key };
  }

  current.count += 1;
  return { allowed: true, key };
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}
