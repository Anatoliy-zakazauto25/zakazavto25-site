import assert from "node:assert/strict";
import test from "node:test";
import { apiError, internalApiError } from "../src/lib/api-error";

test("apiError returns standard JSON error shape", async () => {
  const response = apiError("VALIDATION_ERROR", "Некорректные данные", 422, { field: "email" });
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { success: false, error: { code: "VALIDATION_ERROR", message: "Некорректные данные", details: { field: "email" } } });
});

test("internalApiError hides the original exception", async () => {
  const response = internalApiError("test_failure", new Error("secret database password"));
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.error.code, "INTERNAL_ERROR");
  assert.equal(body.error.message, "Внутренняя ошибка сервера");
  assert.equal(JSON.stringify(body).includes("secret database password"), false);
});
