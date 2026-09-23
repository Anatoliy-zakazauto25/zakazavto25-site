import assert from "node:assert/strict";
import test from "node:test";
import { LeadType } from "../src/generated/prisma/client";
import { formatLeadNotification } from "../src/lib/telegram";

test("lead notification contains no personal data", () => {
  const text = formatLeadNotification({ id: "lead-1", type: LeadType.VEHICLE_REQUEST, vehicleId: "vehicle-1", source: "website" }, "https://admin.example.com");
  assert.match(text, /lead-1/);
  assert.match(text, /vehicle-1/);
  assert.doesNotMatch(text, /Иван|\+7999|@secret/);
});
