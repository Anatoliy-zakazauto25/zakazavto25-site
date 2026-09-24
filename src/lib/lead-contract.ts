import { LeadType } from "@/generated/prisma/client";
import { z } from "zod";

export const leadSchema = z.object({ type: z.nativeEnum(LeadType).default(LeadType.VEHICLE_REQUEST), vehicleId: z.string().uuid().optional(), vehicleRequest: z.record(z.string(), z.unknown()).optional(), contact: z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(5).max(40).optional(), email: z.string().trim().email().optional(), telegram: z.string().trim().max(100).optional() }).refine((value) => Boolean(value.phone || value.telegram || value.email), "Укажите телефон, email или Telegram"), comment: z.string().trim().max(3000).optional(), consentGiven: z.literal(true), source: z.string().trim().max(100).optional() });

export type LeadInput = z.infer<typeof leadSchema>;

export function validateLeadPayload(payload: unknown) {
  const result = leadSchema.safeParse(payload);
  if (!result.success) return { ok: false as const, error: result.error.flatten() };
  if (result.data.type === LeadType.VEHICLE_CALCULATION && !result.data.vehicleId) return { ok: false as const, error: { formErrors: ["Для расчёта нужен автомобиль"], fieldErrors: {} } };
  return { ok: true as const, data: result.data };
}
