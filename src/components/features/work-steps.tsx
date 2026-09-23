"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorkStep } from "@/types/components";

export function WorkSteps({ steps, showCTA = false }: { steps: WorkStep[]; showCTA?: boolean }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotCount = Math.min(6, steps.length);
  const activeDot = Math.min(active, dotCount - 1);

  const scrollTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActive(index);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const card = track.children[0] as HTMLElement | undefined;
      if (!card) return;
      const cardWidth = card.offsetWidth + 20; // includes gap
      const index = Math.round(track.scrollLeft / cardWidth);
      setActive(Math.min(Math.max(index, 0), steps.length - 1));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [steps.length]);

  return (
    <section className="section work-steps-section" id="steps">
      <div className="section-kicker"><span>ЭТАПЫ РАБОТЫ</span></div>
      <div className="process-heading"><h2>Понятный путь<br /><em>автомобиля.</em></h2></div>
      <div className="work-steps-carousel">
        <button
          type="button"
          className="work-steps-arrow work-steps-arrow-left"
          aria-label="Назад"
          onClick={() => scrollTo(active === 0 ? steps.length - 1 : active - 1)}
        >
          ←
        </button>
        <div className="work-steps-track" ref={trackRef}>
          {steps.map((step, index) => (
            <article className={`work-step ${index === active ? "is-active" : ""}`} key={step.number}>
              <span className="work-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="work-steps-arrow work-steps-arrow-right"
          aria-label="Вперёд"
          onClick={() => scrollTo(active >= steps.length - 1 ? 0 : active + 1)}
        >
          →
        </button>
        <div className="work-steps-dots">
          {steps.slice(0, dotCount).map((step, index) => (
            <button
              key={step.number}
              type="button"
              aria-label={`Перейти к этапу ${step.number}`}
              className={index === activeDot ? "active" : ""}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
      {showCTA && (
        <div className="section-cta work-steps-cta">
          <Link className="button button-red" href="/request">
            Заказать Авто
          </Link>
        </div>
      )}
    </section>
  );
}
