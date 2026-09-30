"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function AcceptInviteForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(false);
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    if (password !== values.get("confirmPassword")) {
      setError(true);
      setMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not activate this account.");
      setComplete(true);
      setMessage("Your staff account is active. Sign in with your email and the password you just created.");
      form.reset();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not activate this account.");
    } finally {
      setBusy(false);
    }
  }

  if (complete) return <div className="crm-invite-success"><p className="crm-message" role="status">{message}</p><Link className="crm-button crm-invite-signin" href="/admin/login">Continue to staff sign in</Link></div>;

  return (
    <form className="crm-auth-form" onSubmit={submit}>
      <label>Choose a password<input type="password" name="password" autoComplete="new-password" required minLength={16} maxLength={72} /></label>
      <p className="crm-password-hint">Use at least 16 characters. Your password is stored securely and is limited to 72 UTF-8 bytes.</p>
      <label>Confirm password<input type="password" name="confirmPassword" autoComplete="new-password" required minLength={16} maxLength={72} /></label>
      {message && <p className={`crm-message${error ? " crm-error" : ""}`} role={error ? "alert" : "status"}>{message}</p>}
      <button className="crm-button" type="submit" disabled={busy}>{busy ? "Activating…" : "Activate staff account"}</button>
    </form>
  );
}
