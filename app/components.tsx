"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

const navigation = [
  ["Opportunity", "#opportunity"],
  ["Strategy", "#development"],
  ["How it works", "#how-it-works"],
  ["Terms", "#terms"],
  ["Risk & governance", "#risks"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const isHome = usePathname() === "/";

  return (
    <>
      <div className="topline">
        <span>SECZ-Licensed Collective Investment Scheme</span>
        <span>SECZ101159S <i aria-hidden="true">•</i> Zimbabwe</span>
      </div>
      <header className="site-header">
        <Link className="brand brand-logo" href={isHome ? "#home" : "/#home"} aria-label="Mutirikwi REIT home">
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
            <Link href={isHome ? href : `/${href}`} key={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link className="nav-staff-link" href="/admin/login" onClick={() => setOpen(false)}>Admin login</Link>
          <Link className="nav-cta" href="/enquire" onClick={() => setOpen(false)}>Request fact sheet <span aria-hidden="true">↗</span></Link>
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
      <div className="calc-top"><span>ILLUSTRATIVE UNIT ESTIMATE</span><span className="calc-icon" aria-hidden="true">⌗</span></div>
      <label htmlFor="amount">Amount to compare with launch price</label>
      <div className="amount-input"><span>US$</span><input id="amount" type="number" min="100" step="100" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-describedby="minimum-note" /></div>
      <p className="input-note" id="minimum-note">Pre-listing minimum: 1,000 units (US$100)</p>
      <div className="calc-results" aria-live="polite">
        <div><span>ILLUSTRATIVE UNITS AT US$0.10 EACH</span><strong>{money.format(value / 0.1)}</strong></div>
        <div><span>PRE-LISTING MINIMUM</span><strong>1,000 units</strong></div>
      </div>
      <Link href="/enquire" className="button button-red calc-cta">Request the fact sheet <span>↗</span></Link>
      <small className="calc-legal">Illustrative arithmetic only. It is not a subscription, allocation, offer or investment advice.</small>
    </div>
  );
}

export function EnquiryForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [brochureReady, setBrochureReady] = useState(false);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepNames = ["Your details", "Investment profile", "Contact preference"];

  function advanceStep() {
    if (!formRef.current?.reportValidity()) return;
    setStep((current) => Math.min(current + 1, stepNames.length - 1));
    setStatus("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") || "").trim();
    const lastName = String(data.get("lastName") || "").trim();
    const tracking = new URLSearchParams(window.location.search);
    let landingPage = `${window.location.pathname}${window.location.search}`;
    if (!tracking.has("utm_source") && document.referrer) {
      try {
        const referringPage = new URL(document.referrer);
        if (referringPage.origin === window.location.origin) {
          for (const [key, value] of referringPage.searchParams) {
            if (key.startsWith("utm_")) tracking.set(key, value);
            }
          landingPage = `${referringPage.pathname}${referringPage.search}`;
        }
      } catch {
        // Ignore malformed referrers; attribution is optional.
      }
    }

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
            landingPage,
          },
        }),
      });
      const result = await response.json().catch(() => null) as { brochureAccessGranted?: boolean } | null;

      if (!response.ok) {
        setStatus(response.status === 429
          ? "We have received several requests from this connection. Please try again in a little while."
          : "We could not submit your enquiry just now. Please check the details and try again.");
        return;
      }

      setBrochureReady(result?.brochureAccessGranted === true);
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
        {brochureReady
          ? <p className="brochure-ready-note">The October 2026 fact sheet is ready to download.</p>
          : <p className="brochure-ready-note">The fact sheet is being prepared. Please contact the fund team if you need access.</p>}
        <p className="form-note">Submitting an enquiry does not create an investment or reserve units.</p>
        <div className="confirmation-actions">
          {brochureReady && <a className="button button-red" href="/api/brochure">Download fact sheet <span>↓</span></a>}
          <a className="text-link" href="/#development">Explore the investment strategy <span>↗</span></a>
        </div>
      </div>
    );
  }

  return (
    <form className="enquiry-form enquiry-wizard" ref={formRef} onSubmit={handleSubmit}>
      <div className="form-heading"><span>INVESTOR ENQUIRY</span><span className="form-step">0{step + 1} / 03</span></div>
      <ol className="enquiry-progress" aria-label="Enquiry progress">
        {stepNames.map((name, index) => (
          <li className={index === step ? "is-current" : index < step ? "is-complete" : ""} aria-current={index === step ? "step" : undefined} key={name}>
            <span>0{index + 1}</span><span>{name}</span>
          </li>
        ))}
      </ol>

      <fieldset className="step-fields" hidden={step !== 0}>
        <legend>Your contact details</legend>
        <div className="form-grid">
          <label>First name<input name="firstName" autoComplete="given-name" required={step === 0} /></label>
          <label>Last name<input name="lastName" autoComplete="family-name" required={step === 0} /></label>
          <label className="full">Email address<input type="email" name="email" autoComplete="email" required={step === 0} /></label>
          <label>Phone number<input type="tel" name="phone" autoComplete="tel" /></label>
          <label>WhatsApp number<input type="tel" name="whatsapp" autoComplete="tel" /></label>
          <label className="full">Country<input name="country" autoComplete="country-name" required={step === 0} /></label>
        </div>
      </fieldset>

      <fieldset className="step-fields" hidden={step !== 1}>
        <legend>Your investment profile</legend>
        <div className="form-grid">
          <label className="full">Investor type<select name="investorType" defaultValue="" required={step === 1}><option value="">Select type</option><option value="INDIVIDUAL">Individual</option><option value="DIASPORA">Diaspora</option><option value="CORPORATE">Corporate</option><option value="PENSION_FUND">Pension fund</option><option value="INSURANCE">Insurance</option><option value="BANK">Bank</option><option value="EMPLOYER">Employer</option><option value="OTHER">Other</option></select></label>
          <label className="full">Approximate intended investment<select name="investment" defaultValue="" required={step === 1}><option value="">Select range</option><option value="RANGE_100_999">US$100–999</option><option value="RANGE_1000_4999">US$1,000–4,999</option><option value="RANGE_5000_9999">US$5,000–9,999</option><option value="RANGE_10000_49999">US$10,000–49,999</option><option value="RANGE_50000_99999">US$50,000–99,999</option><option value="RANGE_100000_PLUS">US$100,000+</option></select></label>
          <label className="full">Investment timeline<select name="timeline" defaultValue="" required={step === 1}><option value="">Select timeline</option><option value="IMMEDIATELY">Immediately</option><option value="WITHIN_30_DAYS">Within 30 days</option><option value="ONE_TO_THREE_MONTHS">1–3 months</option><option value="THREE_TO_SIX_MONTHS">3–6 months</option><option value="RESEARCHING">Researching</option></select></label>
        </div>
      </fieldset>

      <fieldset className="step-fields" hidden={step !== 2}>
        <legend>How should we contact you?</legend>
        <div className="form-grid">
          <label className="full">Preferred contact method<select name="preferredContact" defaultValue="" required={step === 2}><option value="">Select preference</option><option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="WHATSAPP">WhatsApp</option></select></label>
          <label className="form-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <label className="consent full"><input type="checkbox" name="consent" required={step === 2} /><span>I agree to be contacted about this enquiry. See the <a href="/privacy">privacy policy</a>.</span></label>
        </div>
        <p className="wizard-assurance">Submitting this enquiry does not create an investment or reserve units.</p>
      </fieldset>

      <div className="wizard-actions">
        {step > 0 && <button className="wizard-back" type="button" onClick={() => { setStep((current) => current - 1); setStatus(""); }}>← Back</button>}
        {step < stepNames.length - 1
          ? <button className="button button-red wizard-next" type="button" onClick={advanceStep}>Continue <span>→</span></button>
          : <button className="button button-red wizard-next" type="submit" disabled={submitting}>{submitting ? "Sending securely…" : "Send investor enquiry"} <span>↗</span></button>}
      </div>
      <p className="form-note">No payment details are requested. Your enquiry is for follow-up only.</p>
      <div className="form-status" data-state={status ? "error" : "idle"} role="status" aria-live="polite">{status}</div>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer id="disclaimer">
      <div className="wrap footer-top">
        <Link className="brand brand-logo brand-footer" href="/#home" aria-label="Mutirikwi REIT home">
          <span className="logo-crop"><Image src="/assets/mutirikwi-reit-logo.png" alt="" width={1080} height={662} /></span>
        </Link>
        <p>Unlocking real estate value<br />in the Masvingo region.</p>
        <Link className="footer-up" href="/#home">Back to top ↑</Link>
      </div>
      <div className="wrap footer-bottom">
        <p>For information only. This website does not constitute an offer or investment advice. The 17% property-development IRR and 10% p.a. USD net income yield on NAV are targets, not guarantees. Unit transfers are subject to the pre-listing lock-in and applicable laws. Please consult the official offer documents and seek independent advice. The enquiry form does not accept payments, subscribe for units or reserve an allocation. Enquiry details are stored securely so the REIT team can respond to your request.</p>
        <div className="footer-meta"><span>© 2026 Mutirikwi REIT</span><span>SECZ Registration SECZ101159S</span><Link href="/enquire">Request fact sheet ↓</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/admin/login">Admin login</Link><a className="developer-credit" href="https://spiritusglobal.tech/" target="_blank" rel="noopener noreferrer" aria-label="Website developed by Spiritus, opens in a new tab">Website by <strong>SPIRITUS</strong><span aria-hidden="true">↗</span></a></div>
      </div>
    </footer>
  );
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.sessionStorage.getItem("mutirikwi-cookie-notice") !== "dismissed");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismissNotice() {
    try {
      window.sessionStorage.setItem("mutirikwi-cookie-notice", "dismissed");
    } catch {
      // Keep the notice dismissible even when browser storage is unavailable.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-notice" aria-label="Cookie notice" role="region">
      <p><strong>Essential cookies only.</strong> We use them for secure staff sign-in and to provide a fact sheet you request. We do not currently use analytics or advertising cookies. <Link href="/cookies">Cookie policy</Link></p>
      <button type="button" onClick={dismissNotice} aria-label="Dismiss cookie notice">Got it</button>
    </aside>
  );
}
