import Link from "next/link";
import { LeadForm } from "@/components/features/lead-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";

export default function RequestPage() {
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main className="request-page">
        <div className="request-intro">
          <Link className="back-link" href="/">
            ← Вернуться на главную
          </Link>
          <p className="eyebrow">ЗАЯВКА НА ПОДБОР</p>
          <h1>
            Подберём автомобиль
            <br />
            <em>под вашу задачу.</em>
          </h1>
          <p>
            Оставьте контакты. Обсудим бюджет, страны и подходящие варианты.
          </p>
        </div>
        <div className="request-form-wrap">
          <LeadForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
