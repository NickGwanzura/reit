"use client";

import { useState } from "react";

type ReportPoint = { name: string; count: number };
type TrendPoint = { label: string; count: number };
export type LeadReportData = {
  generatedAt: string;
  range: { from: string; to: string };
  totalLeads: number;
  totalEnquiries: number;
  qualified: number;
  onboarded: number;
  conversionPercent: number;
  averageFirstResponseMinutes: number | null;
  unassigned: number;
  openTasks: number;
  overdueTasks: number;
  overdueFirstContact: number;
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

function number(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function drilldownUrl(data: LeadReportData, filter: { status?: string; source?: string }) {
  const params = new URLSearchParams({ from: data.range.from, to: data.range.to, ...(filter.status ? { status: filter.status } : {}), ...(filter.source !== undefined ? { source: filter.source } : {}) });
  return `/admin?${params.toString()}`;
}

export function LeadReports({ data, canExport, rangeError }: { data: LeadReportData; canExport: boolean; rangeError: string | null }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const maxTrend = Math.max(1, ...data.trend.map((item) => item.count));
  const maxStatus = Math.max(1, ...data.statuses.map((item) => item.count));
  const maxSource = Math.max(1, ...data.sources.map((item) => item.count));

  async function exportReport() {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.range),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "The report export failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mutirikwi-reit-crm-report-${data.range.from}-to-${data.range.to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "The report export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="crm-report-workspace">
      <div className="crm-report-topline">
        <p>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt))}</p>
        {canExport && <button className="crm-button crm-report-export" type="button" disabled={exporting} onClick={exportReport}>{exporting ? "Preparing export…" : "Export audited CSV"} <span aria-hidden="true">↓</span></button>}
      </div>
      <form className="crm-report-filters" method="get">
        <div><p className="crm-kicker">REPORT PERIOD</p><strong>Filter lead records by submission date</strong></div>
        <label><span>From</span><input aria-label="From date" name="from" type="date" defaultValue={data.range.from} /></label>
        <label><span>To</span><input aria-label="To date" name="to" type="date" defaultValue={data.range.to} /></label>
        <button className="crm-button crm-button-small" type="submit">Apply dates</button>
        <a href="/admin/reports">Reset</a>
      </form>
      {rangeError && <p className="crm-message crm-error" role="alert">{rangeError} Showing the default six-month period.</p>}
      {exportError && <p className="crm-message crm-error" role="alert">{exportError}</p>}

      <section className="crm-report-kpis" aria-label="Lead report summary">
        <article><span>LEADS RECEIVED</span><strong>{number(data.totalLeads)}</strong><small>{data.range.from} to {data.range.to}</small></article>
        <article><span>ENQUIRIES</span><strong>{number(data.totalEnquiries)}</strong><small>Enquiry submissions in period</small></article>
        <article><span>QUALIFIED / INTERESTED</span><strong>{number(data.qualified)}</strong><small>Current stage within this lead cohort</small></article>
        <article><span>ONBOARDED INVESTORS</span><strong>{number(data.onboarded)}</strong><small>{data.conversionPercent}% current onboarded share—not historical stage conversion</small></article>
        <article><span>AVERAGE FIRST RESPONSE</span><strong>{data.averageFirstResponseMinutes === null ? "—" : data.averageFirstResponseMinutes < 60 ? `${data.averageFirstResponseMinutes}m` : `${(data.averageFirstResponseMinutes / 60).toFixed(1)}h`}</strong><small>Among leads with a recorded first contact</small></article>
        <article><span>UNASSIGNED NEW LEADS</span><strong>{number(data.unassigned)}</strong><small>In the selected period</small></article>
        <article><span>OPEN FOLLOW-UPS</span><strong>{number(data.openTasks)}</strong><small className={data.overdueTasks ? "crm-report-down" : ""}>{number(data.overdueTasks)} overdue</small></article>
        <article><span>FIRST CONTACT OVERDUE</span><strong>{number(data.overdueFirstContact)}</strong><small>Eight-business-hour SLA missed</small></article>
      </section>

      <section className="crm-report-card crm-report-trend" aria-labelledby="crm-trend-title">
        <div className="crm-report-card-head"><div><p className="crm-kicker">INTAKE</p><h2 id="crm-trend-title">Monthly lead intake</h2></div><span>{data.range.from} — {data.range.to}</span></div>
        <div className="crm-report-chart" style={{ gridTemplateColumns: `repeat(${Math.max(data.trend.length, 1)}, minmax(44px, 1fr))` }} role="img" aria-label={`Monthly lead counts: ${data.trend.map((item) => `${item.label} ${item.count}`).join(", ")}`}>
          {data.trend.map((item) => <div className="crm-report-bar-group" key={item.label}><strong>{number(item.count)}</strong><div className="crm-report-bar-track"><span style={{ height: `${Math.max(item.count ? 8 : 0, (item.count / maxTrend) * 100)}%` }} /></div><small>{item.label}</small></div>)}
        </div>
      </section>

      <div className="crm-report-lower-grid">
        <section className="crm-report-card" aria-labelledby="crm-pipeline-title">
          <div className="crm-report-card-head"><div><p className="crm-kicker">PIPELINE</p><h2 id="crm-pipeline-title">Current stage distribution</h2></div><span>{number(data.totalLeads)} leads</span></div>
          {data.statuses.length ? <ul className="crm-report-breakdown">{data.statuses.map((item) => <li key={item.name}><div><a href={drilldownUrl(data, { status: item.name })}>{statusNames[item.name] ?? item.name}</a><strong>{number(item.count)}</strong></div><span className="crm-report-meter"><i style={{ width: `${(item.count / maxStatus) * 100}%` }} /></span></li>)}</ul> : <p className="crm-report-empty">Lead stages will appear here as enquiries arrive.</p>}
        </section>
        <section className="crm-report-card" aria-labelledby="crm-sources-title">
          <div className="crm-report-card-head"><div><p className="crm-kicker">ACQUISITION</p><h2 id="crm-sources-title">Lead sources</h2></div><span>{data.sources.length} {data.sources.length === 1 ? "source" : "sources"}</span></div>
          {data.sources.length ? <ul className="crm-report-breakdown">{data.sources.map((item) => <li key={item.name}><div><a href={drilldownUrl(data, { source: item.name === "Not specified" ? "" : item.name })}>{item.name}</a><strong>{number(item.count)}</strong></div><span className="crm-report-meter"><i style={{ width: `${(item.count / maxSource) * 100}%` }} /></span></li>)}</ul> : <p className="crm-report-empty">Source breakdown will appear here as leads are recorded.</p>}
        </section>
      </div>
      <p className="crm-report-footnote">Response time runs from lead creation to first recorded contact or first stage advance. Stage distribution and onboarded share describe current CRM status, not historical conversion. CSV exports contain aggregate data only; only Super Admins and Fund Managers can export, and each export is audited.</p>
    </div>
  );
}
