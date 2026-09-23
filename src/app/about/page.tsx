import Image from "next/image";
import { LeadForm } from "@/components/features/lead-form";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteTopbar } from "@/components/layout/site-topbar";

export default function AboutPage() {
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main className="inner-page about-page">
        <section className="inner-hero">
          <h1>
            Настоящие люди.
            <br />
            <em>Понятный процесс.</em>
          </h1>
          <p>
            ЗаказАвто25 — команда специалистов во Владивостоке, которая помогает привозить
            автомобили из Японии, Кореи и Китая.
          </p>
        </section>
        <section className="about-facts">
          <div>
            <b>5</b>
            <span>лет работы</span>
          </div>
          <div>
            <b>900+</b>
            <span>автомобилей</span>
          </div>
          <div>
            <b>15–25</b>
            <span>авто в месяц</span>
          </div>
          <div>
            <b>3</b>
            <span>страны-источника</span>
          </div>
        </section>
        <section className="about-story">
          <div className="about-photo">
            <Image
              src="/Ponoparev.jpg"
              alt="Пономарев Анатолий — директор ЗаказАвто25"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h2>
              Выбираете
              <br />
              <em>вы.</em> Контролируем
              <br />
              <em>мы.</em>
            </h2>
            <p>
              Мы не заменяем выбор клиента своими обещаниями. Помогаем разобраться в
              вариантах, проверяем автомобиль и остаёмся рядом на протяжении всего пути.
            </p>
            <p>
              Пономорев Анатолий — директор компании. За ним — команда специалистов и партнёры
              в странах, откуда приезжают автомобили.
            </p>
          </div>
        </section>
        <section className="office-section">
          <div>
            <h2>
              Владивосток
              <br />
              <em>— точка контроля.</em>
            </h2>
            <p>Офис компании находится по адресу:</p>
            <b>
              г. Владивосток,
              <br />
              ул. 13-я Рабочая, 12с3, офис 1
            </b>
          </div>
          <a
            className="office-map-link"
            href="https://2gis.ru/vladivostok/firm/70000001094406663?m=131.93385%2C43.119822%2F16"
            target="_blank"
            rel="noreferrer"
            aria-label="Открыть офис на карте 2ГИС"
          >
            <Image
              src="/Снимок экрана 2026-09-19 182618.png"
              alt="Офис ЗаказАвто25 на карте"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </a>
        </section>
        <section className="about-lead">
          <LeadForm compact />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
