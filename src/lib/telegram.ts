import { LeadType } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";

export type LeadNotification = { id: string; type: LeadType; vehicleId?: string; source?: string };

export function formatLeadNotification(lead: LeadNotification, adminUrl: string) {
  const type = lead.type === LeadType.VEHICLE_CALCULATION ? "Расчёт автомобиля" : "Подбор автомобиля";
  return [`✅ Новая заявка #${lead.id}`, `Тип: ${type}`, lead.vehicleId ? `ID автомобиля: ${lead.vehicleId}` : null, `Источник: ${lead.source ?? "website"}`, `🔗 Открыть в админке: ${adminUrl}/admin/leads`].filter(Boolean).join("\n");
}

export async function notifyNewLead(lead: LeadNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim(); const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  const text = formatLeadNotification(lead, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 5_000);
  try { const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }), signal: controller.signal }); if (!response.ok) logger.warn("Telegram notification failed", { leadId: lead.id, status: response.status }); return response.ok; } catch (error) { logger.error("Telegram notification error", { leadId: lead.id, error: error instanceof Error ? error.message : "unknown" }); return false; } finally { clearTimeout(timeout); }
}
