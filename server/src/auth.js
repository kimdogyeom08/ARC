import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;
const sessionLifetimeSeconds = 30 * 24 * 60 * 60;
const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function normalizeUsername(value) {
  if (typeof value !== "string") return null;
  const username = value.normalize("NFKC").trim();
  if (username.length < 2 || username.length > 32 || /[\u0000-\u001f\u007f]/u.test(username)) return null;
  return { username, usernameKey: username.toLowerCase() };
}

export function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && Buffer.byteLength(value, "utf8") <= 128;
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, passwordKeyLength, scryptOptions);
  return `scrypt$${scryptOptions.N}$${scryptOptions.r}$${scryptOptions.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password, encodedHash) {
  if (typeof password !== "string" || typeof encodedHash !== "string") return false;
  const [algorithm, n, r, p, encodedSalt, encodedKey, extra] = encodedHash.split("$");
  if (algorithm !== "scrypt" || extra !== undefined) return false;
  if (Number(n) !== scryptOptions.N || Number(r) !== scryptOptions.r || Number(p) !== scryptOptions.p) return false;

  const salt = Buffer.from(encodedSalt, "base64url");
  const expectedKey = Buffer.from(encodedKey, "base64url");
  if (salt.length !== 16 || expectedKey.length !== passwordKeyLength) return false;
  const actualKey = await scrypt(password, salt, passwordKeyLength, scryptOptions);
  return timingSafeEqual(actualKey, expectedKey);
}

export function createSessionToken(user, secret, { now = Date.now() } = {}) {
  if (typeof secret !== "string" || Buffer.byteLength(secret) < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 bytes.");
  }
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const issuedAt = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id),
    username: user.username,
    iat: issuedAt,
    exp: issuedAt + sessionLifetimeSeconds,
  })).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

export function verifySessionToken(token, secret, { now = Date.now() } = {}) {
  if (typeof token !== "string" || typeof secret !== "string" || Buffer.byteLength(secret) < 32) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [headerPart, payloadPart, signaturePart] = parts;
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const expectedSignature = createHmac("sha256", secret).update(`${headerPart}.${payloadPart}`).digest();
    const actualSignature = Buffer.from(signaturePart, "base64url");
    if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;

    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    if (
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      typeof payload.username !== "string" ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(now / 1000)
    ) return null;

    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
