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
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") || "").trim();
    const lastName = String(data.get("lastName") || "").trim();
    const tracking = new URLSearchParams(window.location.search);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: data.get("email"),
          phone: data.get("phone"),
          whatsapp: data.get("whatsapp"),
          country: data.get("country"),
          investorType: data.get("investorType"),
          investmentRange: data.get("investment"),
          timeline: data.get("timeline"),
          preferredContact: data.get("preferredContact"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          attribution: {
            utmSource: tracking.get("utm_source"),
            utmMedium: tracking.get("utm_medium"),
            utmCampaign: tracking.get("utm_campaign"),
            utmContent: tracking.get("utm_content"),
            utmTerm: tracking.get("utm_term"),
            landingPage: `${window.location.pathname}${window.location.search}`,
          },
        }),
      });

      if (!response.ok) {
        setStatus(response.status === 429
          ? "We have received several requests from this connection. Please try again in a little while."
          : "We could not submit your enquiry just now. Please check the details and try again.");
        return;
      }

      setSubmittedName(firstName || "Investor");
      form.reset();
    } catch {
      setStatus("We could not connect securely. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedName) {
    return (
      <div className="enquiry-form enquiry-confirmation" role="status" aria-live="polite">
        <span>ENQUIRY RECEIVED</span>
        <h3>Thank you, {submittedName}.</h3>
        <p>Your investment enquiry has been received. A member of the Mutirikwi REIT team will contact you regarding the next steps.</p>
        <p className="form-note">Submitting an enquiry does not create an investment or reserve units.</p>
        <div className="confirmation-actions">
          <a className="button button-red" href="/assets/Masvingo_Flats_Project_Brochure_Abridged.pdf" download>Download brochure <span>↓</span></a>
          <a className="text-link" href="#development">Explore the development <span>↗</span></a>
        </div>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <div className="form-heading"><span>INVESTOR ENQUIRY</span><span className="form-step">01 / 01</span></div>
      <div className="form-grid">
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
        <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
        <label>Phone number<input type="tel" name="phone" autoComplete="tel" /></label>
        <label>WhatsApp number<input type="tel" name="whatsapp" autoComplete="tel" /></label>
        <label>Country<input name="country" autoComplete="country-name" required /></label>
        <label>Investor type<select name="investorType" defaultValue="" required><option value="">Select type</option><option value="INDIVIDUAL">Individual</option><option value="DIASPORA">Diaspora</option><option value="CORPORATE">Corporate</option><option value="PENSION_FUND">Pension fund</option><option value="INSURANCE">Insurance</option><option value="BANK">Bank</option><option value="EMPLOYER">Employer</option><option value="OTHER">Other</option></select></label>
        <label>Approximate intended investment<select name="investment" defaultValue="" required><option value="">Select range</option><option value="RANGE_100_999">US$100–999</option><option value="RANGE_1000_4999">US$1,000–4,999</option><option value="RANGE_5000_9999">US$5,000–9,999</option><option value="RANGE_10000_49999">US$10,000–49,999</option><option value="RANGE_50000_99999">US$50,000–99,999</option><option value="RANGE_100000_PLUS">US$100,000+</option></select></label>
        <label>Investment timeline<select name="timeline" defaultValue="" required><option value="">Select timeline</option><option value="IMMEDIATELY">Immediately</option><option value="WITHIN_30_DAYS">Within 30 days</option><option value="ONE_TO_THREE_MONTHS">1–3 months</option><option value="THREE_TO_SIX_MONTHS">3–6 months</option><option value="RESEARCHING">Researching</option></select></label>
        <label className="full">Preferred contact method<select name="preferredContact" defaultValue="" required><option value="">Select preference</option><option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="WHATSAPP">WhatsApp</option></select></label>
        <label className="form-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className="consent full"><input type="checkbox" name="consent" required /><span>I agree to be contacted about this enquiry. See the <a href="#disclaimer">information notice</a>.</span></label>
      </div>
      <button className="button button-red submit-button" type="submit" disabled={submitting}>{submitting ? "Sending securely…" : "Request the investment pack"} <span>↗</span></button>
      <p className="form-note">Submitting an enquiry does not create an investment or reserve units.</p>
      <div className="form-status" data-state={status ? "error" : "idle"} role="status" aria-live="polite">{status}</div>
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
        <p>For discussion purposes only. This website does not constitute an offer or investment advice. Yield and IRR are targets, not guarantees. Project unit counts, areas and timelines remain subject to tender award and statutory approvals. Renders are artist&apos;s impressions. Please consult the official offer documents and seek independent advice. Enquiry details are stored securely so the REIT team can respond to your request.</p>
        <div className="footer-meta"><span>© 2026 Mutirikwi REIT</span><span>SECZ Registration SECZ101159S</span><a href="/assets/Masvingo_Flats_Project_Brochure_Abridged.pdf" download>Download brochure ↓</a></div>
      </div>
    </footer>
  );
}
