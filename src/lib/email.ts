import nodemailer from "nodemailer";
import type { LeadType } from "@/generated/prisma/client";
import { writeFile, readFile, access } from "fs/promises";
import { join } from "path";

type EmailNotification = {
  id: string;
  type: LeadType;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  comment?: string | null;
  vehicleId?: string;
  source?: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: false,
  debug: false,
});

// Verify SMTP connection on first load
void transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection verification failed:", error);
  } else {
    console.log("SMTP server is ready to take messages:", success);
  }
});

const LEADS_FILE = join(process.cwd(), "leads.json");

async function saveLeadToFile(lead: EmailNotification): Promise<void> {
  try {
    let leads: Array<EmailNotification & { savedAt: string }> = [];
    try {
      await access(LEADS_FILE);
      const data = await readFile(LEADS_FILE, "utf-8");
      leads = JSON.parse(data || "[]");
    } catch {
      // file does not exist yet
    }
    leads.push({ ...lead, savedAt: new Date().toISOString() });
    await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
    console.log(`Lead #${lead.id} saved to ${LEADS_FILE}`);
  } catch (error) {
    console.error("Failed to save lead to file:", error);
  }
}

function getLeadTypeLabel(type: LeadType): string {
  const labels: Record<string, string> = {
    VEHICLE_REQUEST: "Заказ автомобиля",
    VEHICLE_CALCULATION: "Расчёт стоимости",
    CALLBACK_REQUEST: "Обратный звонок",
    CONSULTATION_REQUEST: "Консультация",
    INSPECTION_REQUEST: "Проверка автомобиля",
  };
  return labels[type] || type;
}

function formatLeadEmail(lead: EmailNotification): string {
  const type = getLeadTypeLabel(lead.type);
  const lines = [
    `<h2>Новая заявка #${lead.id}</h2>`,
    `<p><strong>Тип:</strong> ${type}</p>`,
  ];

  if (lead.name) lines.push(`<p><strong>Имя:</strong> ${lead.name}</p>`);
  if (lead.phone) lines.push(`<p><strong>Телефон:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>`);
  if (lead.email) lines.push(`<p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>`);
  if (lead.telegram) lines.push(`<p><strong>Telegram:</strong> ${lead.telegram}</p>`);
  if (lead.comment) lines.push(`<p><strong>Комментарий:</strong> ${lead.comment}</p>`);
  if (lead.vehicleId) lines.push(`<p><strong>ID автомобиля:</strong> ${lead.vehicleId}</p>`);

  lines.push(`<p><strong>Источник:</strong> ${lead.source ?? "website"}</p>`);
  lines.push(`<hr/>`);
  lines.push(`<p style="color: #666; font-size: 12px;">Заявка получена ${new Date().toLocaleString("ru-RU")}</p>`);

  return lines.join("\n");
}

export async function notifyNewLeadByEmail(lead: EmailNotification): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.EMAIL_TO) {
    console.warn("Email notification skipped: SMTP credentials or recipient not configured");
    await saveLeadToFile(lead);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ЗаказАвто25" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `Новая заявка #${lead.id} — ${getLeadTypeLabel(lead.type)}`,
      html: formatLeadEmail(lead),
    });
    console.log(`Email notification sent for lead #${lead.id}`);
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Fallback: save lead locally so no request is lost
    await saveLeadToFile(lead);
  }
}
