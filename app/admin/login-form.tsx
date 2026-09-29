"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
        redirectTo: "/admin",
      });
      if (result?.ok) {
        window.location.assign("/admin");
      } else {
        setMessage("Sign-in details were not recognised, or this account is not active.");
      }
    } catch {
      setMessage("The staff sign-in service is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="crm-auth-page">
      <section className="crm-auth-card">
        <a className="crm-brand" href="/">MUTIRIKWI <span>REIT</span></a>
        <p className="crm-kicker">PRIVATE STAFF AREA</p>
        <h1>Sign in to the CRM</h1>
        <p className="crm-auth-intro">Use your authorised REIT team account to manage investor enquiries.</p>
        <form onSubmit={submit} className="crm-auth-form">
          <label>Work email<input type="email" name="email" autoComplete="username" required maxLength={254} /></label>
          <label>Password<input type="password" name="password" autoComplete="current-password" required maxLength={256} /></label>
          {message && <p className="crm-message crm-error" role="alert">{message}</p>}
          <button className="crm-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button>
        </form>
        <p className="crm-small-print">Access is restricted to authorised staff. All CRM changes are recorded.</p>
      </section>
    </main>
  );
}
