export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "what-is-a-reit-zimbabwe",
    title: "What Is a REIT? A Practical Guide for Zimbabwean Investors",
    description: "Learn how a Real Estate Investment Trust works, what to review before investing, and how the Mutirikwi REIT's published terms describe its offer.",
    date: "2026-11-25",
    readTime: "6 min read",
    intro: "A Real Estate Investment Trust (REIT) is a structure that allows investors to participate in a professionally managed real estate portfolio through units. Before considering any REIT in Zimbabwe, understand the property strategy, governance, offer documents, fees, liquidity and risks.",
    sections: [
      { heading: "How a REIT works", paragraphs: ["Rather than buying and managing a building directly, a unit holder participates through a collective investment structure. The REIT can hold or develop property and may earn income from tenants. Returns depend on the assets, leases, costs, financing and market conditions; they are never assured by the structure itself.", "A REIT is not the same as a bank deposit. Unit values can fall, income can vary, and an investor may not be able to sell units whenever they wish. Read the current offer documents to understand the legal rights attached to units."] },
      { heading: "What the Mutirikwi REIT says it will focus on", paragraphs: ["The Mutirikwi REIT October 2026 fact sheet describes a commercial property strategy in the Masvingo region. The sectors it identifies are offices, retail, hospitality and industrial property, including opportunities such as the proposed new Masvingo CBD. These are stated investment areas, not a guarantee that any particular project will be completed or perform as expected.", "The fact sheet names Redwood Asset Management (Private) Limited as Fund Manager and Kreston Zimbabwe as Trustee. It lists SECZ registration number SECZ101159S. Prospective investors should independently confirm current regulatory and offer information before acting."] },
      { heading: "Questions to ask before investing", paragraphs: ["Ask how the REIT selects and values properties, how it manages vacancy and development risk, what fees apply, and how conflicts are handled. Check the distribution policy, unit transfer rules, lock-in terms and the conditions for a listing. Review the full offer documents rather than relying on a summary or an online calculator.", "The Mutirikwi REIT fact sheet lists a 17% target IRR on property developments and a 10% per annum USD net income yield on NAV. These are targets, not promised investor returns. The same fact sheet describes a pre-listing lock-in and an indicative March 2027 listing date; confirm current terms with the Fund Manager."] },
      { heading: "A careful next step", paragraphs: ["Compare the official documents with your own objectives, time horizon, liquidity needs and ability to withstand losses. Consider getting independent financial and legal advice. An enquiry is a request for information, not a unit subscription or allocation."] },
    ],
  },
  {
    slug: "commercial-property-masvingo",
    title: "Commercial Property in Masvingo: Sectors and Questions to Watch",
    description: "An overview of the office, retail, hospitality and industrial property sectors identified in the Mutirikwi REIT's Masvingo-region strategy.",
    date: "2026-11-25",
    readTime: "5 min read",
    intro: "Commercial property serves businesses and institutions through workplaces, shops, accommodation and industrial facilities. The Mutirikwi REIT's published strategy focuses on opportunities in the Masvingo region. Understanding each property sector—and the risks behind it—helps readers assess what that strategy means.",
    sections: [
      { heading: "Four commercial property sectors", paragraphs: ["Offices depend on tenant demand, location, building quality and lease terms. Retail property depends on suitable tenants, customer access, trading conditions and the ability to keep space occupied. Hospitality property is sensitive to visitor demand, operating costs and service quality. Industrial property can serve production, storage and logistics needs, with performance tied to tenant requirements and infrastructure.", "The October 2026 Mutirikwi REIT fact sheet identifies all four sectors as areas of focus. It also refers to large-scale opportunities such as the new Masvingo CBD. The fact sheet does not mean every opportunity is already an operating, income-producing asset; check project status in current official materials."] },
      { heading: "Why local context matters", paragraphs: ["Property performance is shaped by local demand, infrastructure, affordability, access to utilities, planning approvals and the wider economy. Broad claims about regional growth do not replace property-level due diligence. Investors should ask what evidence supports a project's expected demand, who the likely tenants are and how construction or operating costs are estimated.", "For development projects, timelines and budgets can change. For completed properties, vacancy, tenant defaults and maintenance costs can affect income. A portfolio spread across sectors can still face correlated risks if local conditions weaken."] },
      { heading: "How to evaluate a property strategy", paragraphs: ["Look for clear information about asset ownership, valuation methods, development milestones, tenant concentration, lease duration, insurance, financing and governance. Understand how the fund handles cost overruns, delays and periods without rental income.", "The Mutirikwi REIT fact sheet sets out target returns, fees and a pre-listing lock-in. Targets are not guarantees, and units may have limited liquidity before listing. Review the latest offer documents and ask the Fund Manager to explain any terms you do not understand."] },
      { heading: "Keep the source in view", paragraphs: ["This article summarizes the Mutirikwi REIT's October 2026 fact sheet and is general information only. It is not independent property research, an offer to invest or financial advice. For more on REIT basics and due diligence, read the related guide to REITs in Zimbabwe and review the official offer documents."] },
    ],
  },
  {
    slug: "reit-investment-risks-and-returns",
    title: "REIT Returns and Risks: What Zimbabwe Investors Should Check",
    description: "Understand target yields, investment risk, liquidity and fees before assessing a Zimbabwe REIT such as Mutirikwi REIT.",
    date: "2026-11-25",
    readTime: "6 min read",
    intro: "A target return is an objective, not a promise. When evaluating a REIT, investors should look beyond a headline yield and understand what could affect income, capital value, liquidity and the timing of any exit.",
    sections: [
      { heading: "Target returns are not guaranteed", paragraphs: ["The Mutirikwi REIT October 2026 fact sheet lists a 17% target IRR on property developments and a 10% per annum USD net income yield on NAV. These figures are targets. Actual outcomes can be lower or negative, and investors may lose some or all of their capital.", "Ask how a target was calculated, what assumptions it uses, whether fees and costs are reflected, and how sensitive it is to occupancy, rents, construction costs and timing. Compare projections with the risks and disclosures in the official offer documents."] },
      { heading: "Understand the main risk categories", paragraphs: ["Property income can be affected by vacancy, tenant payment problems, maintenance, changes in demand and asset valuations. Development projects add approval, construction, budget and completion risks. Currency movements, counterparties, legal changes and market liquidity can also matter.", "The Mutirikwi REIT website identifies currency, liquidity, counterparty, legal and contractual, vacancy, market and cost-overrun risks. Consider how each could affect your own financial circumstances and investment time horizon."] },
      { heading: "Check liquidity and fees", paragraphs: ["The fact sheet describes a pre-listing lock-in: units may not be sold, transferred, pledged or withdrawn between investment and listing, subject to the stated waiver process. A March 2027 listing is described as indicative, so do not treat it as a confirmed date or guaranteed exit. Confirm current restrictions and transfer arrangements directly from the official documents.", "The October 2026 fact sheet lists Fund Manager and Trustee fees. Read the complete fee schedule and understand how fees are calculated, when they are charged and how they affect net asset value and distributions."] },
      { heading: "Use a due diligence checklist", paragraphs: ["Before making a decision, confirm the current licence and offer status; identify the Fund Manager, Trustee and other service providers; review governance and valuation arrangements; understand the assets and project stage; examine fees, distribution policy and lock-in conditions; and ask how the fund reports performance and risk.", "Seek independent professional advice if needed. This article is general information, not an offer, recommendation or investment advice. Requesting a fact sheet through the website does not subscribe for units, reserve an allocation or accept payment."] },
    ],
  },
];
