"use client";

import { useState } from "react";

export type DuplicateCandidate = {
  pairKey: string;
  leftLeadId: string;
  rightLeadId: string;
  leftName: string;
  rightName: string;
  leftEmail: string;
  rightEmail: string;
  country: string;
  leftCreatedAt: string;
  rightCreatedAt: string;
};
export type RetentionReview = { id: string; status: string; flaggedAt: string; note: string; name: string; email: string };

const displayDate = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function DataQualityView({ duplicates, retention }: { duplicates: DuplicateCandidate[]; retention: RetentionReview[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function review(candidate: DuplicateCandidate, outcome: "same_person" | "different_people") {
    setBusy(candidate.pairKey);
    setError("");
    try {
      const response = await fetch("/api/admin/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leftLeadId: candidate.leftLeadId, rightLeadId: candidate.rightLeadId, outcome }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save duplicate review.");
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save duplicate review.");
    } finally {
      setBusy(null);
    }
  }

  return <div className="crm-quality-grid">
    <section className="crm-quality-card" aria-labelledby="duplicates-title">
      <header><div><p className="crm-kicker">POSSIBLE MATCHES</p><h2 id="duplicates-title">Duplicate review</h2><p>Same first name, last name and country. Verify identity before making any decision.</p></div><strong>{duplicates.length}</strong></header>
      {error && <p className="crm-message crm-error" role="alert">{error}</p>}
      {duplicates.length ? <div className="crm-duplicate-list">{duplicates.map((item) => <article key={item.pairKey}>
        <div className="crm-duplicate-person"><span>RECORD 1</span><strong>{item.leftName}</strong><a href={`mailto:${item.leftEmail}`}>{item.leftEmail}</a><small>{item.country} · lead created {displayDate(item.leftCreatedAt)}</small></div>
        <span className="crm-duplicate-versus" aria-hidden="true">↔</span>
        <div className="crm-duplicate-person"><span>RECORD 2</span><strong>{item.rightName}</strong><a href={`mailto:${item.rightEmail}`}>{item.rightEmail}</a><small>{item.country} · lead created {displayDate(item.rightCreatedAt)}</small></div>
        <div className="crm-duplicate-actions"><button type="button" disabled={busy === item.pairKey} onClick={() => review(item, "same_person")}>Same person · review</button><button type="button" disabled={busy === item.pairKey} onClick={() => review(item, "different_people")}>Different people</button></div>
      </article>)}</div> : <p className="crm-report-empty">No unreviewed name-and-country matches were found.</p>}
      <p className="crm-report-footnote">A review is audited. The “same person” choice does not merge or alter either record; a manager must resolve the records separately.</p>
    </section>

    <section className="crm-quality-card" aria-labelledby="retention-title">
      <header><div><p className="crm-kicker">MANUAL REVIEW ONLY</p><h2 id="retention-title">Retention review flags</h2><p>Records are flagged by staff for compliance/legal review. Nothing is deleted automatically.</p></div><strong>{retention.length}</strong></header>
      {retention.length ? <ul className="crm-retention-list">{retention.map((item) => <li key={item.id}><div><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a><p>{item.note}</p><small>{item.status.replaceAll("_", " ")} · flagged {displayDate(item.flaggedAt)}</small></div><a className="crm-retention-open" href={`/admin?leadId=${encodeURIComponent(item.id)}`}>Open lead record</a></li>)}</ul> : <p className="crm-report-empty">No records are currently flagged. Flag an enquiry from its lead profile.</p>}
      <p className="crm-report-footnote">Agree a retention period with your compliance/legal team before adding automatic expiry or deletion.</p>
    </section>
  </div>;
}
