import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Mutirikwi REIT",
  description: "How Mutirikwi REIT and its Fund Manager handle investor enquiries and personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" summary="How we collect, use, protect and retain information when you visit this website or send an investor enquiry.">
      <section>
        <h2>Who handles your information</h2>
        <p>This website is provided for Mutirikwi REIT. Investor enquiry information is handled by the REIT and its Fund Manager, Redwood Asset Management (Private) Limited, through authorised team members. For a privacy request, contact <a href="mailto:makanatsa@redwood.co.zw">makanatsa@redwood.co.zw</a> or <a href="mailto:farai@redwood.co.zw">farai@redwood.co.zw</a>, or call +263 773 590 809. Redwood’s published office address is 1st Floor, 106 McChlery Ave, Eastlea, Harare.</p>
        <p>Put “Privacy request” in the subject line. We will route your request to the responsible team. Please do not email identity documents or sensitive financial information unless the Fund Manager has provided a separate approved process.</p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>Details you submit: name, email address, optional phone or WhatsApp number, country, investor category, investment range, anticipated timeframe, preferred contact method and your contact permission.</li>
          <li>Enquiry and campaign details: when an enquiry is submitted, its source and campaign tags (if present), landing-page path and referring page.</li>
          <li>Security data: a one-way hash derived from the network address is used for rate-limiting and abuse prevention. Hosting and security systems may also create technical logs.</li>
        </ul>
        <p>The form does not request payment-card details, national identity documents or KYC files. The anti-spam honeypot field is not saved as enquiry information.</p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <p>We use enquiry information to respond using your preferred method, manage and assign follow-ups in the CRM, send an enquiry acknowledgement, provide the fact sheet you requested, protect the form and CRM from misuse, and keep appropriate operational, audit and compliance records. Your details are not used for unrelated advertising.</p>
      </section>

      <section>
        <h2>Contact permission and your choices</h2>
        <p>The enquiry form requires you to actively agree to be contacted about that enquiry. This does not subscribe you to a general marketing list. You may ask the team to stop follow-up contact at any time. That request will be recorded so that staff can respect it; it does not automatically erase records that must be retained for legal, security or audit reasons.</p>
      </section>

      <section>
        <h2>Who may receive information</h2>
        <p>Access is limited to authorised Mutirikwi REIT and Redwood staff who need it to handle the enquiry. Information may also be processed by service providers that support the website, database and email delivery. Enquiry emails are sent through Resend to the Fund Manager and configured team recipients. Information may be disclosed to a regulator, court or other authority where the law requires it, or to protect legal rights and security.</p>
        <p>Some service providers may process information outside Zimbabwe. The exact processing location depends on the provider and service configuration. Contact the Fund Manager if you need current provider or transfer details.</p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>We keep information for as long as it is reasonably needed to respond to the enquiry and for applicable operational, legal, regulatory, audit and security purposes. The CRM flags records for human retention review; it does not currently apply an automatic deletion period. You may request a review, subject to any lawful retention requirements.</p>
      </section>

      <section>
        <h2>Your data rights</h2>
        <p>Under applicable Zimbabwean law, you may ask to be informed about the use of your information, request access, object to some processing, seek correction of inaccurate information, or request deletion of false or misleading information. We will assess each request under the law and any duties to keep particular records. The relevant framework includes the <a href="https://www.potraz.gov.zw/wp-content/uploads/2025/02/Cyber-and-Data-Protection-Act-Chapter-1207.pdf" target="_blank" rel="noopener noreferrer">Cyber and Data Protection Act [Chapter 12:07]</a>.</p>
      </section>

      <section>
        <h2>Security and changes</h2>
        <p>We use access controls and other reasonable technical and organisational safeguards. No website or electronic transmission can be guaranteed completely secure. We may update this policy when our practices or legal requirements change; the date above shows when this page was last revised.</p>
      </section>
    </LegalPage>
  );
}
