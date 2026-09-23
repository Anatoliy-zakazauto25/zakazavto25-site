"use client";

import { useState } from "react";
import Link from "next/link";
import type { FAQItem } from "@/types/components";

export function FAQAccordion({ items, showCTA = false }: { items: FAQItem[]; showCTA?: boolean }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="section faq-section" id="faq">
      <div className="section-kicker"><span>ВОПРОСЫ</span></div>
      <div className="split-heading"><h2>Всё, что<br /><em>важно знать.</em></h2><p>Если не нашли ответ, менеджер разберет вашу ситуацию лично.</p></div>
      <div className="faq-list">
        {items.map((item, index) => {
          const isOpen = index === openIndex;
          const panelId = `faq-panel-${index}`;
          return <div className={`faq-item${isOpen ? " is-open" : ""}`} key={item.question}>
            <button className="faq-question" type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenIndex(isOpen ? -1 : index)}>
              <span>{item.question}</span><b aria-hidden="true">{isOpen ? "−" : "+"}</b>
            </button>
            <div className="faq-answer" id={panelId} hidden={!isOpen}>
              {Array.isArray(item.answer) ? <ul>{item.answer.map((answer) => <li key={answer}>{answer}</li>)}</ul> : <p>{item.answer}</p>}
            </div>
          </div>;
        })}
      </div>
      {showCTA && <div className="section-cta"><Link className="button button-red" href="/request">Оформить заявку прямо сейчас</Link></div>}
    </section>
  );
}
