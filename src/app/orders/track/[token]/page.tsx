import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отслеживание заказа",
  robots: { index: false, follow: false },
};

type Tracking = { orderNumber: string; status: string; createdAt: string; pricing: { vehiclePrice: number; currency: string; currencyRate: number; vehiclePriceRub: number | null; shippingCost: number; customsCost: number; utilisationFee: number; brokerageCost: number; otherCosts: number; commission: number; totalCost: number } | null; vehicle: { make: string; model: string; year: number; photo: string | null } | null; timeline: { id: string; createdAt: string; title: string; description: string | null }[] };

async function getTracking(token: string): Promise<Tracking | null> { const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/orders/track/${encodeURIComponent(token)}`, { cache: "no-store" }); if (!response.ok) return null; const json = await response.json(); return json.data ?? null; }

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const data = await getTracking((await params).token);
  if (!data) return <main className="tracking-shell"><div className="tracking-card"><p className="eyebrow">ЗАКАЗАВТО / TRACKING</p><h1>Заказ<br /><em>не найден.</em></h1><p>Проверьте ссылку отслеживания или обратитесь к менеджеру.</p><Link className="button button-red" href="/">На главную</Link></div></main>;
  const money = (value: number | null) => value === null ? "—" : `${Number(value).toLocaleString("ru-RU")} ₽`;
  const statusLabels: Record<string, string> = { NEW: "Новый", CONTRACT_SIGNED: "Договор подписан", PREPAYMENT_PAID: "Предоплата внесена", SEARCHING: "Поиск автомобиля", FOUND: "Автомобиль найден", PURCHASED: "Автомобиль выкуплен", IN_TRANSIT: "В пути", ARRIVED: "Прибыл", CUSTOMS: "Таможенное оформление", DELIVERING: "Доставка по России", COMPLETED: "Заказ завершён", CANCELLED: "Заказ отменён" };
  return <main className="tracking-shell"><div className="tracking-card"><p className="eyebrow">ЗАКАЗАВТО / ОТСЛЕЖИВАНИЕ</p><h1>Заказ <em>{data.orderNumber}</em></h1><div className="tracking-status">{statusLabels[data.status] ?? data.status.replaceAll("_", " ")}</div>{data.vehicle && <div className="tracking-vehicle">{data.vehicle.photo && <Image src={data.vehicle.photo} alt={`${data.vehicle.make} ${data.vehicle.model}`} width={130} height={90} />}<div><span>АВТОМОБИЛЬ</span><h2>{data.vehicle.make} {data.vehicle.model}</h2><p>{data.vehicle.year}</p></div></div>}{data.pricing && <section className="tracking-pricing"><span className="eyebrow">СОГЛАСОВАННЫЙ РАСЧЁТ</span><div><span>Автомобиль по курсу</span><b>{money(data.pricing.vehiclePriceRub)}</b></div><div><span>Доставка</span><b>{money(data.pricing.shippingCost)}</b></div><div><span>Таможня и сборы</span><b>{money(data.pricing.customsCost + data.pricing.utilisationFee)}</b></div><div><span>Брокер и прочее</span><b>{money(data.pricing.brokerageCost + data.pricing.otherCosts)}</b></div><div className="tracking-total"><span>Итого под ключ</span><b>{money(data.pricing.totalCost)}</b></div></section>}<div className="tracking-timeline">{data.timeline.length ? data.timeline.map((item) => <div className="tracking-event" key={item.id}><span /><div><time>{new Date(item.createdAt).toLocaleDateString("ru-RU")}</time><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></div>) : <p>События по заказу пока не добавлены.</p>}</div></div></main>;
}
