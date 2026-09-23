import assert from "node:assert/strict";
import test from "node:test";
import { validateAdminBootstrap } from "../src/lib/admin-bootstrap";

test("normalizes valid admin email and accepts a strong password", () => {
  const result = validateAdminBootstrap({ email: " Admin@Example.com ", password: "SecurePassword123" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "admin@example.com");
});

test("rejects weak admin bootstrap credentials", () => {
  assert.equal(validateAdminBootstrap({ email: "not-an-email", password: "short" }).success, false);
  assert.equal(validateAdminBootstrap({ email: "admin@example.com", password: "onlyletterslong" }).success, false);
});
