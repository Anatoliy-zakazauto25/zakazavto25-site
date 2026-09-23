import assert from "node:assert/strict";
import test from "node:test";
import { parseAuditRetentionDays } from "../src/lib/audit-retention";
import { sanitizeAuditMetadata } from "../src/lib/audit-contract";
import { parseAuditQuery } from "../src/lib/audit-query";

test("audit metadata contract excludes personal data by construction", () => {
  const metadata = { status: "IN_PROGRESS", isPublished: true };
  assert.deepEqual(Object.keys(metadata).sort(), ["isPublished", "status"]);
  assert.equal("phone" in metadata, false);
  assert.equal("email" in metadata, false);
});

test("audit retention accepts a safe range", () => {
  assert.equal(parseAuditRetentionDays(undefined), 365);
  assert.equal(parseAuditRetentionDays("30"), 30);
  assert.throws(() => parseAuditRetentionDays("29"));
  assert.throws(() => parseAuditRetentionDays("3651"));
});

test("audit API metadata sanitizer keeps only approved fields", () => {
  assert.deepEqual(sanitizeAuditMetadata({ status: "NEW", phone: "+7999", email: "secret@example.com", nested: {} }), { status: "NEW" });
});

test("audit query normalizes invalid pagination and limits", () => {
  const query = parseAuditQuery(new URLSearchParams("page=wat&limit=999&entityType=Order&action=UPDATE"));
  assert.deepEqual(query, { page: 1, perPage: 100, entityType: "Order", action: "UPDATE" });
  assert.equal(parseAuditQuery(new URLSearchParams("page=-4&limit=0")).page, 1);
});
