"use client";

import { useState, type FormEvent } from "react";

type TeamUser = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string };

function temporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function TeamForm({ initialUsers }: { initialUsers: TeamUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [issuedPassword, setIssuedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setIssuedPassword("");
    setError(false);
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = temporaryPassword();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          role: values.get("role"),
          temporaryPassword: password,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not add staff account.");
      setUsers((current) => [result.user, ...current]);
      setIssuedPassword(password);
      setMessage(`Account created for ${result.user.email}. Share the temporary password securely; they must change it at first sign-in.`);
      form.reset();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not add staff account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="crm-team-create">
        <h2>Add an authorised staff member</h2>
        <p>Create named accounts only. A temporary password is generated in this browser and shown once after successful creation.</p>
        <form className="crm-team-form" onSubmit={submit}>
          <label>Full name<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Work email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label>Role<select name="role" defaultValue="RELATIONSHIP_MANAGER"><option value="RELATIONSHIP_MANAGER">Relationship manager</option><option value="FUND_MANAGER">Fund manager</option></select></label>
          <button className="crm-button" type="submit" disabled={busy}>{busy ? "Creating…" : "Create staff account"}</button>
        </form>
        {message && <p className={`crm-message${error ? " crm-error" : ""}`} role={error ? "alert" : "status"}>{message}</p>}
        {issuedPassword && <div className="crm-temp-password"><label htmlFor="temporary-password">One-time temporary password</label><div><input id="temporary-password" readOnly value={issuedPassword} onFocus={(event) => event.currentTarget.select()} /><button type="button" onClick={() => void navigator.clipboard.writeText(issuedPassword).then(() => setMessage("Temporary password copied. Share it privately with the new staff member."))}>Copy</button></div><small>This will not be shown again. The staff member must choose their own password on first sign-in.</small></div>}
      </section>

      <section className="crm-team-list" aria-labelledby="team-list-title">
        <h2 id="team-list-title">Authorised CRM accounts</h2>
        {users.map((user) => <article key={user.id}><div><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a></div><span>{user.role.replaceAll("_", " ").toLowerCase()}</span><small>{user.isActive ? "Active" : "Disabled"}</small></article>)}
        {!users.length && <p>No staff accounts found.</p>}
      </section>
    </>
  );
}
