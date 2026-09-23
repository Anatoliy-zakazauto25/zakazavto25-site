import { prisma } from "@/lib/prisma";
import { configHealth } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "error" = "ok";
  try { await prisma.$queryRaw`SELECT 1`; } catch { database = "error"; }
  const config = configHealth(); const healthy = database === "ok" && config.databaseConfigured && config.jwtSecretConfigured;
  return Response.json({ status: healthy ? "ok" : "degraded", service: "zakazavto", database, config, uptimeSeconds: Math.round(process.uptime()), responseTimeMs: Date.now() - startedAt, timestamp: new Date().toISOString() }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
