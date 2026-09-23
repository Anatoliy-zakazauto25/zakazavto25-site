import assert from "node:assert/strict";
import test from "node:test";
import { CurrencyCode, VehicleCountry } from "../src/generated/prisma/client";
import { calculateCountryDefaults, calculateFinancials } from "../src/lib/financial";

test("calculates converted price and total with default commission", () => {
  const result = calculateFinancials({ vehiclePrice: 1_000_000, currency: CurrencyCode.KRW, country: VehicleCountry.KOREA, shippingCost: 150_000, customsCost: 200_000 }, { KRW: 0.07 }, 50_000);
  assert.equal(result.vehiclePriceRub, 70_000);
  assert.equal(result.totalCost, 470_000);
  assert.equal(result.currencyRate, 0.07);
});

test("uses explicit commission and rounds monetary values", () => {
  const result = calculateFinancials({ vehiclePrice: 12_345.678, currency: CurrencyCode.CNY, country: VehicleCountry.CHINA, commission: 1_234.567 }, { CNY: 10.123456 });
  assert.equal(result.vehiclePriceRub, 124_980.93);
  assert.equal(result.commission, 1_234.57);
  assert.equal(result.totalCost, 126_215.5);
});

test("rejects negative vehicle price", () => {
  assert.throws(() => calculateFinancials({ vehiclePrice: -1, currency: CurrencyCode.JPY, country: VehicleCountry.JAPAN }), /неотрицательным/);
});

test("country defaults select expected shipping cost", () => {
  assert.equal(calculateCountryDefaults(VehicleCountry.JAPAN).shippingCost, 120_000);
  assert.equal(calculateCountryDefaults(VehicleCountry.KOREA).shippingCost, 150_000);
  assert.equal(calculateCountryDefaults(VehicleCountry.CHINA).shippingCost, 130_000);
});
