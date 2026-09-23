import Link from "next/link";
import type { ManagerCategory } from "@/types/components";

export function ManagersGrid({ categories, showCTA = false }: { categories: ManagerCategory[]; showCTA?: boolean }) {
  return <section className="section managers-section" id="contacts">
    <div className="section-kicker"><span>КОНТАКТЫ</span><span>Выберите направление</span></div>
    <div className="split-heading"><h2>Задача одна.<br /><em>Направления разные.</em></h2><p>Оставьте заявку, и мы подключим нужного специалиста.</p></div>
    <div className="managers-grid">{categories.map((category) => <article className="managers-category" key={category.title}><h3><span aria-hidden="true">{category.emoji}</span> {category.title}</h3>{category.managers.length ? category.managers.map((manager) => <div className="manager-item" key={`${manager.name}-${manager.phone}`}><span>{manager.name}</span><a href={`tel:${manager.phone.replace(/[^+\d]/g, "")}`}>{manager.phone}</a><a className="manager-messenger" href={manager.messengerUrl} target="_blank" rel="noreferrer" aria-label={`Написать менеджеру ${manager.name}`}></a></div>) : null}</article>)}</div>
    {showCTA && <div className="section-cta"><Link className="button button-red" href="/request">Оставить заявку</Link></div>}
  </section>;
}
