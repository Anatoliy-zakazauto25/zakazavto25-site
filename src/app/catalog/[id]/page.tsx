import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVehicle, getPublicVehicles } from "@/lib/public-vehicles";
import { LeadForm } from "@/components/features/lead-form";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteTopbar } from "@/components/layout/site-topbar";
import type { Metadata } from "next";
import Image from "next/image";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateStaticParams() {
  const vehicles = await getPublicVehicles();
  return vehicles.map((vehicle) => ({ id: vehicle.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);
  if (!vehicle) return { title: "Автомобиль не найден" };
  const description = vehicle.description ?? `${vehicle.name}, ${vehicle.year}. Пробег ${vehicle.mileage}. Подбор и доставка автомобиля из Азии под ключ.`;
  return { title: `${vehicle.name} ${vehicle.year}`, description, alternates: { canonical: `/catalog/${vehicle.slug}` }, openGraph: { type: "website", title: `${vehicle.name} ${vehicle.year} | ЗаказАвто25`, description, url: `${siteUrl}/catalog/${vehicle.slug}`, images: vehicle.images.slice(0, 1).map((url) => ({ url, alt: vehicle.name })) }, twitter: { card: "summary_large_image", title: `${vehicle.name} ${vehicle.year}`, description, images: vehicle.images.slice(0, 1) } };
}

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);
  if (!vehicle) notFound();
  const structuredData = { "@context": "https://schema.org", "@type": "Product", name: vehicle.name, description: vehicle.description ?? `${vehicle.name}, ${vehicle.year}`, image: vehicle.images.map((image) => image.startsWith("http") ? image : `${siteUrl}${image}`), brand: { "@type": "Brand", name: vehicle.name.split(" ")[0] }, model: vehicle.name.split(" ").slice(1).join(" "), category: "Автомобили", offers: vehicle.publicPrice ? { "@type": "Offer", priceCurrency: "RUB", price: vehicle.publicPrice, availability: "https://schema.org/InStock", url: `${siteUrl}/catalog/${vehicle.slug}` } : undefined };
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="vehicle-detail">
        <Link className="back-link" href="/catalog">
          ← Вернуться в витрину
        </Link>
        <div className="vehicle-detail-grid">
          <div className="detail-gallery">
            <div className="detail-gallery-grid">{vehicle.images.map((image) => <Image key={image} src={image} alt={vehicle.name} width={1000} height={700} sizes="(max-width: 900px) 50vw, 30vw" />)}</div>
            <span>{vehicle.images.length} фото / материалы автомобиля</span>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {vehicle.country} · {vehicle.status}
            </p>
            <h1>
              {vehicle.name}
              <br />
              <em>{vehicle.year}</em>
            </h1>
            <p className="detail-description">
              {vehicle.description ?? "Автомобиль проверяется и сопровождается командой ЗаказАвто25. Запросите актуальные фото, документы и подробный расчёт под ключ."}
            </p>
            <div className="detail-price">
              <small>Итоговая стоимость, пример</small>
              <b>{vehicle.price}</b>
            </div>
            <div className="detail-specs">
              <div>
                <span>Пробег</span>
                <b>{vehicle.mileage}</b>
              </div>
              <div>
                <span>Двигатель</span>
                  <b>{vehicle.engine}</b>
              </div>
              <div>
                <span>Привод</span>
                  <b>{vehicle.drive}</b>
              </div>
              <div>
                <span>Статус</span>
                <b>{vehicle.status}</b>
              </div>
            </div>
            <a className="button button-red" href="#detail-lead">
              Рассчитать этот автомобиль
            </a>
          </div>
        </div>
        <section className="detail-inspection">
          <div>
            <p className="eyebrow">ПРОВЕРКА</p>
            <h2>
              Состояние
              <br />
              <em>без догадок.</em>
            </h2>
          </div>
          <div className="detail-check-list">
            {[
              ["Кузов и ЛКП", vehicle.inspection?.bodyCondition],
              ["Двигатель и коробка", vehicle.inspection?.engineCondition],
              ["История и пробег", vehicle.inspection?.mileageVerified ? "Пробег подтверждён" : undefined],
              ["Документы", vehicle.inspection?.documentsVerified ? "Проверены" : undefined],
            ].map(([item, result]) => (
              <div key={item}>
                <span>{result ? "✓" : "·"}</span>
                {item}
                <small>{result ? String(result).replaceAll("_", " ") : "Данные появятся после проверки"}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="detail-lead" id="detail-lead">
          <LeadForm compact vehicleId={vehicle.id} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
