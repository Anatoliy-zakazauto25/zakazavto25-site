import { LeadType } from "@/generated/prisma/client";
import { rateLimit, requestIp, tooManyRequests } from "@/lib/rate-limit";
import { validateLeadPayload } from "@/lib/lead-contract";
import { notifyNewLeadByEmail } from "@/lib/email";
import { apiError, internalApiError } from "@/lib/api-error";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const limit = rateLimit(`lead:${requestIp(request)}`, 5, 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const parsed = validateLeadPayload(await request.json().catch(() => null));
  if (!parsed.ok) return apiError("VALIDATION_ERROR", "Проверьте контактные данные и согласие", 422, parsed.error);

  const input = parsed.data;
  const { contact, consentGiven, vehicleId, ...data } = input;

  if (data.type === LeadType.VEHICLE_CALCULATION && !vehicleId) {
    return apiError("VALIDATION_ERROR", "Для расчёта нужен автомобиль", 422);
  }

  const leadId = randomUUID();

  try {
    void notifyNewLeadByEmail({
      id: leadId,
      type: data.type,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      telegram: contact.telegram,
      comment: data.comment ?? undefined,
      vehicleId: vehicleId ?? undefined,
      source: data.source ?? "website",
    });

    return Response.json(
      { success: true, data: { id: leadId, message: "Заявка принята. Мы свяжемся с вами в ближайшее время." } },
      { status: 201 }
    );
  } catch (error) {
    return internalApiError("lead_create_failed", error);
  }
}
