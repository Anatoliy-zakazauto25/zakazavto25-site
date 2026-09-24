import { CurrencyCode, VehicleCountry } from "@/generated/prisma/client";

export type FinancialInput = {
  vehiclePrice: number;
  currency: CurrencyCode;
  country: VehicleCountry;
  shippingCost?: number;
  customsCost?: number;
  utilisationFee?: number;
  brokerageCost?: number;
  otherCosts?: number;
  commission?: number;
};

export type FinancialBreakdown = {
  vehiclePriceRub: number;
  shippingCost: number;
  customsCost: number;
  utilisationFee: number;
  brokerageCost: number;
  otherCosts: number;
  commission: number;
  totalCost: number;
  currencyRate: number;
};

const defaultRates: Record<CurrencyCode, number> = { JPY: 0.62, KRW: 0.069, CNY: 12.8 };

function money(value: number) { return Math.round(value * 100) / 100; }

export function calculateFinancials(input: FinancialInput, rates: Partial<Record<CurrencyCode, number>> = {}, defaultCommission = 50_000): FinancialBreakdown {
  if (!Number.isFinite(input.vehiclePrice) || input.vehiclePrice < 0) throw new Error("Цена автомобиля должна быть неотрицательным числом");
  const currencyRate = rates[input.currency] ?? defaultRates[input.currency];
  if (!Number.isFinite(currencyRate) || currencyRate <= 0) throw new Error(`Не задан курс ${input.currency}`);
  const vehiclePriceRub = money(input.vehiclePrice * currencyRate);
  const shippingCost = money(input.shippingCost ?? 0);
  const customsCost = money(input.customsCost ?? 0);
  const utilisationFee = money(input.utilisationFee ?? 0);
  const brokerageCost = money(input.brokerageCost ?? 0);
  const otherCosts = money(input.otherCosts ?? 0);
  const commission = money(input.commission ?? defaultCommission);
  const totalCost = money(vehiclePriceRub + shippingCost + customsCost + utilisationFee + brokerageCost + otherCosts + commission);
  return { vehiclePriceRub, shippingCost, customsCost, utilisationFee, brokerageCost, otherCosts, commission, totalCost, currencyRate };
}

export function calculateCountryDefaults(country: VehicleCountry): Pick<FinancialBreakdown, "shippingCost" | "customsCost" | "utilisationFee"> {
  const shippingCost = country === VehicleCountry.JAPAN ? 120_000 : country === VehicleCountry.KOREA ? 150_000 : 130_000;
  return { shippingCost, customsCost: 0, utilisationFee: 0 };
}
