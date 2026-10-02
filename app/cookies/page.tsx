import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy | Mutirikwi REIT",
  description: "Essential cookies and browser storage used by the Mutirikwi REIT website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy" summary="We currently use only essential cookies for requested fact-sheet access and secure staff sign-in. We do not currently use advertising or analytics cookies.">
      <section>
        <h2>What cookies do</h2>
        <p>Cookies are small values stored by your browser. This site uses them only for features that you request or that protect the staff CRM. The site does not currently load advertising pixels or analytics tools.</p>
      </section>

      <section>
        <h2>Essential cookies</h2>
        <div className="cookie-detail">
          <h3>Fact-sheet access</h3>
          <p><code>mutirikwi_brochure_access</code> is set after a successful investor enquiry so the browser can access the requested fact sheet. It is limited to the download endpoint, is HttpOnly and SameSite Strict, uses Secure on production HTTPS, and expires after 24 hours.</p>
        </div>
        <div className="cookie-detail">
          <h3>Staff sign-in</h3>
          <p>The secure CRM sign-in flow uses Auth.js session and security cookies for authorised staff. The staff session is configured to expire after up to eight hours. These cookies are not used to track public visitors.</p>
        </div>
      </section>

      <section>
        <h2>Cookie notice preference</h2>
        <p>If you dismiss the cookie notice, this browser tab uses session storage (<code>mutirikwi-cookie-notice</code>) to remember that choice until the tab session ends. This is browser storage, not a cookie, and it contains no enquiry or identity information.</p>
      </section>

      <section>
        <h2>Managing cookies</h2>
        <p>You can clear or block cookies in your browser settings. Blocking essential cookies may prevent the fact-sheet download from opening or staff from signing in to the CRM. If we add optional analytics or advertising technologies later, we will update this page and provide appropriate choices before using them.</p>
        <p>For more detail about personal information, read the <a href="/privacy">Privacy Policy</a>. For questions, contact <a href="mailto:makanatsa@redwood.co.zw">makanatsa@redwood.co.zw</a>.</p>
      </section>
    </LegalPage>
  );
}
