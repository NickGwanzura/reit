"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AdminFrame } from "@/app/admin/admin-frame";

const stages = [
  "NEW_LEAD", "CONTACTED", "QUALIFIED", "INTERESTED", "KYC_STARTED", "KYC_SUBMITTED",
  "KYC_UNDER_REVIEW", "KYC_APPROVED", "SUBSCRIPTION_STARTED", "SUBSCRIPTION_SUBMITTED",
  "COMPLIANCE_REVIEW", "APPROVED", "ONBOARDED_INVESTOR", "DEFERRED", "LOST",
] as const;

const stageLabel = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const human = (value?: string | null) => value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";
const dateTime = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "No due date";

export type CrmUser = { id: string; name: string };
export type CrmTask = {
  id: string;
  title: string;
  dueAt: string | null;
  type: string;
  priority: string;
  leadId: string;
  leadName: string;
};
export type CrmLead = {
  id: string;
  status: string;
  intendedInvestmentRange: string | null;
  timeline: string | null;
  preferredContact: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  lastSubmissionAt: string;
  firstContactAt: string | null;
  retentionReviewAt: string | null;
  retentionReviewNote: string | null;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    country: string | null;
    investorType: string;
    doNotContactAt: string | null;
    doNotContactReason: string | null;
    doNotContactClearedAt: string | null;
    doNotContactClearReason: string | null;
  };
  assignedUser: CrmUser | null;
  enquiries: Array<{ id: string; email: string; createdAt: string }>;
  activities: Array<{ id: string; type: string; body: string | null; createdAt: string; actorName: string }>;
  tasks: Array<{ id: string; title: string; dueAt: string | null; type: string; priority: string }>;
};

type Props = {
  name: string;
  role: string;
  leads: CrmLead[];
  tasks: CrmTask[];
  users: CrmUser[];
  initialStatusFilter: string;
  filterSummary: string;
  unassignedLeads: Array<{ id: string; name: string; email: string; doNotContact: boolean; createdAt: string }>;
  overdueLeads: Array<{ id: string; name: string; email: string; createdAt: string; dueAt: string; assignedTo: string | null }>;
  counts: { total: number; new: number; qualified: number; unassigned: number; overdue: number; statuses: Record<string, number> };
};

async function requestJson(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The change could not be saved.");
  return data;
}

export function LeadDashboard({ name, role, leads, tasks, users, unassignedLeads, overdueLeads, counts, initialStatusFilter, filterSummary }: Props) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(initialStatusFilter);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const mayAssign = role === "SUPER_ADMIN" || role === "FUND_MANAGER";

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStage = stageFilter === "ALL" || lead.status === stageFilter;
      const matchesQuery = !query || [
        lead.contact.firstName,
        lead.contact.lastName,
        lead.contact.email,
        lead.contact.country,
        lead.contact.phone,
        lead.contact.whatsapp,
      ].some((value) => value?.toLowerCase().includes(query));
      return matchesStage && matchesQuery;
    });
  }, [leads, search, stageFilter]);

  async function updateLead(leadId: string, payload: { status?: string; assignedUserId?: string | null; doNotContact?: boolean; doNotContactReason?: string; doNotContactClearReason?: string; retentionReview?: boolean; retentionReviewNote?: string }) {
    setBusy(leadId);
    setMessages((current) => ({ ...current, [leadId]: "Saving…" }));
    try {
      await requestJson(`/api/admin/leads/${leadId}`, "PATCH", payload);
      window.location.reload();
    } catch (error) {
      setMessages((current) => ({ ...current, [leadId]: error instanceof Error ? error.message : "Could not save this change." }));
    } finally {
      setBusy(null);
    }
  }

  async function submitLeadControl(event: FormEvent<HTMLFormElement>, leadId: string, control: "doNotContact" | "doNotContactClear" | "retentionReview") {
    event.preventDefault();
    const form = event.currentTarget;
    const field = control === "doNotContact" ? "doNotContactReason" : control === "doNotContactClear" ? "doNotContactClearReason" : "retentionReviewNote";
    const data = new FormData(form);
    if (control === "doNotContactClear") await updateLead(leadId, { doNotContact: false, doNotContactClearReason: String(data.get("reason") ?? "").trim() });
    else await updateLead(leadId, { [control]: true, [field]: String(data.get("reason") ?? "").trim() });
  }

  async function addActivity(event: FormEvent<HTMLFormElement>, leadId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(leadId);
    try {
      await requestJson(`/api/admin/leads/${leadId}/activities`, "POST", {
        type: data.get("type"),
        body: data.get("body"),
      });
      window.location.reload();
    } catch (error) {
      setMessages((current) => ({ ...current, [leadId]: error instanceof Error ? error.message : "Could not save this activity." }));
    } finally {
      setBusy(null);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>, leadId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const dueAt = String(data.get("dueAt") || "");
    setBusy(leadId);
    try {
      await requestJson(`/api/admin/leads/${leadId}/tasks`, "POST", {
        title: data.get("title"),
        type: data.get("type"),
        priority: data.get("priority"),
        ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}),
      });
      window.location.reload();
    } catch (error) {
      setMessages((current) => ({ ...current, [leadId]: error instanceof Error ? error.message : "Could not create the follow-up." }));
    } finally {
      setBusy(null);
    }
  }

  async function completeTask(taskId: string) {
    setBusy(taskId);
    try {
      await requestJson(`/api/admin/tasks/${taskId}`, "PATCH", { status: "COMPLETED" });
      window.location.reload();
    } catch {
      setMessages((current) => ({ ...current, tasks: "Could not complete this task. Refresh and try again." }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminFrame name={name} role={role}>
      <main className="crm-main">
        <div className="crm-page-heading">
          <div><p className="crm-kicker">MUTIRIKWI REIT · RELATIONSHIP MANAGEMENT</p><h1>Lead workspace</h1><p>Enquiries, follow-ups and pipeline movement in one place.</p></div>
          <a className="crm-public-link" href="/#enquire">View public website ↗</a>
        </div>

        <div className="crm-metrics" aria-label="Lead summary">
          <article><span>LEADS IN VIEW</span><strong>{counts.total}</strong><small>Across the visible pipeline</small></article>
          <article><span>NEW ENQUIRIES</span><strong>{counts.new}</strong><small>Current intake stage</small></article>
          <article><span>QUALIFIED / INTERESTED</span><strong>{counts.qualified}</strong><small>Active conversations</small></article>
          <article><span>UNASSIGNED / OVERDUE</span><strong>{counts.unassigned} / {counts.overdue}</strong><small>Unassigned · first-contact SLA missed</small></article>
          <article><span>OPEN FOLLOW-UPS</span><strong>{tasks.length}</strong><small>Next actions scheduled</small></article>
        </div>

        {(mayAssign || overdueLeads.length > 0) && <section className="crm-work-queues" aria-label="Lead assignment and response queues">
          {mayAssign && <article className="crm-queue-card">
            <div className="crm-section-heading"><div><p className="crm-kicker">ASSIGNMENT QUEUE</p><h2>Unassigned enquiries</h2></div><strong>{counts.unassigned}</strong></div>
            {unassignedLeads.length ? <ul>{unassignedLeads.map((lead) => <li key={lead.id}><div><strong>{lead.name}</strong>{lead.doNotContact ? <span>{lead.email} · Do not contact</span> : <a href={`mailto:${lead.email}`}>{lead.email}</a>}<small>Received {dateTime(lead.createdAt)}</small></div><label><span className="sr-only">Assign {lead.name}</span><select defaultValue="" disabled={busy === lead.id} onChange={(event) => event.target.value && updateLead(lead.id, { assignedUserId: event.target.value })}><option value="">Assign to…</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label></li>)}</ul> : <p className="crm-muted">All new enquiries are assigned.</p>}
            {counts.unassigned > unassignedLeads.length && <small className="crm-queue-more">Showing oldest {unassignedLeads.length}; {counts.unassigned - unassignedLeads.length} more remain in the queue.</small>}
          </article>}
          {overdueLeads.length > 0 && <article className="crm-queue-card crm-queue-overdue">
            <div className="crm-section-heading"><div><p className="crm-kicker">FIRST-CONTACT SLA</p><h2>Needs a response</h2></div><strong>{counts.overdue}</strong></div>
            <p className="crm-queue-explainer">First contact is due within eight business hours (Harare time, weekdays 08:00–17:00). Public holidays are not currently excluded.</p>
            <ul>{overdueLeads.map((lead) => <li key={lead.id}><div><strong>{lead.name}</strong><a href={`mailto:${lead.email}`}>{lead.email}</a><small>{lead.assignedTo ? `Assigned to ${lead.assignedTo}` : "Unassigned"} · due {dateTime(lead.dueAt)}</small></div><button type="button" disabled={busy === lead.id} onClick={() => updateLead(lead.id, { status: "CONTACTED" })}>Mark contacted</button></li>)}</ul>
          </article>}
        </section>}

        <section className="crm-section" aria-labelledby="leads-title">
          <div className="crm-section-heading">
            <div><p className="crm-kicker">PIPELINE</p><h2 id="leads-title">Recent leads</h2>{filterSummary && <p className="crm-filter-summary">Filtered report drill-down · {filterSummary} <a href="/admin">Clear</a></p>}</div>
            <div className="crm-filters">
              <label className="crm-search"><span className="sr-only">Search leads</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone…" /></label>
              <label><span className="sr-only">Filter by pipeline stage</span><select value={stageFilter} disabled={initialStatusFilter !== "ALL"} onChange={(event) => setStageFilter(event.target.value)}><option value="ALL">All stages</option>{stages.map((stage) => <option key={stage} value={stage}>{stageLabel(stage)}{counts.statuses[stage] ? ` · ${counts.statuses[stage]}` : ""}</option>)}</select></label>
            </div>
          </div>

          {visibleLeads.length === 0 ? (
            <div className="crm-empty"><span>✳</span><h3>{leads.length ? "No matching leads" : "No leads yet"}</h3><p>{leads.length ? "Try a different search or pipeline stage." : "Website enquiries will appear here as soon as someone submits the form."}</p></div>
          ) : (
            <div className="crm-lead-list">
              {visibleLeads.map((lead) => (
                <article className="crm-lead-card" id={`lead-${lead.id}`} key={lead.id}>
                  <div className="crm-lead-top">
                    <div className="crm-person">
                      <div className="crm-avatar" aria-hidden="true">{lead.contact.firstName.slice(0, 1)}{lead.contact.lastName.slice(0, 1)}</div>
                      <div><h3>{lead.contact.firstName} {lead.contact.lastName}</h3>{lead.contact.doNotContactAt ? <span>{lead.contact.email}</span> : <a href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a>}<small>{lead.contact.country || "Country not supplied"} · {human(lead.contact.investorType)}</small>{lead.retentionReviewAt && <span className="crm-flag-badge">Retention review requested</span>}{lead.contact.doNotContactAt && <span className="crm-suppression-badge">Do not contact</span>}</div>
                    </div>
                    <div className="crm-lead-actions">
                      <label><span>STAGE</span><select value={lead.status} disabled={busy === lead.id} onChange={(event) => updateLead(lead.id, { status: event.target.value })}>{stages.map((stage) => <option value={stage} key={stage}>{stageLabel(stage)}</option>)}</select></label>
                      {mayAssign && <label><span>RELATIONSHIP MANAGER</span><select value={lead.assignedUser?.id ?? ""} disabled={busy === lead.id} onChange={(event) => updateLead(lead.id, { assignedUserId: event.target.value || null })}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>}
                    </div>
                  </div>

                  <div className="crm-lead-facts">
                    <div><span>INTENDED RANGE</span><strong>{human(lead.intendedInvestmentRange)}</strong></div>
                    <div><span>TIMELINE</span><strong>{human(lead.timeline)}</strong></div>
                    <div><span>PREFERRED CONTACT</span><strong>{human(lead.preferredContact)}</strong></div>
                    <div><span>ENQUIRIES</span><strong>{lead.enquiries.length === 3 ? "3+" : lead.enquiries.length}</strong></div>
                    <div><span>LAST SUBMITTED</span><strong>{dateTime(lead.lastSubmissionAt)}</strong></div>
                  </div>

                  <details className="crm-details">
                    <summary>Open lead profile <span>View contacts, activity and next steps</span></summary>
                    <div className="crm-profile-grid">
                      <section className="crm-profile-contact"><h4>Contact details</h4><p>{lead.contact.phone ? lead.contact.doNotContactAt ? lead.contact.phone : <a href={`tel:${lead.contact.phone}`}>{lead.contact.phone}</a> : "Phone not supplied"}</p><p>{lead.contact.whatsapp ? lead.contact.doNotContactAt ? `WhatsApp ${lead.contact.whatsapp}` : <a href={`https://wa.me/${lead.contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp {lead.contact.whatsapp} ↗</a> : "WhatsApp not supplied"}</p><p>Source: {lead.source || "Website"}</p><p>Last updated: {dateTime(lead.updatedAt)}</p>
                        <div className="crm-data-controls"><h5>Consent & retention</h5>
                          {lead.contact.doNotContactAt ? <div className="crm-control-state crm-control-suppressed"><strong>Do not contact</strong><p>{lead.contact.doNotContactReason || "Contact suppression recorded."}</p><form onSubmit={(event) => submitLeadControl(event, lead.id, "doNotContactClear")}><label><span>Document renewed permission before clearing</span><textarea name="reason" rows={2} required minLength={3} maxLength={500} placeholder="How and when was renewed permission received?" /></label><button type="submit" disabled={busy === lead.id}>Clear suppression</button></form></div> : <><form onSubmit={(event) => submitLeadControl(event, lead.id, "doNotContact")}><label><span>Record a do-not-contact request</span><textarea name="reason" rows={2} required minLength={3} maxLength={500} placeholder="Reason or request received…" /></label><button type="submit" disabled={busy === lead.id}>Suppress contact</button></form>{lead.contact.doNotContactClearedAt && <p className="crm-suppression-history">Previous suppression cleared {dateTime(lead.contact.doNotContactClearedAt)}. Basis: {lead.contact.doNotContactClearReason || "Renewed permission recorded."}</p>}</>}
                          {lead.retentionReviewAt ? <div className="crm-control-state"><strong>Flagged for retention review</strong><p>{lead.retentionReviewNote}</p><button type="button" disabled={busy === lead.id} onClick={() => updateLead(lead.id, { retentionReview: false })}>Clear review flag</button></div> : <form onSubmit={(event) => submitLeadControl(event, lead.id, "retentionReview")}><label><span>Flag for manual retention review</span><textarea name="reason" rows={2} required minLength={3} maxLength={1000} placeholder="Why should this record be reviewed?" /></label><button type="submit" disabled={busy === lead.id}>Flag record</button></form>}
                          <small>No records are automatically deleted. Set a retention period with your compliance/legal team before introducing automated deletion.</small>
                        </div>
                      </section>
                      <section className="crm-activity"><h4>History & communication</h4>
                        <ul>{lead.activities.map((activity) => <li key={activity.id}><span className="crm-activity-dot" /><div><strong>{human(activity.type)}</strong><p>{activity.body}</p><small>{activity.actorName} · {dateTime(activity.createdAt)}</small></div></li>)}</ul>
                        <form className="crm-inline-form" onSubmit={(event) => addActivity(event, lead.id)}>
                          <label><span>LOG AN ACTIVITY</span><select name="type" defaultValue="NOTE_ADDED"><option value="NOTE_ADDED">Internal note</option>{!lead.contact.doNotContactAt && <><option value="PHONE_CALL">Phone call</option><option value="WHATSAPP_MESSAGE">WhatsApp interaction</option><option value="EMAIL">Email</option><option value="MEETING">Meeting</option></>}</select></label>
                          <textarea name="body" rows={3} placeholder="Add a note or brief contact outcome…" required maxLength={5000} />
                          <button className="crm-button crm-button-small" disabled={busy === lead.id}>Save activity</button>
                        </form>
                      </section>
                      <section className="crm-follow-up"><h4>Open follow-ups</h4>
                        {lead.tasks.length ? <ul className="crm-task-list">{lead.tasks.map((task) => <li key={task.id}><span><strong>{task.title}</strong><small>{human(task.type)} · {dateTime(task.dueAt)}</small></span><button type="button" onClick={() => completeTask(task.id)} disabled={busy === task.id}>Complete</button></li>)}</ul> : <p className="crm-muted">No open tasks for this lead.</p>}
                        <form className="crm-inline-form" onSubmit={(event) => addTask(event, lead.id)}>
                          <label><span>CREATE A FOLLOW-UP</span><input name="title" placeholder="e.g. Call about the project pack" required minLength={3} maxLength={160} /></label>
                          <div className="crm-task-fields"><label><span>TYPE</span><select name="type" defaultValue="FOLLOW_UP"><option value="FOLLOW_UP">Follow-up</option><option value="CALL">Call</option><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option><option value="MEETING">Meeting</option></select></label><label><span>PRIORITY</span><select name="priority" defaultValue="NORMAL"><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option></select></label></div>
                          <label><span>DUE DATE</span><input type="datetime-local" name="dueAt" /></label>
                          <button className="crm-button crm-button-small" disabled={busy === lead.id}>Create task</button>
                        </form>
                      </section>
                    </div>
                    {messages[lead.id] && <p className="crm-message" role="status">{messages[lead.id]}</p>}
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="crm-section crm-follow-ups-section" id="follow-ups" aria-labelledby="followups-title">
          <div className="crm-section-heading"><div><p className="crm-kicker">NEXT ACTIONS</p><h2 id="followups-title">Open follow-ups</h2></div><span className="crm-muted">Your next 12 scheduled tasks</span></div>
          {tasks.length ? <div className="crm-global-tasks">{tasks.map((task) => <article key={task.id}><div className="crm-task-icon">↗</div><div><h3>{task.title}</h3><p>{task.leadName} · {human(task.type)} · {human(task.priority)}</p></div><time>{dateTime(task.dueAt)}</time><button type="button" onClick={() => completeTask(task.id)} disabled={busy === task.id}>Mark complete</button></article>)}</div> : <div className="crm-empty crm-empty-compact"><h3>No active follow-ups</h3><p>Create a task from a lead profile to keep the next step visible.</p></div>}
          {messages.tasks && <p className="crm-message crm-error" role="alert">{messages.tasks}</p>}
        </section>
        <footer className="crm-footer">Private lead-management workspace · Enquiry interest is not settled capital or an investment allocation.</footer>
      </main>
    </AdminFrame>
  );
}
