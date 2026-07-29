import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "camisetas_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured. Set it before using the private panel.");
  }

  return password;
}

function sign(payload: string, password: string) {
  return createHmac("sha256", password).update(payload).digest("base64url");
}

function hasValidSignature(payload: string, signature: string, password: string) {
  const expected = sign(payload, password);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${expiresAt}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload, getAdminPassword())}`;
}

export function isValidAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [expiresAt, nonce, signature] = parts;
  const expiresAtNumber = Number(expiresAt);
  if (!nonce || !Number.isSafeInteger(expiresAtNumber) || expiresAtNumber <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    return hasValidSignature(`${expiresAt}.${nonce}`, signature, getAdminPassword());
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();
  const passwordBuffer = Buffer.from(password);
  const configuredBuffer = Buffer.from(configuredPassword);

  return passwordBuffer.length === configuredBuffer.length && timingSafeEqual(passwordBuffer, configuredBuffer);
}
