import Image from "next/image";
import type { ExternalReview, OfficeHours } from "@/types/components";

const reviewImages: Partial<Record<ExternalReview["platform"], string>> = {
  "2gis": "/2gis.png",
  yandex: "/yandex-maps.png",
  avito: "/avito.png",
};

export function TrustBlock({ reviews, officeHours }: { reviews: ExternalReview[]; officeHours: OfficeHours }) {
  return <section className="section trust-section">
      <div className="trust-content"><div><p className="eyebrow kicker-white kicker-large">ДОВЕРИЕ</p><h2>Читайте отзывы<br /><em>о нас.</em></h2>{reviews.length > 0 && <div className="external-reviews">{reviews.map((review) => <a key={review.platform} className={`external-review-${review.platform}`} href={review.url} target="_blank" rel="noreferrer" aria-label={review.label}><Image src={reviewImages[review.platform] ?? ""} alt={review.label} width={286} height={94} unoptimized /></a>)}</div>}</div><div className="office-hours"><h3>Владивосток, 13-я Рабочая, 12с3, офис 1</h3><p>{officeHours.weekdays}</p>{officeHours.saturday && <p>{officeHours.saturday}</p>}<p>{officeHours.pickupHours}</p><a className="office-photo" href="https://2gis.ru/vladivostok/firm/70000001094406663?m=131.93385%2C43.119822%2F16" target="_blank" rel="noreferrer" aria-label="Открыть офис на карте 2ГИС"><Image src="/Снимок экрана 2026-09-19 182618.png" alt="Офис ЗаказАвто25 на карте" fill sizes="(max-width: 900px) 100vw, 35vw" /></a></div></div>
  </section>;
}
