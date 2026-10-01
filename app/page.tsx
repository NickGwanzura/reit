import Image from "next/image";
import Link from "next/link";
import { InvestmentCalculator, SiteFooter, SiteHeader } from "./components";

const risks = [
  ["Currency Risk", "The fund's performance and investor outcomes may be affected by currency movements. Units are denominated and traded in United States Dollars."],
  ["Liquidity Risk", "Units are subject to a pre-listing lock-in and may be harder to sell than listed securities."],
  ["Counterparty Risk", "A service provider, tenant or other contractual counterparty may fail to meet its obligations."],
  ["Legal & Contractual Risk", "Regulatory, legal or contract changes could affect the fund, its assets or investor rights."],
  ["Portfolio Vacancy Risk", "Unoccupied space can reduce rent received and affect asset performance."],
  ["Market Risk", "Property values and demand for office, retail, hospitality or industrial space can change."],
  ["Cost Overrun Risk", "Development expenses may exceed estimates and affect delivery or investment outcomes."],
];

const faqs = [
  ["Are the target returns guaranteed?", "No. The October 2026 fact sheet lists a 17% target IRR on property developments and a 10% p.a. USD net income yield on NAV. These are targets, not guarantees; actual outcomes may differ and investors may lose some or all of their investment."],
  ["What is the minimum investment?", "The fact sheet lists a pre-listing minimum of 1,000 units (US$100) at a launch price of US$0.10 per unit. Payment terms and eligibility should be confirmed in the official offer documents with the Fund Manager."],
  ["What does the pre-listing lock-in mean?", "The fact sheet says units may not be sold, transferred, pledged or withdrawn between investment and listing. Waivers require prior written consent from both the Investment Committee and Trustee. Units are freely transferable after listing, subject to Zimbabwean law."],
  ["What property sectors does the REIT target?", "The fact sheet identifies commercial property opportunities in offices, retail, hospitality and industrial property across the Masvingo region, including large-scale projects such as the new Masvingo CBD."],
  ["Who manages and oversees the fund?", "Redwood Asset Management (Private) Limited is the appointed REIT Manager, and Kreston Zimbabwe is the Trustee. The fact sheet describes oversight by the Mutirikwi REIT Advisory Board and Investment Committee."],
  ["What KYC documents may be required?", "The fact sheet lists certified identity documents, two passport-sized photos and proof of residence for individuals. Corporate and institutional investors may need incorporation and constitutional documents, a board resolution, a CR14, director and signatory IDs and photos, company banking details, and proof of residence. Do not send KYC documents through this enquiry form; request the Fund Manager's approved process."],
  ["When is the listing expected?", "March 2027 is an indicative listing date in the October 2026 fact sheet. It is not a confirmed date."],
  ["How do I take the next step?", "Submit an enquiry to request the fact sheet and discuss the official offer documents with the Fund Manager. The website enquiry form does not accept payment, subscribe for units, or reserve an allocation."],
];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <section className="hero" id="home">
          <div className="hero-art" aria-hidden="true"><Image src="/assets/lake-mutirikwi-hero.jpg" alt="" fill priority sizes="100vw" /></div>
          <div className="hero-shade" />
          <div className="hero-content wrap">
            <p className="eyebrow light"><span /> INVESTING IN THE FUTURE, TODAY</p>
            <h1>Unlocking real estate value <em>in the Masvingo region.</em></h1>
            <p className="hero-lede">A SECZ-licensed REIT focused on commercial property opportunities, target USD income and long-term capital appreciation.</p>
            <div className="hero-actions"><Link className="button button-red" href="#opportunity">Explore the opportunity <span>↗</span></Link><Link className="button button-ghost" href="/enquire">Request the fact sheet <span>↘</span></Link></div>
            <p className="hero-caption"><span className="caption-rule" /> LAKE MUTIRIKWI <span>·</span> ILLUSTRATIVE IMAGE</p>
          </div>
        </section>

        <section className="stat-ribbon" aria-label="Investment highlights">
          <div className="stat-item target"><strong>17<span>%</span></strong><small>TARGET IRR · PROPERTY DEVELOPMENTS</small></div>
          <div className="stat-item target"><strong>10<span>%</span></strong><small>USD NET INCOME YIELD ON NAV · P.A.</small></div>
          <div className="stat-item"><strong>US$0.10</strong><small>LAUNCH PRICE PER UNIT</small></div>
          <div className="stat-item"><strong>US$100</strong><small>PRE-LISTING MINIMUM · 1,000 UNITS</small></div>
          <div className="stat-item"><strong>Mar 2027</strong><small>INDICATIVE LISTING DATE</small></div>
        </section>

        <section className="section opportunity" id="opportunity">
          <div className="wrap split-heading"><div><p className="eyebrow"><span /> THE OPPORTUNITY</p><h2>Regional potential.<br /><em>Commercial real estate.</em></h2></div><div className="section-intro"><p>Mutirikwi REIT aims to participate in the Masvingo region&apos;s commercial property opportunities, serving investors seeking long-term, risk-adjusted returns through real estate.</p><a className="text-link" href="#how-it-works">See how the strategy works <span>→</span></a></div></div>
          <div className="wrap market-grid">
            <article className="market-stat"><span className="micro-label">PROPERTY DEVELOPMENT TARGET</span><strong>17<span>%</span></strong><p>target IRR on property developments</p></article>
            <article className="market-stat"><span className="micro-label">TARGET RENTAL YIELD</span><strong>10<span>%</span></strong><p>USD net income yield on NAV per annum</p></article>
            <article className="market-stat"><span className="micro-label">PRE-LISTING MINIMUM</span><strong>1,000</strong><p>units · US$100 at US$0.10 per unit</p></article>
            <div className="market-aside"><span className="aside-number">MASVINGO REGION</span><p>The fact sheet links the strategy to Vision 2030 and the Devolution Agenda, and identifies government initiatives, mining and agriculture among regional growth drivers.</p><span className="aside-line" /></div>
          </div>
          <div className="wrap audience-row"><span className="micro-label">TARGET INVESTORS</span><div className="audience-tags"><span>Institutional investors</span><span>Corporate investors</span><span>Individual investors</span></div></div>
        </section>

        <section className="section development" id="development">
          <div className="wrap development-head"><div><p className="eyebrow light"><span /> INVESTMENT STRATEGY</p><h2>Investing in property.<br /><em>Backing regional growth.</em></h2></div><p className="development-copy">The REIT seeks to develop, own, manage and invest in real estate across the Masvingo region. The fact sheet identifies commercial opportunities including offices, retail, hospitality and industrial property, with projects such as the new Masvingo CBD.</p></div>
          <div className="wrap project-feature">
            <div className="project-visual"><Image src="/assets/lake-mutirikwi-hero.jpg" alt="AI-generated illustrative landscape inspired by Lake Mutirikwi" fill sizes="(max-width: 720px) 100vw, 65vw" /><span className="image-tag">ILLUSTRATIVE IMAGE</span><div className="visual-label"><span>INVESTMENT FOCUS</span><strong>Commercial<br />Real Estate</strong></div></div>
            <div className="project-facts"><div className="fact-main"><span>STRATEGY</span><strong>4</strong><p>commercial property sectors identified in the fact sheet</p></div><div className="fact-grid"><div><strong>Office</strong><span>spaces</span></div><div><strong>Retail</strong><span>centres</span></div><div><strong>Hospitality</strong><span>property</span></div><div><strong>Industrial</strong><span>property</span></div></div><p className="timeline-note"><span className="timeline-icon">↗</span><span><strong>Develop · Own · Manage · Invest</strong><br />A long-term real estate strategy focused on the Masvingo region.</span></p></div>
          </div>
          <div className="wrap amenities"><div className="amenity"><span className="amenity-icon">01</span><strong>Diversification</strong><small>Exposure to real estate without direct property ownership</small></div><div className="amenity"><span className="amenity-icon">02</span><strong>Liquidity</strong><small>Units are intended to be tradable after listing</small></div><div className="amenity"><span className="amenity-icon">03</span><strong>Inflation Hedge</strong><small>Real estate assets have historically preserved value in inflationary environments</small></div><div className="amenity"><span className="amenity-icon">04</span><strong>Regional Impact</strong><small>Contribute to regional development and job creation</small></div></div>
        </section>

        <section className="section model" id="how-it-works">
          <div className="wrap model-heading"><div><p className="eyebrow"><span /> THE MODEL</p><h2>Property-led strategy.<br /><em>Long-term perspective.</em></h2></div><p>The REIT aims to develop, own, manage and invest in property in the Masvingo region. Outcomes depend on asset performance, occupancy, costs and market conditions.</p></div>
          <div className="wrap flow"><div className="flow-line" /><article className="flow-step"><span>01</span><div className="step-icon">↗</div><h3>Investors<br />Subscribe</h3><p>Investors participate through the published offer terms.</p></article><article className="flow-step"><span>02</span><div className="step-icon">⌂</div><h3>Capital Targets<br />Property</h3><p>The fund focuses on real estate opportunities in the Masvingo region.</p></article><article className="flow-step"><span>03</span><div className="step-icon">▥</div><h3>Develop &amp;<br />Manage Assets</h3><p>The strategy includes developing, owning and managing property.</p></article><article className="flow-step"><span>04</span><div className="step-icon">◒</div><h3>Rental Income<br />Supports Value</h3><p>Commercial assets are intended to generate rental income in USD.</p></article><article className="flow-step"><span>05</span><div className="step-icon">⌂</div><h3>Long-Term<br />Investment Returns</h3><p>Targets are indicative only; actual investment outcomes may differ.</p></article></div>
        </section>

        <section className="terms section" id="terms">
          <div className="wrap terms-layout"><div className="terms-intro"><p className="eyebrow light"><span /> INVESTMENT TERMS</p><h2>Clear terms.<br /><em>Long-term focus.</em></h2><p>Key terms from the Mutirikwi REIT Fact Sheet, October 2026. Review the official offer documents and risks before making any investment decision.</p><Link className="button button-light" href="/enquire">Request the fact sheet <span>↘</span></Link></div>
            <div className="terms-table"><div className="term-row"><span>Fund</span><strong>SECZ-licensed REIT</strong></div><div className="term-row"><span>Fund Manager</span><strong>Redwood Asset Management (Private) Limited</strong></div><div className="term-row"><span>Trustee</span><strong>Kreston Zimbabwe</strong></div><div className="term-row"><span>Governance</span><strong>Mutirikwi REIT Advisory Board and Investment Committee</strong></div><div className="term-row"><span>Target investors</span><strong>Institutional, corporate and individual</strong></div><div className="term-row"><span>Property development target IRR</span><strong>17%</strong></div><div className="term-row highlight"><span>USD net income yield on NAV</span><strong>10% p.a.</strong></div><div className="term-row"><span>Launch price per unit</span><strong>US$0.10</strong></div><div className="term-row"><span>Pre-listing minimum</span><strong>1,000 units · US$100</strong></div><div className="term-row"><span>Payment currency</span><strong>USD or ZiG equivalent</strong></div><div className="term-row"><span>Unit denomination and trading</span><strong>United States Dollars</strong></div><div className="term-row"><span>Rights attached to units</span><strong>Pari passu; one vote per unit and pro rata distribution rights</strong></div><div className="term-row"><span>Indicative listing date</span><strong>March 2027</strong></div><div className="term-row"><span>Pre-listing lock-in</span><strong>Until listing, subject to permitted waivers</strong></div><div className="term-row"><span>Fund Manager fee</span><strong>1% of total market value p.a.</strong></div><div className="term-row"><span>Trustee fee</span><strong>0.3% of total market value p.a.</strong></div><div className="term-row"><span>Asset valuation</span><strong>Full-scope annually, per SECZ guidelines</strong></div><div className="term-row"><span>Prescribed asset status</span><strong>Application in progress</strong></div><div className="terms-footnote">The 17% IRR and 10% yield are targets, not guarantees. Actual returns may differ. Terms are summarised from the October 2026 fact sheet; consult the official offer documents and seek independent advice.</div></div>
          </div>
        </section>

        <section className="section calculator-section" id="calculator"><div className="wrap calc-layout"><div className="calc-copy"><p className="eyebrow"><span /> EXPLORE THE NUMBERS</p><h2>Understand the<br /><em>unit price.</em></h2><p>See how the published US$0.10 launch price translates to an illustrative number of units for an amount you enter.</p><div className="calc-disclaimer"><span>i</span><p>This is arithmetic only, not a return projection, offer or subscription. Target returns are not guaranteed. The website does not take payments or allocate units.</p></div></div><InvestmentCalculator /></div></section>

        <section className="section governance" id="risks">
          <div className="wrap governance-header"><div><p className="eyebrow"><span /> GOVERNANCE &amp; RISK</p><h2>Trust through<br /><em>transparency.</em></h2></div><div><p>Mutirikwi REIT is licensed by the Securities and Exchange Commission of Zimbabwe under the Collective Investment Schemes Act, Chapter 24:09. Registration: SECZ101159S. Read the official offer documents and understand the risks before investing.</p><Link className="text-link" href="/enquire">Request the fact sheet <span>↘</span></Link></div></div>
          <div className="wrap leadership">
            <p className="eyebrow"><span /> LEADERSHIP</p>
            <article className="chair-profile">
              <div className="chair-profile-heading">
                <div className="chair-photo"><Image src="/assets/saul-chinanga.png" alt="Mr Saul Chin’anga, Chairman of Mutirikwi REIT" width={720} height={1080} sizes="(max-width: 720px) 112px, 150px" /></div>
                <div><p className="micro-label">CHAIRMAN</p><h3>Mr Saul Chin’anga</h3></div>
              </div>
              <p className="chair-biography">Saul is a prominent Masvingo businessman and holds a Master’s degree in Business Administration from the Zimbabwe Open University. He is also a certified Electronic Banking Specialist and holds a Diploma in Banking with the Institute of Bankers Zimbabwe. A seasoned career banker, Saul has over 28 years of experience in the financial services sector. He possesses a strong professional foundation in finance, accounting, and corporate governance, developed through senior leadership roles and extensive board-level exposure. His expertise spans financial management, risk oversight, regulatory compliance, and strategic decision-making, enabling him to provide sound financial leadership and governance across complex institutions. Saul brings a well-rounded, practical, and disciplined financial perspective that supports sustainable growth, accountability, and institutional stability.</p>
            </article>
          </div>
          <div className="wrap risk-grid">{risks.map(([title, text], index) => <article className="risk-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}<div className="registration-card"><span className="micro-label">REGISTRATION</span><strong>SECZ101159S</strong><small>Collective Investment Scheme<br />Securities and Exchange Commission of Zimbabwe</small><span className="seal" aria-hidden="true">M</span></div></div>
          <div className="wrap partners"><span className="micro-label">FUND PARTNERS</span><div className="partner-row">
            <a className="partner-card" href="#home"><small>FUND</small><strong>Mutirikwi REIT <span aria-hidden="true">↗</span></strong></a>
            <a className="partner-card" href="https://redwood.co.zw/" target="_blank" rel="noreferrer" aria-label="Redwood Asset Management website, opens in a new tab"><small>FUND MANAGER</small><strong>Redwood Asset Management <span aria-hidden="true">↗</span></strong></a>
            <a className="partner-card" href="https://krestonzim.com/service/trustee-services/" target="_blank" rel="noreferrer" aria-label="Kreston Zimbabwe Trustee Services, opens in a new tab"><small>TRUSTEE</small><strong>Kreston Zimbabwe Trustees <span aria-hidden="true">↗</span></strong></a>
          </div></div>
        </section>

        <section className="section faq-section" id="faqs"><div className="wrap faq-layout"><div><p className="eyebrow"><span /> GOOD QUESTIONS</p><h2>Before you<br /><em>take the next step.</em></h2><p>Get familiar with the fund, its strategy, the published terms and the KYC process.</p><Link className="text-link" href="/enquire">Ask the fund team <span>→</span></Link></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span /></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="enquiry" id="enquire"><div className="wrap enquiry-layout enquiry-landing"><div className="enquiry-copy"><p className="eyebrow light"><span /> START A CONVERSATION</p><h2>Explore the opportunity<br /><em>with the fund team.</em></h2><p>Request the October 2026 fact sheet or ask a question. The Fund Manager can explain the official offer and next steps.</p><div className="contact-lines" aria-label="Mutirikwi REIT, fund manager and trustee contact details">
          <div className="contact-item"><small>MUTIRIKWI REIT · FUND</small><p>Masvingo Office, Solten Financial Services<br />Masvingo Trade Centre Building, Hofmeyer Street, Masvingo</p><a href="tel:+263392260820">039 226 0820 <span>↗</span></a><a href="tel:+263780382612">+263 78 038 2612 <span>↗</span></a><a href="tel:+263713352162">+263 71 335 2162 <span>↗</span></a></div>
          <div className="contact-item"><small>FUND MANAGER · REDWOOD ASSET MANAGEMENT</small><p>1st Floor, 106 McChlery Ave, Eastlea, Harare</p><a href="mailto:makanatsa@redwood.co.zw">makanatsa@redwood.co.zw <span>↗</span></a><a href="mailto:farai@redwood.co.zw">farai@redwood.co.zw <span>↗</span></a><a href="tel:+263773590809">+263 773 590 809 <span>↗</span></a><a href="tel:+263779888456">+263 779 888 456 <span>↗</span></a><a href="https://redwood.co.zw/" target="_blank" rel="noreferrer">redwood.co.zw <span>↗</span></a></div>
          <div className="contact-item"><small>TRUSTEE · KRESTON ZIMBABWE</small><p>Ground Floor, Block A, Smatsatsa Office Park, Borrowdale, Harare</p><a href="mailto:cmachingambi@krestonzim.com">cmachingambi@krestonzim.com <span>↗</span></a><a href="mailto:andambakuhwa@krestonzim.com">andambakuhwa@krestonzim.com <span>↗</span></a><a href="tel:+2638677193651">+263 8677 193 651 <span>↗</span></a><a href="tel:+263242746783">+263 242 746 783 <span>↗</span></a><a href="tel:+263778691944">+263 778 691 944 <span>↗</span></a><a href="tel:+263772283734">+263 772 283 734 <span>↗</span></a><a href="https://www.krestonzim.com/" target="_blank" rel="noreferrer">krestonzim.com <span>↗</span></a></div>
        </div></div><aside className="enquiry-start-card"><span className="micro-label">A SIMPLE THREE-STEP ENQUIRY</span><h3>Let&apos;s start with a conversation.</h3><p>Tell us how to reach you, what you&apos;re exploring and how you&apos;d like the team to respond.</p><ol><li><span>01</span>Your contact details</li><li><span>02</span>Investment profile</li><li><span>03</span>Contact preference</li></ol><Link className="button button-red" href="/enquire">Begin your enquiry <span>↗</span></Link><small>No payment details are requested. Submitting an enquiry does not reserve units.</small></aside></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
