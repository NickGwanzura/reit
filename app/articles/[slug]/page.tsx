import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components";
import { articles } from "../content";

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  const url = `/articles/${article.slug}`;
  return {
    title: `${article.title} | Mutirikwi REIT`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: { title: article.title, description: article.description, url, type: "article", publishedTime: `${article.date}T00:00:00+02:00`, siteName: "Mutirikwi REIT", locale: "en_ZW" },
    twitter: { card: "summary", title: article.title, description: article.description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const url = `https://mutirikwireitzim.com/articles/${article.slug}`;
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.date, dateModified: article.date, author: { "@type": "Organization", name: "Mutirikwi REIT" }, publisher: { "@type": "Organization", name: "Mutirikwi REIT", url: "https://mutirikwireitzim.com" }, mainEntityOfPage: url };
  return <><SiteHeader /><main className="editorial-page"><article className="article-detail"><Link className="article-back" href="/articles">← All guides</Link><p className="editorial-kicker">MUTIRIKWI REIT · INSIGHTS</p><h1>{article.title}</h1><p className="editorial-lede">{article.intro}</p><p className="article-byline">Mutirikwi REIT · {new Date(article.date).toLocaleDateString("en-ZW", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} · {article.readTime}</p><div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}</div><aside className="article-disclaimer">For information only. This article is not an offer or investment advice. The published target returns are not guaranteed. Consult the current official offer documents and seek independent advice.</aside><Link className="article-cta" href="/enquire">Request the fact sheet <span aria-hidden="true">↗</span></Link><nav className="related-articles" aria-label="More guides"><h2>More guides</h2>{articles.filter((item) => item.slug !== article.slug).map((item) => <Link key={item.slug} href={`/articles/${item.slug}`}>{item.title} <span aria-hidden="true">→</span></Link>)}</nav></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /></main><SiteFooter /></>;
}
