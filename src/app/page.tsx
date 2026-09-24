import Link from "next/link";
import { externalReviews, faqItems, officeHours, reviews, socialLinks, workSteps } from "@/lib/mock-data";
import { LeadForm } from "@/components/features/lead-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import Image from "next/image";
import { SiteTopbar } from "@/components/layout/site-topbar";
import { SocialProof } from "@/components/features/social-proof";

import { WorkSteps } from "@/components/features/work-steps";
import { FAQAccordion } from "@/components/features/faq-accordion";
import { MazdaPhotoBanner } from "@/components/features/mazda-photo-banner";
import { TrustBlock } from "@/components/features/trust-block";

export default function Home() {
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Авто из Японии, Кореи и Китая</p>
            <h1>
              Вы - выбираете
              <br />
              <em>автомобиль.</em>
              <br />
              Мы - делаем
              <br />
              <em>остальное.</em>
            </h1>
            <div className="hero-actions">
              <Link className="button button-red hero-button" href="/request">
                Заказать Авто
              </Link>
            </div>
            <SocialProof links={socialLinks} />
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <Image src="/team-new.jpg.png" alt="Команда ЗаказАвто25" fill sizes="(max-width: 900px) 100vw, 50vw" priority />
            </div>
          </div>
          <div className="hero-stats">
            <div>
              <b>5</b>
              <span>
                лет
                <br />
                работы
              </span>
            </div>
            <div>
              <b>
                900<span>+</span>
              </b>
              <span>
                автомобилей
                <br />
                привезено
              </span>
            </div>
            <div>
              <b>15–25</b>
              <span>
                авто
                <br />в месяц
              </span>
            </div>
          </div>
        </section>
      <section className="trust-strip">
          <p>СЕРВИС, КОТОРЫЙ НЕ ИСЧЕЗАЕТ ПОСЛЕ ОПЛАТЫ</p>
          <div>
            Проверка <i>→</i> Отчёт <i>→</i> Логистика <i>→</i> Контроль
          </div>
      </section>
        <MazdaPhotoBanner />
        <section className="section advantages-section" id="advantages">
        <div className="section-kicker">
          <span>Почему выбирают автомобили из Азии</span>
        </div>
        <div className="split-heading">
          <h2>
            Больше выбора.
            <br />
            <em>Меньше риска.</em>
          </h2>
        </div>
          <div className="advantages-grid">
            {[
              ["1", "Автомобили без пробега по РФ", "Автомобиль эксплуатировался за рубежом. Историю обслуживания и фактическое состояние проверяем до покупки."],
              ["2", "Прозрачная история и аукционный лист", "Показываем доступные отчёты, аукционные листы и результаты осмотра, чтобы решение было основано на фактах."],
              ["3", "Выгода до 35% по сравнению с рынком", "Прямой заказ может снизить итоговую стоимость по сравнению с аналогами на рынке РФ. Точная выгода зависит от автомобиля и расчёта."],
              ["4", "Богатые комплектации и большой выбор", "В странах Азии доступны популярные и редкие модели, включая комплектации, которых может не быть на российском рынке."],
              ["5", "Полный контроль под ключ", "Подбор, покупка, доставка, таможенное оформление и выдача автомобиля проходят с сопровождением нашей команды."],
            ].map(([number, title, text]) => (
              <article className="advantage-card" key={number}>
                <h3>{title}</h3>
                <p>{text}</p>
               
              </article>
            ))}
        </div>
      </section>
      <section className="section inspection-section">
           <div className="section-kicker">
             <span className="kicker-white">Как мы показываем состояние</span>
           </div>
           <div className="split-heading">
            <h2>
              Сначала
              <br />
              <em>факты.</em>
            </h2>
            <p>
              Мы не просим верить на слово. Показываем, что проверено, кем проверено и
              какие документы получены.
            </p>
           </div>
           <div className="inspection-grid">
             <div className="inspection-media">
               <div className="inspection-visual">
                 <video src="/Otchet.mp4" autoPlay muted loop playsInline />
               </div>
               <div className="section-cta trust-cta">
                 <Link className="button button-red" href="/request">
                   Заказать Авто
                 </Link>
               </div>
             </div>
            <div className="inspection-list">
              {[
                "Кузов и лакокрасочное покрытие",
                "Двигатель, коробка и ходовая",
                "Пробег и история автомобиля",
                "Документы и доступные проверки",
                "Фото, видео и комментарий специалиста",
              ].map((item) => (
                <div className="inspection-row" key={item}>
                  <span className="checkmark" aria-hidden="true">✓</span>
                  <b>{item}</b>
                 
                </div>
              ))}
              <Link className="text-button" href="/about">
                Как проходит проверка
              </Link>
            </div>
          </div>
      </section>
      <WorkSteps steps={workSteps} showCTA />
        <FAQAccordion items={faqItems} showCTA />
        <section className="section reviews-section" id="reviews">
          <div className="section-kicker">
            <span>ОТЗЫВЫ</span>
            <span>Что говорят клиенты</span>
          </div>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="review-image">
                  <Image src={review.image} alt="" fill sizes="(max-width: 560px) 100vw, 16vw" />
                </div>
                <div className="review-overlay">
                  <div className="review-top">
                    <span className="avatar">{review.initials}</span>
                    <span>
                      <b>{review.name}</b>
                      <small>{review.city}</small>
                    </span>
                    <strong>“</strong>
                  </div>
                  <p>{review.text}</p>
                  <div className="stars">★★★★★</div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <TrustBlock reviews={externalReviews} officeHours={officeHours} />
        <section className="lead-section" id="lead">
          <div className="lead-intro">
            <span className="eyebrow kicker-white kicker-large">СЛЕДУЮЩИЙ ШАГ</span>
            <h2>
              Расскажите,
              <br />
              <em>что ищете.</em>
            </h2>
            <p>
              Мы ответим на вопросы и поможем понять, какой путь подходит именно вам.
            </p>
            <div className="lead-fact">
             
              <p>
                Можно начать с любой точки:
                <br />
                <b>модель, бюджет или просто идея.</b>
              </p>
            </div>
          </div>
          <LeadForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
