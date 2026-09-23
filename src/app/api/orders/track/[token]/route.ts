import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp, tooManyRequests } from "@/lib/rate-limit";
import { serializeTrackingOrder } from "@/lib/tracking-contract";
import { internalApiError } from "@/lib/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const limit = rateLimit(`tracking:${requestIp(request)}`, 10, 60 * 1000); if (!limit.allowed) return tooManyRequests(limit.retryAfter);
  try {
    const order = await prisma.order.findUnique({ where: { trackingToken: (await params).token, trackingEnabled: true }, include: { vehicle: { include: { media: { where: { isPublic: true, type: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } } }, timeline: { where: { isPublic: true }, orderBy: { createdAt: "asc" }, select: { id: true, createdAt: true, title: true, description: true, type: true } } } });
    if (!order) return Response.json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Заказ не найден" } }, { status: 404 });
    return Response.json({ success: true, data: serializeTrackingOrder(order) });
  } catch (error) { return internalApiError("tracking_lookup_failed", error); }
}
