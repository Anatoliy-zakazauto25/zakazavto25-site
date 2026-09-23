import { z } from "zod";
import { InspectionCondition, InspectionRecommendation } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const inspectionSchema = z.object({
  inspectionDate: z.string().datetime().optional(), bodyCondition: z.nativeEnum(InspectionCondition).optional(), bodyNotes: z.string().trim().max(2000).nullable().optional(), engineCondition: z.nativeEnum(InspectionCondition).optional(), engineNotes: z.string().trim().max(2000).nullable().optional(), transmissionCondition: z.nativeEnum(InspectionCondition).optional(), transmissionNotes: z.string().trim().max(2000).nullable().optional(), suspensionCondition: z.nativeEnum(InspectionCondition).optional(), suspensionNotes: z.string().trim().max(2000).nullable().optional(), electronicsCondition: z.nativeEnum(InspectionCondition).optional(), electronicsNotes: z.string().trim().max(2000).nullable().optional(), mileageVerified: z.boolean().optional(), actualMileage: z.number().int().nonnegative().nullable().optional(), documentsVerified: z.boolean().optional(), legalCheckVerified: z.boolean().optional(), legalCheckNotes: z.string().trim().max(2000).nullable().optional(), overallCondition: z.nativeEnum(InspectionCondition).optional(), recommendation: z.nativeEnum(InspectionRecommendation).optional(), specialistComment: z.string().trim().min(1).max(5000).optional(), fullReportUrl: z.string().url().nullable().optional(), isPublic: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const inspection = await prisma.vehicleInspection.findUnique({ where: { vehicleId: (await params).id } });
  return Response.json({ success: true, data: inspection });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const vehicleId = (await params).id; const parsed = inspectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Проверьте данные проверки", details: parsed.error.flatten() } }, { status: 422 });
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } }); if (!vehicle) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 });
  const { inspectionDate, ...inspectionFields } = parsed.data;
  const date = inspectionDate ? new Date(inspectionDate) : new Date();
  const data = { ...inspectionFields, inspectedById: token.userId, inspectionDate: date };
  const inspection = await prisma.vehicleInspection.upsert({ where: { vehicleId }, create: { vehicleId, inspectedById: token.userId, inspectionDate: date, specialistComment: inspectionFields.specialistComment ?? "Проверка ещё не завершена", ...inspectionFields }, update: data });
  await audit({ userId: token.userId, action: "UPDATE_INSPECTION", entityType: "Vehicle", entityId: vehicleId, request, metadata: { isPublic: inspection.isPublic } });
  return Response.json({ success: true, data: inspection });
}
