import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";

export default function PrivacyPage() {
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main className="inner-page privacy-page">
        <section className="inner-hero">
          <p className="eyebrow">ДОКУМЕНТЫ</p>
          <h1>Политика<br /><em>конфиденциальности.</em></h1>
          <p>Информация о порядке обработки персональных данных на сайте ЗаказАвто25.</p>
        </section>
        <section className="privacy-content">
          <p className="eyebrow">АКТУАЛЬНО НА 27 АВГУСТА 2026 ГОДА</p>
          <h2>Общие положения</h2>
          <p>Оставляя заявку на сайте, пользователь предоставляет данные добровольно для связи по вопросу подбора и доставки автомобиля. Мы используем их только для обработки обращения и не публикуем без согласия пользователя.</p>
          <h2>Контакты оператора</h2>
          <p>По вопросам обработки персональных данных можно обратиться по телефону <a href="tel:+79241310410">+7 924 131 04 10</a> или через <a href="https://t.me/zakazauto25" target="_blank" rel="noreferrer">Telegram</a>.</p>
          <p className="privacy-note">Финальная редакция документа подлежит юридической проверке перед публикацией.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
