"use client";

import { useState, type FormEvent } from "react";

type TeamUser = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string };
type TeamInvite = {
  id: string;
  name: string;
  email: string;
  role: string;
  expiresAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
};

function roleLabel(role: string) {
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function inviteStatus(invite: TeamInvite) {
  if (invite.acceptedAt) return { label: "Accepted", className: "accepted" };
  if (invite.revokedAt) return { label: "Revoked", className: "revoked" };
  if (new Date(invite.expiresAt).getTime() <= Date.now()) return { label: "Expired", className: "expired" };
  if (!invite.sentAt) return { label: "Email needs retry", className: "failed" };
  return { label: "Awaiting response", className: "pending" };
}

export function TeamForm({ initialUsers, initialInvites }: { initialUsers: TeamUser[]; initialInvites: TeamInvite[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [invites, setInvites] = useState(initialInvites);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [accessMessageIsError, setAccessMessageIsError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function removeUser(user: TeamUser) {
    if (!window.confirm(`Remove CRM access for ${user.name}? They will be signed out, but historical lead and audit records will be retained.`)) return;
    setBusy(user.id);
    setAccessMessage("");
    setAccessMessageIsError(false);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove staff access.");
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, isActive: false } : item));
      setAccessMessage(`CRM access removed for ${user.name}. Historical records remain available.`);
    } catch (cause) {
      setAccessMessageIsError(true);
      setAccessMessage(cause instanceof Error ? cause.message : "Could not remove staff access.");
    } finally {
      setBusy(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy("create");
    setMessage("");
    setMessageIsError(false);

    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.get("name"), email: values.get("email"), role: values.get("role") }),
      });
      const result = await response.json().catch(() => ({}));
      if (result.invite) {
        setInvites((current) => [result.invite, ...current.filter((invite) => invite.id !== result.invite.id)]);
      }
      if (!response.ok) throw new Error(result.message || result.error || "Could not send this invitation.");
      setMessage(result.message || "Invitation email sent.");
      form.reset();
    } catch (cause) {
      setMessageIsError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not send this invitation.");
    } finally {
      setBusy(null);
    }
  }

  async function resend(inviteId: string) {
    setBusy(inviteId);
    setMessage("");
    setMessageIsError(false);
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (result.expiresAt) {
        setInvites((current) => current.map((invite) => invite.id === inviteId ? { ...invite, expiresAt: result.expiresAt, sentAt: result.sentAt ?? null } : invite));
      }
      if (!response.ok) throw new Error(result.message || result.error || "Could not resend the invitation.");
      setMessage(result.message || "Invitation resent.");
    } catch (cause) {
      setMessageIsError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not resend the invitation.");
    } finally {
      setBusy(null);
    }
  }

  async function revoke(inviteId: string) {
    if (!window.confirm("Revoke this invitation? Its link will stop working immediately.")) return;
    setBusy(inviteId);
    setMessage("");
    setMessageIsError(false);
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not revoke the invitation.");
      const revokedAt = new Date().toISOString();
      setInvites((current) => current.map((invite) => invite.id === inviteId ? { ...invite, revokedAt } : invite));
      setMessage("Invitation revoked. Its link can no longer be used.");
    } catch (cause) {
      setMessageIsError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not revoke the invitation.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="crm-team-workspace">
      <section className="crm-team-create" aria-labelledby="invite-staff-title">
        <div className="crm-team-card-heading"><div><p className="crm-kicker">INVITATIONS</p><h2 id="invite-staff-title">Invite a staff member</h2></div><span className="crm-invite-lock" aria-hidden="true">↗</span></div>
        <p>We’ll email a one-time activation link that expires after 72 hours. Staff choose their own password; passwords are never sent by email.</p>
        <form className="crm-team-form" onSubmit={submit}>
          <label>Full name<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Work email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label>Workspace role<select name="role" defaultValue="RELATIONSHIP_MANAGER"><option value="RELATIONSHIP_MANAGER">Relationship manager</option><option value="FUND_MANAGER">Fund manager</option></select></label>
          <button className="crm-button" type="submit" disabled={busy !== null}>{busy === "create" ? "Sending invite…" : "Send invitation"}</button>
        </form>
        {message && <p className={`crm-message${messageIsError ? " crm-error" : ""}`} role={messageIsError ? "alert" : "status"}>{message}</p>}
      </section>

      <section className="crm-team-list crm-invite-list" aria-labelledby="invite-list-title">
        <div className="crm-team-card-heading"><div><p className="crm-kicker">ACCESS REQUESTS</p><h2 id="invite-list-title">Pending & recent invitations</h2></div><span className="crm-team-count">{invites.filter((invite) => !invite.acceptedAt && !invite.revokedAt && new Date(invite.expiresAt).getTime() > Date.now()).length} pending</span></div>
        {invites.length ? <div className="crm-team-table-wrap"><table className="crm-team-table"><thead><tr><th scope="col">Invitee</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Expires</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{invites.map((invite) => {
          const status = inviteStatus(invite);
          const canManage = !invite.acceptedAt && !invite.revokedAt;
          return <tr key={invite.id}><td><strong>{invite.name}</strong><a href={`mailto:${invite.email}`}>{invite.email}</a></td><td>{roleLabel(invite.role)}</td><td><span className={`crm-invite-status ${status.className}`}>{status.label}</span></td><td>{formatDate(invite.expiresAt)}</td><td className="crm-invite-actions">{canManage && <><button type="button" onClick={() => void resend(invite.id)} disabled={busy !== null}>{busy === invite.id ? "Working…" : "Resend"}</button><button type="button" className="revoke" onClick={() => void revoke(invite.id)} disabled={busy !== null}>Revoke</button></>}</td></tr>;
        })}</tbody></table></div> : <p className="crm-team-empty">No invitations yet. Invite an authorised staff member to get started.</p>}
      </section>

      <section className="crm-team-list crm-members-list" aria-labelledby="team-list-title">
        <div className="crm-team-card-heading"><div><p className="crm-kicker">STAFF DIRECTORY</p><h2 id="team-list-title">CRM accounts</h2></div><span className="crm-team-count">{users.length} accounts</span></div>
        {accessMessage && <p className={`crm-message${accessMessageIsError ? " crm-error" : ""}`} role={accessMessageIsError ? "alert" : "status"}>{accessMessage}</p>}
        {users.length ? <div className="crm-team-table-wrap"><table className="crm-team-table"><thead><tr><th scope="col">Staff member</th><th scope="col">Role</th><th scope="col">Access</th><th scope="col">Added</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a></td><td>{roleLabel(user.role)}</td><td><span className={`crm-invite-status ${user.isActive ? "accepted" : "revoked"}`}>{user.isActive ? "Active" : "Access removed"}</span></td><td>{formatDate(user.createdAt)}</td><td className="crm-invite-actions">{user.isActive && ["SUPER_ADMIN", "FUND_MANAGER", "RELATIONSHIP_MANAGER"].includes(user.role) && <button type="button" className="revoke" onClick={() => void removeUser(user)} disabled={busy !== null}>{busy === user.id ? "Removing…" : "Remove access"}</button>}</td></tr>)}</tbody></table></div> : <p className="crm-team-empty">There are no staff accounts yet.</p>}
        <p className="crm-small-print">Staff invitations and account changes are recorded in the CRM audit log. Only fund managers and relationship managers can be invited here; super-admin access remains operator-provisioned.</p>
      </section>
    </div>
  );
}
