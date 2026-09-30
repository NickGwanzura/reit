import Image from "next/image";
import Link from "next/link";
import { InvestmentCalculator, SiteFooter, SiteHeader } from "./components";

const risks = [
  ["Tenant Default", "Brochure mitigation includes grace periods, peer or employer guarantees, and a waiting list of qualified households."],
  ["Construction Overruns", "Proposed mitigations include an 8% construction contingency, fixed-price SME contracts, standardised designs and bulk procurement."],
  ["Land and Title Delays", "Land acquisition is conditional. The brochure describes clean-title land acquisition with council approval as a mitigation."],
  ["Currency and Inflation", "The strategy references USD-pegged rents and costs, with target distributions in USD. Currency and inflation risks remain."],
  ["Political and Regulatory Change", "Changes in regulation or policy may affect the REIT and its project. Oversight does not remove investment risk."],
];

const faqs = [
  ["Is the 10% target yield guaranteed?", "No. The brochure states that yield and IRR are targets, not guarantees. Actual returns may differ, and investors may lose some or all of their investment."],
  ["What is the minimum investment?", "The September 2026 brochure states a minimum investment of US$100 at a pre-listing unit price of US$0.10. Review current offer documents with the Fund Manager."],
  ["What is the Masvingo Flats Project?", "A proposed development on Stand 40732 in Masvingo, comprising 180 two-bedroom homes across 30 blocks. Project delivery remains subject to tender award and statutory approvals."],
  ["When is the VFEX listing expected?", "The brochure lists March 2027 as the target listing date. This is a target, not a confirmed listing date."],
  ["Who manages the fund?", "Redwood Asset Management (Private) Limited is the Fund Manager. Kreston Zimbabwe Trustees is the Trustee. Entry Financial Technologies is the Operating Partner."],
  ["How do I get official offer documents?", "Complete the investor enquiry form to unlock the downloadable brochure. For official offer documents, contact Redwood Asset Management directly."],
];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <section className="hero" id="home">
          <div className="hero-art" aria-hidden="true"><Image src="/assets/masvingo-flats-hero-high-res.png" alt="" fill priority sizes="100vw" /></div>
          <div className="hero-shade" />
          <div className="hero-content wrap">
            <p className="eyebrow light"><span /> REAL ASSETS. LASTING IMPACT.</p>
            <h1>Invest in homes.<br /><em>Build lasting value.</em></h1>
            <p className="hero-lede">A Zimbabwean real estate investment trust focused on affordable housing, beginning with the proposed Masvingo Flats Project.</p>
            <div className="hero-actions"><Link className="button button-red" href="#opportunity">Explore the opportunity <span>↗</span></Link><Link className="button button-ghost" href="/enquire">Request the brochure <span>↘</span></Link></div>
            <p className="hero-caption"><span className="caption-rule" /> MASVINGO, ZIMBABWE <span>·</span> ARTIST&apos;S IMPRESSION</p>
          </div>
          <div className="hero-note"><span className="note-dot" />A proposed residential community<br />on Stand 40732</div>
        </section>

        <section className="stat-ribbon" aria-label="Investment highlights">
          <div className="stat-item"><strong>US$10<span>m</span></strong><small>OFFER SIZE</small></div>
          <div className="stat-item"><strong>US$0.10</strong><small>PRE-LISTING UNIT PRICE</small></div>
          <div className="stat-item"><strong>US$100</strong><small>MINIMUM INVESTMENT</small></div>
          <div className="stat-item target"><strong>10<span>%</span></strong><small>TARGET NET YIELD <sup>1</sup></small></div>
          <div className="stat-item"><strong>180</strong><small>PROPOSED HOMES</small></div>
        </section>

        <section className="section opportunity" id="opportunity">
          <div className="wrap split-heading"><div><p className="eyebrow"><span /> THE OPPORTUNITY</p><h2>A housing need.<br /><em>A real asset response.</em></h2></div><div className="section-intro"><p>Zimbabwe&apos;s housing gap is persistent and growing. Mutirikwi REIT&apos;s strategy is to direct capital toward affordable homes for households underserved by conventional mortgage finance.</p><a className="text-link" href="#how-it-works">See how the model works <span>→</span></a></div></div>
          <div className="wrap market-grid">
            <article className="market-stat"><span className="micro-label">NATIONAL HOUSING DEFICIT</span><strong>1.5<span>m+</span></strong><p>homes needed across Zimbabwe</p></article>
            <article className="market-stat"><span className="micro-label">ADDITIONAL DEMAND EACH YEAR</span><strong>~200<span>k</span></strong><p>homes of growing annual demand</p></article>
            <article className="market-stat"><span className="micro-label">NATIONAL TARGET BY 2030</span><strong>1<span>m</span></strong><p>housing units under national policy</p></article>
            <div className="market-aside"><span className="aside-number">01 / 03</span><p>Investment in affordable housing can connect institutional capital with households who have income but limited access to traditional mortgages.</p><span className="aside-line" /></div>
          </div>
          <div className="wrap audience-row"><span className="micro-label">DESIGNED FOR REAL-LIFE HOUSING NEEDS</span><div className="audience-tags"><span>Informal workforce</span><span>Civil servants</span><span>Diaspora families</span><span>Corporate employees</span></div></div>
        </section>

        <section className="section development" id="development">
          <div className="wrap development-head"><div><p className="eyebrow light"><span /> THE DEVELOPMENT</p><h2>More than a building.<br /><em>A neighbourhood in the making.</em></h2></div><p className="development-copy">Stand 40732 is a proposed gated residential community, around 4 km from Masvingo CBD on the road to Great Zimbabwe. The City of Masvingo offered the stand under Tender No. HSL03/2026.</p></div>
          <div className="wrap project-feature">
            <div className="project-visual"><Image src="/assets/masvingo-flats-hero.png" alt="Artist's impression of the proposed Masvingo flats estate" fill sizes="(max-width: 720px) 100vw, 65vw" /><span className="image-tag">ARTIST&apos;S IMPRESSION</span><div className="visual-label"><span>STAND 40732</span><strong>Masvingo<br />Flats Project</strong></div></div>
            <div className="project-facts"><div className="fact-main"><span>PROPOSED DEVELOPMENT</span><strong>180</strong><p>two-bedroom homes across 30 apartment blocks</p></div><div className="fact-grid"><div><strong>3</strong><span>storeys per block</span></div><div><strong>216</strong><span>parking bays</span></div><div><strong>12,478 <small>m²</small></strong><span>stand area</span></div><div><strong>6</strong><span>phases of 30 homes</span></div></div><p className="timeline-note"><span className="timeline-icon">↗</span><span><strong>~36 months</strong><br />Target to final handover, subject to tender award and statutory approvals.</span></p></div>
          </div>
          <div className="wrap amenities"><div className="amenity"><span className="amenity-icon">01</span><strong>Gated Community</strong><small>Perimeter walling and controlled access</small></div><div className="amenity"><span className="amenity-icon">02</span><strong>Metered Utilities</strong><small>Individually metered water and gas</small></div><div className="amenity"><span className="amenity-icon">03</span><strong>Solar Lighting</strong><small>Lighting for streets and shared areas</small></div><div className="amenity"><span className="amenity-icon">04</span><strong>Everyday Amenity</strong><small>Shopping-centre frontage and green space</small></div></div>
        </section>

        <section className="section model" id="how-it-works">
          <div className="wrap model-heading"><div><p className="eyebrow"><span /> THE MODEL</p><h2>Capital builds homes.<br /><em>Homes serve communities.</em></h2></div><p>The REIT&apos;s strategy combines residential development with a rent-to-own approach. Actual outcomes depend on project delivery, occupancy, costs and other risks.</p></div>
          <div className="wrap flow"><div className="flow-line" /><article className="flow-step"><span>01</span><div className="step-icon">↗</div><h3>Investors<br />Subscribe</h3><p>Investors participate in the REIT through its published offer terms.</p></article><article className="flow-step"><span>02</span><div className="step-icon">⌂</div><h3>Capital Funds<br />Development</h3><p>The REIT targets investment in residential property and development.</p></article><article className="flow-step"><span>03</span><div className="step-icon">▥</div><h3>Homes Are<br />Made Available</h3><p>Proposed homes are intended for qualifying households under rent-to-own.</p></article><article className="flow-step"><span>04</span><div className="step-icon">◒</div><h3>Rental Income<br />Supports Returns</h3><p>USD rentals are intended to support recurring income to the REIT.</p></article><article className="flow-step"><span>05</span><div className="step-icon">⌂</div><h3>Residents Work<br />Toward Ownership</h3><p>Tenant payments are intended to build equity toward home ownership.</p></article></div>
        </section>

        <section className="terms section" id="terms">
          <div className="wrap terms-layout"><div className="terms-intro"><p className="eyebrow light"><span /> INVESTMENT TERMS</p><h2>Clear terms.<br /><em>Long-term focus.</em></h2><p>Key terms published in the September 2026 brochure. Review the offer documents and risks before making any investment decision.</p><Link className="button button-light" href="/enquire">Request the brochure <span>↘</span></Link></div>
            <div className="terms-table"><div className="term-row"><span>Offer size</span><strong>US$10 million</strong></div><div className="term-row"><span>Total units</span><strong>100 million</strong></div><div className="term-row"><span>Pre-listing unit price</span><strong>US$0.10</strong></div><div className="term-row"><span>Minimum investment</span><strong>US$100</strong></div><div className="term-row highlight"><span>Target net yield <sup>1</sup></span><strong>10% p.a.</strong></div><div className="term-row highlight"><span>Target net IRR <sup>1</sup></span><strong>17%</strong></div><div className="term-row"><span>Target distribution frequency</span><strong>Quarterly, in USD</strong></div><div className="term-row"><span>Target exchange / listing</span><strong>VFEX / March 2027</strong></div><div className="term-row"><span>Management fee</span><strong>1% p.a. of market value</strong></div><div className="term-row"><span>Trustee and custodial fee</span><strong>0.3% p.a. of market value</strong></div><div className="terms-footnote"><sup>1</sup> Yield and IRR are targets, not guarantees. Actual returns may differ. Terms and project assumptions are subject to the offer documents and applicable approvals.</div></div>
          </div>
        </section>

        <section className="section calculator-section" id="calculator"><div className="wrap calc-layout"><div className="calc-copy"><p className="eyebrow"><span /> EXPLORE THE NUMBERS</p><h2>Picture the<br /><em>possibility.</em></h2><p>Use this educational calculator to see what the brochure&apos;s pre-listing unit price and target yield could illustrate for an amount you choose.</p><div className="calc-disclaimer"><span>i</span><p>Illustrative only. The 10% net yield is a target and is not guaranteed. Actual returns may differ. This calculator does not process an investment or allocate units.</p></div></div><InvestmentCalculator /></div></section>

        <section className="section governance" id="risks">
          <div className="wrap governance-header"><div><p className="eyebrow"><span /> GOVERNANCE &amp; RISK</p><h2>Trust through<br /><em>transparency.</em></h2></div><div><p>Mutirikwi REIT is registered as a Collective Investment Scheme with the Securities and Exchange Commission of Zimbabwe. Understand the risks and read the offer documents before investing.</p><Link className="text-link" href="/enquire">Request full risk disclosures <span>↘</span></Link></div></div>
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
            <a className="partner-card" href="https://entry.co.zw/about-us/" target="_blank" rel="noreferrer" aria-label="Entry Financial Technologies website, opens in a new tab"><small>OPERATING PARTNER</small><strong>Entry Financial Technologies <span aria-hidden="true">↗</span></strong></a>
          </div></div>
        </section>

        <section className="section faq-section" id="faqs"><div className="wrap faq-layout"><div><p className="eyebrow"><span /> GOOD QUESTIONS</p><h2>Before you<br /><em>take the next step.</em></h2><p>Get familiar with the fund, the proposed development and the published terms.</p><Link className="text-link" href="/enquire">Ask the fund team <span>→</span></Link></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span /></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="enquiry" id="enquire"><div className="wrap enquiry-layout enquiry-landing"><div className="enquiry-copy"><p className="eyebrow light"><span /> START A CONVERSATION</p><h2>Explore the opportunity<br /><em>with the fund team.</em></h2><p>Request the investment pack or ask a question. A member of Redwood Asset Management can help with next steps.</p><div className="contact-lines" aria-label="Redwood Asset Management contact details">
          <div className="contact-item"><small>Email Us</small><a href="mailto:info@redwood.co.zw">info@redwood.co.zw <span>↗</span></a></div>
          <div className="contact-item"><small>Call Us</small><a href="tel:+263773590809">+263-773590809 <span>↗</span></a></div>
          <div className="contact-item"><small>WhatsApp</small><a href="https://wa.me/263773590809" target="_blank" rel="noreferrer">+263 77 359 0809 <span>↗</span></a></div>
          <div className="contact-addresses">
            <p><strong>Address</strong><br />1st Floor, 106 McChlery Ave, Eastlea, Harare</p>
            <small>We&apos;re open<br />8:00 am–4:00 pm</small>
          </div>
          <a className="redwood-contact-link" href="https://redwood.co.zw/contacts/" target="_blank" rel="noreferrer" aria-label="Redwood Asset Management contact page, opens in a new tab">Contact Us <span>↗</span></a>
        </div></div><aside className="enquiry-start-card"><span className="micro-label">A SIMPLE THREE-STEP ENQUIRY</span><h3>Let&apos;s start with a conversation.</h3><p>Tell us how to reach you, what you&apos;re exploring and how you&apos;d like the team to respond.</p><ol><li><span>01</span>Your contact details</li><li><span>02</span>Investment profile</li><li><span>03</span>Contact preference</li></ol><Link className="button button-red" href="/enquire">Begin your enquiry <span>↗</span></Link><small>No payment details are requested. Submitting an enquiry does not reserve units.</small></aside></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
