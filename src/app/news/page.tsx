import Image from "next/image";
import Link from "next/link";
import { newsItems } from "@/lib/mock-data";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";

export default function NewsPage() {
  return <><SiteTopbar /><SiteHeader /><main className="inner-page">
    <section className="inner-hero news-hero"><p className="eyebrow">автоNews ЗАКАЗАВТО25</p><h1>Новости<br /><em>и полезное.</em></h1></section>
    <section className="section"><div className="news-grid">{newsItems.map((item) => <Link className="news-card" href={`/news/${item.slug}`} key={item.slug}><div className="news-card-image"><Image src={item.image} alt="" fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" /></div><div className="news-card-copy"><small>{item.category}</small><h2>{item.title}</h2><p>{item.excerpt}</p><time dateTime="2026-08-27">{item.date}</time></div></Link>)}</div></section>
  </main><SiteFooter /></>;
}
