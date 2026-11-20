import assert from "node:assert/strict";
import test from "node:test";
import { createSessionToken, hashPassword, isValidPassword, normalizeUsername, verifyPassword, verifySessionToken } from "./auth.js";

test("normalizes usernames and rejects invalid values", () => {
  assert.deepEqual(normalizeUsername("  ArcUser  "), { username: "ArcUser", usernameKey: "arcuser" });
  assert.deepEqual(normalizeUsername(" 도전자 "), { username: "도전자", usernameKey: "도전자" });
  assert.equal(normalizeUsername("a"), null);
  assert.equal(normalizeUsername(" \n "), null);
});

test("enforces password length and verifies a scrypt hash", async () => {
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("correct-horse"), true);
  const encoded = await hashPassword("correct-horse");
  assert.equal(await verifyPassword("correct-horse", encoded), true);
  assert.equal(await verifyPassword("wrong-password", encoded), false);
});

test("signs session tokens and rejects tampered or expired tokens", () => {
  const secret = "a-session-secret-that-is-at-least-32-bytes-long";
  const now = Date.UTC(2026, 10, 20);
  const token = createSessionToken({ id: 7, username: "도전자" }, secret, { now });
  assert.deepEqual(verifySessionToken(token, secret, { now }), { id: "7", username: "도전자" });
  assert.equal(verifySessionToken(`${token.slice(0, -1)}x`, secret, { now }), null);
  assert.equal(verifySessionToken(token, secret, { now: now + 31 * 24 * 60 * 60 * 1000 }), null);
});
