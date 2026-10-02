import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./components";

const policyLinks = [
  ["Privacy policy", "/privacy"],
  ["Terms of use", "/terms"],
  ["Cookie policy", "/cookies"],
] as const;

export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <div className="wrap legal-wrap">
          <header className="legal-heading">
            <p className="eyebrow"><span /> WEBSITE POLICIES</p>
            <h1>{title}</h1>
            <p className="legal-summary">{summary}</p>
            <p className="legal-updated">Last updated 2 October 2026</p>
          </header>
          <nav className="legal-policy-nav" aria-label="Website policies">
            {policyLinks.map(([label, href]) => (
              <Link href={href} key={href}>{label}<span aria-hidden="true">↗</span></Link>
            ))}
          </nav>
          <article className="legal-copy">{children}</article>
          <p className="legal-review-note">These website notices are a practical summary, not a substitute for legal advice or the official Mutirikwi REIT offer documents. Please contact the Fund Manager if you need clarification.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
