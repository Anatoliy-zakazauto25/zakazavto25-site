"use client";

import { useEffect, useState } from "react";
import { authHeaders, clientApi } from "@/lib/client-api";

type Lead = { id: string; createdAt: string; type: string; name: string; phone: string | null; email: string | null; telegram: string | null; comment: string | null; consentGiven: boolean; vehicle: { make: string; model: string; year: number } | null };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]); const [loading, setLoading] = useState(true); const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [message, setMessage] = useState("");
  async function load() { const { data, error } = await clientApi<{ data: Lead[] }>("/api/admin/leads", { headers: authHeaders(token) }); setLeads(data?.data ?? []); if (error) setMessage(error); setLoading(false); }
  // The token is read once on the client; the page cannot render protected data on the server.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);
  async function convert(leadId: string) { const { response, data, error } = await clientApi<{ data: { trackingUrl: string } }>("/api/admin/leads/convert", { method: "POST", headers: authHeaders(token, true), body: JSON.stringify({ leadId }) }); setMessage(response.ok && data?.data?.trackingUrl ? `Заказ создан. Ссылка: ${data.data.trackingUrl}` : error ?? "Не удалось создать заказ"); }
  return <main className="admin-shell"><header className="admin-top"><div><p className="eyebrow">АДМИН / ВХОДЯЩИЕ</p><h1>Заявки</h1></div><span className="lead-count">{leads.length} всего</span></header><section className="leads-content">{message && <p className="admin-message">{message}</p>}{loading ? <p className="admin-empty">Загружаем заявки...</p> : leads.length === 0 ? <p className="admin-empty">Новых заявок пока нет.</p> : <div className="leads-list">{leads.map((lead) => <article className="lead-admin-card" key={lead.id}><div className="lead-admin-top"><span className="lead-type">{lead.type === "VEHICLE_CALCULATION" ? "РАСЧЁТ" : "ПОДБОР"}</span><time>{new Date(lead.createdAt).toLocaleString("ru-RU")}</time></div><h2>{lead.name}</h2><div className="lead-contacts">{lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}{lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}{lead.telegram && <span>{lead.telegram}</span>}</div>{lead.vehicle && <p className="lead-vehicle">Автомобиль: <strong>{lead.vehicle.make} {lead.vehicle.model}, {lead.vehicle.year}</strong></p>}{lead.comment && <p className="lead-comment">{lead.comment}</p>}<small>Согласие на обработку ПДн: {lead.consentGiven ? "получено" : "нет"}</small><button className="button button-red lead-convert" onClick={() => void convert(lead.id)}>Создать заказ и tracking</button></article>)}</div>}</section></main>;
}
