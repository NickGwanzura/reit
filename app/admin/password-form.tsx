"use client";

import { signOut } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function PasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    const form = event.currentTarget;
    const values = new FormData(form);
    const newPassword = String(values.get("newPassword") ?? "");
    if (newPassword !== values.get("confirmPassword")) {
      setError(true);
      setMessage("The new passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.get("currentPassword"), newPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Password could not be changed.");
      setMessage("Password updated. Please sign in again with your new password.");
      form.reset();
      window.setTimeout(() => void signOut({ redirectTo: "/admin/login" }), 900);
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Password could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="crm-auth-form" onSubmit={submit}>
      <label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required maxLength={72} /></label>
      <label>New password<input type="password" name="newPassword" autoComplete="new-password" required minLength={16} maxLength={72} /></label>
      <p className="crm-password-hint">Use at least 16 characters. Passwords are limited to 72 UTF-8 bytes.</p>
      <label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" required minLength={16} maxLength={72} /></label>
      {message && <p className={`crm-message${error ? " crm-error" : ""}`} role={error ? "alert" : "status"}>{message}</p>}
      <button className="crm-button" type="submit" disabled={busy}>{busy ? "Updating…" : "Change password"}</button>
    </form>
  );
}
