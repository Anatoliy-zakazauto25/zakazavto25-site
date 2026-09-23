import { cases } from "@/lib/mock-data";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import Image from "next/image";

export default function CasesPage() {
  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main className="inner-page">
        <section className="inner-hero">
          <p className="eyebrow">ИСТОРИИ КЛИЕНТОВ</p>
          <h1>
            Каждый заказ —<br />
            <em>это история.</em>
          </h1>
          <p>
            Показываем не только результат, но и путь: задачу клиента, выбор автомобиля,
            проверку и доставку.
          </p>
        </section>
        <section className="cases-list">
          {cases.concat(cases).map((item, i) => (
            <article className="case-large" key={`${item.title}-${i}`}>
              <div className="case-large-image">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 560px) 100vw, 50vw" />
                <span>CASE / 0{i + 1}</span>
              </div>
              <div className="case-large-copy">
                <p className="eyebrow">{item.meta}</p>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <div className="case-result">
                  <span>Результат</span>
                  <b>{item.result}</b>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
