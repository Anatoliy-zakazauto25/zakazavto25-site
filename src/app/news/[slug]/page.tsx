import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsItems } from "@/lib/mock-data";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";

export function generateStaticParams() { return newsItems.map((item) => ({ slug: item.slug })); }

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = newsItems.find((news) => news.slug === slug);
  if (!item) notFound();
  return <><SiteTopbar /><SiteHeader /><main className="inner-page"><article className="news-article"><div className="news-article-image"><Image src={item.image} alt="" fill sizes="(max-width: 900px) 100vw, 850px" priority /></div><div className="news-article-copy"><Link className="back-link" href="/news">← Все новости</Link><p className="eyebrow">{item.category}</p><h1>{item.title}</h1><time className="news-date" dateTime="2026-08-27">{item.date}</time>{item.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<Link className="button button-red" href="/request">Обсудить автомобиль</Link></div></article></main><SiteFooter /></>;
}
