"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

const navigation = [
  ["Opportunity", "#opportunity"],
  ["Development", "#development"],
  ["How it works", "#how-it-works"],
  ["Investment", "#terms"],
  ["Risk & governance", "#risks"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="topline">
        <span>Collective Investment Scheme registered with SECZ</span>
        <span>SECZ101159S <i aria-hidden="true">•</i> Zimbabwe</span>
      </div>
      <header className="site-header">
        <Link className="brand brand-logo" href="#home" aria-label="Mutirikwi REIT home">
          <span className="logo-crop">
            <Image src="/assets/mutirikwi-reit-logo.png" alt="" width={1080} height={662} priority />
          </span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span />
        </button>
        <nav id="primary-nav" className={`primary-nav${open ? " open" : ""}`} aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link className="nav-cta" href="#enquire" onClick={() => setOpen(false)}>Request the pack <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
    </>
  );
}

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function InvestmentCalculator() {
  const [amount, setAmount] = useState("5000");
  const value = Math.max(0, Number(amount) || 0);

  return (
    <div className="calculator">
      <div className="calc-top"><span>ILLUSTRATIVE CALCULATOR</span><span className="calc-icon" aria-hidden="true">⌗</span></div>
      <label htmlFor="amount">Intended investment amount</label>
      <div className="amount-input"><span>US$</span><input id="amount" type="number" min="100" step="100" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-describedby="minimum-note" /></div>
      <p className="input-note" id="minimum-note">Minimum investment: US$100</p>
      <div className="calc-results" aria-live="polite">
        <div><span>ILLUSTRATIVE UNITS</span><strong>{money.format(value / 0.1)}</strong></div>
        <div><span>ANNUAL DISTRIBUTION <small>at 10% target</small></span><strong>US${money.format(value * 0.1)}</strong></div>
        <div><span>QUARTERLY DISTRIBUTION <small>illustrative</small></span><strong>US${money.format(value * 0.1 / 4)}</strong></div>
      </div>
      <Link href="#enquire" className="button button-red calc-cta">Start an enquiry <span>↗</span></Link>
      <small className="calc-legal">Indicative calculation from stated brochure terms only. No offer, advice, ownership confirmation or guarantee.</small>
    </div>
  );
}

export function EnquiryForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = `${data.get("firstName")} ${data.get("lastName")}`.trim();
    const subject = encodeURIComponent(`Mutirikwi REIT enquiry from ${name}`);
    const body = encodeURIComponent([
      "Please contact me about the Mutirikwi REIT Masvingo Flats Project.",
      "",
      `Name: ${name}`,
      `Email: ${data.get("email")}`,
      `Phone / WhatsApp: ${data.get("phone") || "Not provided"}`,
      `Country: ${data.get("country") || "Not provided"}`,
      `Investor type: ${data.get("investorType") || "Not provided"}`,
      `Intended investment range: ${data.get("investment") || "Not provided"}`,
      `Investment timeline: ${data.get("timeline") || "Not provided"}`,
      `Preferred contact method: ${data.get("preferredContact") || "Not provided"}`,
    ].join("\n"));
    setStatus("Your email app will open with your enquiry addressed to the Fund Manager. Send the email there to complete your request.");
    window.location.href = `mailto:info@redwood.co.zw?subject=${subject}&body=${body}`;
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <div className="form-heading"><span>INVESTOR ENQUIRY</span><span className="form-step">01 / 01</span></div>
      <div className="form-grid">
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
        <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
        <label>Phone / WhatsApp<input type="tel" name="phone" autoComplete="tel" /></label>
        <label>Country<input name="country" autoComplete="country-name" /></label>
        <label>Investor type<select name="investorType" defaultValue=""><option value="">Select type</option><option>Individual</option><option>Diaspora</option><option>Corporate</option><option>Pension fund</option><option>Insurance</option><option>Bank</option><option>Other</option></select></label>
        <label>Approximate intended investment<select name="investment" defaultValue=""><option value="">Select range</option><option>US$100–999</option><option>US$1,000–4,999</option><option>US$5,000–9,999</option><option>US$10,000–49,999</option><option>US$50,000–99,999</option><option>US$100,000+</option><option>Still exploring</option></select></label>
        <label>Investment timeline<select name="timeline" defaultValue=""><option value="">Select timeline</option><option>Immediately</option><option>Within 30 days</option><option>1–3 months</option><option>3–6 months</option><option>Researching</option></select></label>
        <label className="full">Preferred contact method<select name="preferredContact" defaultValue=""><option value="">Select preference</option><option>Email</option><option>Phone</option><option>WhatsApp</option></select></label>
        <label className="consent full"><input type="checkbox" name="consent" required /><span>I agree to be contacted about this enquiry. See the <a href="#disclaimer">information notice</a>.</span></label>
      </div>
      <button className="button button-red submit-button" type="submit">Request the investment pack <span>↗</span></button>
      <p className="form-note">Submitting an enquiry does not create an investment or reserve units.</p>
      <div className="form-status" role="status" aria-live="polite">{status}</div>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer id="disclaimer">
      <div className="wrap footer-top">
        <Link className="brand brand-logo brand-footer" href="#home" aria-label="Mutirikwi REIT home">
          <span className="logo-crop"><Image src="/assets/mutirikwi-reit-logo.png" alt="" width={1080} height={662} /></span>
        </Link>
        <p>Building a path to more affordable homes<br />in Zimbabwe.</p>
        <Link className="footer-up" href="#home">Back to top ↑</Link>
      </div>
      <div className="wrap footer-bottom">
        <p>For discussion purposes only. This website does not constitute an offer or investment advice. Yield and IRR are targets, not guarantees. Project unit counts, areas and timelines remain subject to tender award and statutory approvals. Renders are artist&apos;s impressions. Please consult the official offer documents and seek independent advice. Enquiry details are placed in a draft email on your device; this website does not store them.</p>
        <div className="footer-meta"><span>© 2026 Mutirikwi REIT</span><span>SECZ Registration SECZ101159S</span><a href="/assets/Masvingo_Flats_Project_Brochure_Abridged.pdf" download>Download brochure ↓</a></div>
      </div>
    </footer>
  );
}
