import assert from "node:assert/strict";
import test from "node:test";
import { rateLimit } from "../src/lib/rate-limit";

test("allows requests up to configured limit and blocks the next one", () => {
  const key = `test-${Date.now()}-${Math.random()}`;
  assert.equal(rateLimit(key, 2, 60_000).allowed, true);
  assert.equal(rateLimit(key, 2, 60_000).allowed, true);
  const blocked = rateLimit(key, 2, 60_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});

test("starts a new bucket after the window expires", async () => {
  const key = `test-expiring-${Date.now()}-${Math.random()}`;
  assert.equal(rateLimit(key, 1, 1).allowed, true);
  assert.equal(rateLimit(key, 1, 1).allowed, false);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(rateLimit(key, 1, 1).allowed, true);
});
