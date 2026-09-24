import { logger } from "@/lib/logger";

export function apiError(code: string, message: string, status: number, details?: unknown) {
  return Response.json({ success: false, error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });
}

export function internalApiError(context: string, error: unknown) {
  logger.error(context, { error: error instanceof Error ? error.message : "unknown" });
  return apiError("INTERNAL_ERROR", "Внутренняя ошибка сервера", 500);
}
