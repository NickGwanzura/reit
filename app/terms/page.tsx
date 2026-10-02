import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Terms of Use | Mutirikwi REIT",
  description: "Terms for using the Mutirikwi REIT website and its investor enquiry and fact-sheet features.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" summary="These terms apply when you browse this website, use the enquiry form or request the Mutirikwi REIT fact sheet.">
      <section>
        <h2>Information, not an offer</h2>
        <p>This website provides general information about Mutirikwi REIT. It is not an offer to sell, invitation to subscribe for, or recommendation to buy units, and it is not investment, legal, tax or financial advice. An investment decision should be made only after reviewing the current official offer documents and obtaining independent professional advice where appropriate.</p>
      </section>

      <section>
        <h2>Targets and project information</h2>
        <p>Any target return, yield, timetable, property opportunity or other estimate is indicative, may change and is not guaranteed. Actual outcomes may differ, and investors may lose some or all of their capital. Project proposals remain subject to the official documents, approvals, market conditions and other risks.</p>
        <p>If this website and an official offer document differ, the official document and applicable law take precedence. Please confirm current terms with the Fund Manager before acting.</p>
      </section>

      <section>
        <h2>Enquiries and fact-sheet access</h2>
        <p>Submitting an enquiry only asks the team to follow up. It does not accept an offer, create an investment, process a payment, reserve units or confirm eligibility. The unit estimator is arithmetic based on a published unit price; it does not project returns or allocate units. Access to a requested fact sheet is time-limited and is not a subscription or investment contract.</p>
      </section>

      <section>
        <h2>Website use and external links</h2>
        <p>You agree not to misuse the website, interfere with its security or attempt unauthorised access. We may change, suspend or remove website content or features. Links to third-party websites are provided for convenience; those sites have their own content, privacy practices and terms, which we do not control.</p>
      </section>

      <section>
        <h2>Content and availability</h2>
        <p>We aim to keep information useful and current, but do not promise that every page is complete, error-free or continuously available. To the extent permitted by law, Mutirikwi REIT and its service providers are not responsible for losses arising solely from reliance on general website content or temporary service interruption. Nothing in these terms excludes liability or rights that cannot lawfully be excluded.</p>
      </section>

      <section>
        <h2>Privacy and governing law</h2>
        <p>Our <a href="/privacy">Privacy Policy</a> explains how investor enquiry information is handled, and the <a href="/cookies">Cookie Policy</a> describes essential cookies and similar storage. These terms are governed by the laws of Zimbabwe, subject to any mandatory rights or protections that apply.</p>
        <p>For questions, contact the Fund Manager at <a href="mailto:makanatsa@redwood.co.zw">makanatsa@redwood.co.zw</a> or <a href="mailto:farai@redwood.co.zw">farai@redwood.co.zw</a>.</p>
      </section>
    </LegalPage>
  );
}
