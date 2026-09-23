import assert from "node:assert/strict";
import test from "node:test";
import { authHeaders, clientApi } from "../src/lib/client-api";

test("authHeaders creates stable bearer headers", () => {
  assert.deepEqual(authHeaders("token", true), { "content-type": "application/json", authorization: "Bearer token" });
});

test("clientApi maps rate limit response to a user-facing message", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false }), { status: 429 });
  try { const result = await clientApi("/api/test"); assert.equal(result.error, "Слишком много запросов. Попробуйте позже."); } finally { globalThis.fetch = originalFetch; }
});

test("clientApi maps auth and server errors to safe messages", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null, { status: 401 });
    assert.equal((await clientApi("/api/test")).error, "Сессия истекла. Войдите снова.");

    globalThis.fetch = async () => new Response(null, { status: 503 });
    assert.equal((await clientApi("/api/test")).error, "Сервис временно недоступен.");
  } finally { globalThis.fetch = originalFetch; }
});

test("clientApi maps network failures to a safe message", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("network failure"); };
  try { assert.equal((await clientApi("/api/test")).error, "Сервис временно недоступен."); } finally { globalThis.fetch = originalFetch; }
});
