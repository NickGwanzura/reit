import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import { articles } from "./content";

export const metadata: Metadata = {
  title: "Property & REIT Guides | Mutirikwi REIT",
  description: "Read practical guides to REITs, commercial property in Masvingo, and investment risks and target returns in Zimbabwe.",
  alternates: { canonical: "/articles" },
  openGraph: { title: "Property & REIT Guides | Mutirikwi REIT", description: "Practical guides to REITs and commercial property in the Masvingo region.", url: "/articles", type: "website" },
};

export default function ArticlesPage() {
  return <><SiteHeader /><main className="editorial-page"><div className="editorial-wrap"><p className="editorial-kicker">MUTIRIKWI REIT · INSIGHTS</p><h1>Property &amp; REIT <em>guides.</em></h1><p className="editorial-lede">Straightforward background on real estate investment trusts, commercial property in the Masvingo region and the risks investors should understand.</p><div className="article-grid">{articles.map((article) => <article className="article-card" key={article.slug}><p>{article.readTime} · {new Date(article.date).toLocaleDateString("en-ZW", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.description}</p><Link className="article-read" href={`/articles/${article.slug}`}>Read guide <span aria-hidden="true">↗</span></Link></article>)}</div><p className="editorial-note">General information only. These guides are not investment advice or an offer to invest. Review current official offer documents and seek independent advice.</p></div></main><SiteFooter /></>;
}
