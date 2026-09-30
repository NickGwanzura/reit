"use client";

type ReportPoint = { name: string; count: number };
type TrendPoint = { label: string; count: number };
export type LeadReportData = {
  generatedAt: string;
  totalLeads: number;
  leadsLast30: number;
  leadsPrevious30: number;
  totalEnquiries: number;
  enquiriesLast30: number;
  onboarded: number;
  openTasks: number;
  overdueTasks: number;
  trend: TrendPoint[];
  statuses: ReportPoint[];
  sources: ReportPoint[];
};

const statusNames: Record<string, string> = {
  NEW_LEAD: "New lead", CONTACTED: "Contacted", QUALIFIED: "Qualified", INTERESTED: "Interested",
  KYC_STARTED: "KYC started", KYC_SUBMITTED: "KYC submitted", KYC_UNDER_REVIEW: "KYC under review",
  KYC_APPROVED: "KYC approved", SUBSCRIPTION_STARTED: "Subscription started", SUBSCRIPTION_SUBMITTED: "Subscription submitted",
  COMPLIANCE_REVIEW: "Compliance review", APPROVED: "Approved", ONBOARDED_INVESTOR: "Onboarded investor",
  DEFERRED: "Deferred", LOST: "Lost",
};

function csvCell(value: string | number) {
  const text = String(value);
  const safeText = /^[\s]*[=+@\-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function downloadCsv(data: LeadReportData) {
  const rows: (string | number)[][] = [
    ["Mutirikwi REIT CRM lead report"],
    ["Generated at", new Date(data.generatedAt).toISOString()],
    [],
    ["Metric", "Value"],
    ["Total leads", data.totalLeads], ["Leads received in last 30 days", data.leadsLast30],
    ["Leads received in previous 30 days", data.leadsPrevious30], ["Total enquiries", data.totalEnquiries],
    ["Enquiries in last 30 days", data.enquiriesLast30], ["Onboarded investors", data.onboarded],
    ["Open follow-ups", data.openTasks], ["Overdue follow-ups", data.overdueTasks],
    [], ["Monthly lead trend"], ["Month", "Leads"], ...data.trend.map((item) => [item.label, item.count]),
    [], ["Pipeline by status"], ["Status", "Leads"], ...data.statuses.map((item) => [statusNames[item.name] ?? item.name, item.count]),
    [], ["Lead sources"], ["Source", "Leads"], ...data.sources.map((item) => [item.name, item.count]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `mutirikwi-reit-crm-report-${new Date(data.generatedAt).toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function number(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function LeadReports({ data }: { data: LeadReportData }) {
  const maxTrend = Math.max(1, ...data.trend.map((item) => item.count));
  const maxStatus = Math.max(1, ...data.statuses.map((item) => item.count));
  const maxSource = Math.max(1, ...data.sources.map((item) => item.count));
  const change = data.leadsLast30 - data.leadsPrevious30;

  return (
    <div className="crm-report-workspace">
      <div className="crm-report-topline"><p>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt))}</p><button className="crm-button crm-report-export" type="button" onClick={() => downloadCsv(data)}>Export report CSV <span aria-hidden="true">↓</span></button></div>
      <section className="crm-report-kpis" aria-label="Lead report summary">
        <article><span>Total leads</span><strong>{number(data.totalLeads)}</strong><small>All-time lead records</small></article>
        <article><span>New leads · 30 days</span><strong>{number(data.leadsLast30)}</strong><small className={change > 0 ? "crm-report-up" : change < 0 ? "crm-report-down" : ""}>{change > 0 ? "+" : ""}{number(change)} vs previous 30 days</small></article>
        <article><span>Enquiries · 30 days</span><strong>{number(data.enquiriesLast30)}</strong><small>{number(data.totalEnquiries)} received all-time</small></article>
        <article><span>Onboarded investors</span><strong>{number(data.onboarded)}</strong><small>{data.totalLeads ? `${Math.round((data.onboarded / data.totalLeads) * 100)}% of recorded leads` : "No leads recorded yet"}</small></article>
        <article><span>Open follow-ups</span><strong>{number(data.openTasks)}</strong><small className={data.overdueTasks ? "crm-report-down" : ""}>{number(data.overdueTasks)} overdue</small></article>
      </section>

      <section className="crm-report-card crm-report-trend" aria-labelledby="crm-trend-title">
        <div className="crm-report-card-head"><div><p className="crm-kicker">INTAKE</p><h2 id="crm-trend-title">Lead trend</h2></div><span>Last six months</span></div>
        <div className="crm-report-chart" role="img" aria-label={`Monthly lead counts: ${data.trend.map((item) => `${item.label} ${item.count}`).join(", ")}`}>
          {data.trend.map((item) => <div className="crm-report-bar-group" key={item.label}><strong>{number(item.count)}</strong><div className="crm-report-bar-track"><span style={{ height: `${Math.max(item.count ? 8 : 0, (item.count / maxTrend) * 100)}%` }} /></div><small>{item.label}</small></div>)}
        </div>
      </section>

      <div className="crm-report-lower-grid">
        <section className="crm-report-card" aria-labelledby="crm-pipeline-title">
          <div className="crm-report-card-head"><div><p className="crm-kicker">PIPELINE</p><h2 id="crm-pipeline-title">Leads by stage</h2></div><span>{number(data.totalLeads)} total</span></div>
          {data.statuses.length ? <ul className="crm-report-breakdown">{data.statuses.map((item) => <li key={item.name}><div><span>{statusNames[item.name] ?? item.name}</span><strong>{number(item.count)}</strong></div><span className="crm-report-meter"><i style={{ width: `${(item.count / maxStatus) * 100}%` }} /></span></li>)}</ul> : <p className="crm-report-empty">Lead stages will appear here as enquiries arrive.</p>}
        </section>
        <section className="crm-report-card" aria-labelledby="crm-sources-title">
          <div className="crm-report-card-head"><div><p className="crm-kicker">ACQUISITION</p><h2 id="crm-sources-title">Lead sources</h2></div><span>{data.sources.length} {data.sources.length === 1 ? "source" : "sources"}</span></div>
          {data.sources.length ? <ul className="crm-report-breakdown">{data.sources.map((item) => <li key={item.name}><div><span>{item.name}</span><strong>{number(item.count)}</strong></div><span className="crm-report-meter"><i style={{ width: `${(item.count / maxSource) * 100}%` }} /></span></li>)}</ul> : <p className="crm-report-empty">Source breakdown will appear here as leads are recorded.</p>}
        </section>
      </div>
      <p className="crm-report-footnote">CSV exports contain aggregate counts only; investor names, emails, phone numbers and enquiry details are not included.</p>
    </div>
  );
}
