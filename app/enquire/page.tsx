import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm, SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = {
  title: "Investor Enquiry | Mutirikwi REIT",
  description: "Share your investor enquiry with the Mutirikwi REIT team in three simple steps and request the October 2026 fact sheet.",
  robots: { index: false, follow: true },
};

const steps = [
  ["01", "Your details", "Tell us how the team can reach you."],
  ["02", "Investment profile", "Share what you are exploring."],
  ["03", "Contact preference", "Choose how you would like us to respond."],
];

export default function EnquiryPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to enquiry form</a>
      <SiteHeader />
      <main id="main" className="enquiry-page">
        <div className="wrap enquiry-page-layout">
          <div className="enquiry-page-intro">
            <Link className="enquiry-back-link" href="/#home">← Back to Mutirikwi REIT</Link>
            <p className="eyebrow"><span /> INVESTOR ENQUIRY</p>
            <h1>Let&apos;s start<br /><em>a conversation.</em></h1>
            <p className="enquiry-page-lede">Share a few details and the Redwood Asset Management team will follow up about the Mutirikwi REIT&apos;s commercial real estate strategy in the Masvingo region.</p>
            <ol className="enquiry-step-summary">
              {steps.map(([number, title, description]) => (
                <li key={number}><span>{number}</span><div><strong>{title}</strong><small>{description}</small></div></li>
              ))}
            </ol>
            <div className="enquiry-privacy-note"><span aria-hidden="true">◇</span><p>Your details are used to respond to this enquiry. No payment details are requested, and submitting this form does not reserve units or create an investment.</p></div>
            <div className="enquiry-page-contact"><span className="micro-label">PREFER TO SPEAK WITH THE TEAM?</span><a href="mailto:makanatsa@redwood.co.zw">makanatsa@redwood.co.zw <span aria-hidden="true">↗</span></a><a href="mailto:farai@redwood.co.zw">farai@redwood.co.zw <span aria-hidden="true">↗</span></a><a href="tel:+263773590809">+263 773 590 809 <span aria-hidden="true">↗</span></a><a href="tel:+263779888456">+263 779 888 456 <span aria-hidden="true">↗</span></a></div>
          </div>
          <EnquiryForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
