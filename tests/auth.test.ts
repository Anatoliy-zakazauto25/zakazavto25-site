import assert from "node:assert/strict";
import test from "node:test";
import { generateToken, readAdminToken, readToken } from "../src/lib/auth";

test("generates and reads a valid admin token", () => {
  const token = generateToken({ userId: "user-1", role: "ADMIN" });
  const payload = readToken(`Bearer ${token}`);
  assert.equal(payload?.userId, "user-1");
  assert.equal(payload?.role, "ADMIN");
  assert.deepEqual(readAdminToken(`Bearer ${token}`), payload);
});

test("rejects malformed authorization headers", () => {
  assert.equal(readToken(null), null);
  assert.equal(readToken("Basic abc"), null);
  assert.equal(readAdminToken("Bearer not-a-jwt"), null);
});

test("rejects roles outside the admin role set", () => {
  const token = generateToken({ userId: "user-2", role: "CLIENT" });
  assert.equal(readAdminToken(`Bearer ${token}`), null);
});
