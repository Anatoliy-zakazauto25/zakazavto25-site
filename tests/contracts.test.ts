import assert from "node:assert/strict";
import test from "node:test";
import { LeadType } from "../src/generated/prisma/client";
import { validateLeadPayload } from "../src/lib/lead-contract";
import { serializeTrackingOrder } from "../src/lib/tracking-contract";

test("lead contract requires consent and one contact method", () => {
  const invalid = validateLeadPayload({ type: LeadType.VEHICLE_REQUEST, contact: { name: "Иван" }, consentGiven: false });
  assert.equal(invalid.ok, false);
  const valid = validateLeadPayload({ type: LeadType.VEHICLE_REQUEST, contact: { name: "Иван", phone: "+79990000000" }, consentGiven: true });
  assert.equal(valid.ok, true);
});

test("calculation lead requires vehicle id", () => {
  const result = validateLeadPayload({ type: LeadType.VEHICLE_CALCULATION, contact: { name: "Иван", phone: "+79990000000" }, consentGiven: true });
  assert.equal(result.ok, false);
});

test("tracking serializer hides pricing when it is not public", () => {
  const base = { orderNumber: "ЗА-100", status: "NEW", createdAt: new Date(), pricingPublic: false, vehiclePrice: 100, currency: "KRW", currencyRate: 0.07, totalCost: 1000, shippingCost: 10, customsCost: 20, utilisationFee: 30, brokerageCost: 40, otherCosts: 50, commission: 60, vehicle: null, timeline: [] };
  assert.equal(serializeTrackingOrder(base).pricing, null);
  assert.equal(serializeTrackingOrder({ ...base, pricingPublic: true }).pricing?.totalCost, 1000);
});
