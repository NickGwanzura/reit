import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { hashStaffInviteToken, isStaffInviteToken } from "@/lib/staff-invite";
import { AcceptInviteForm } from "@/app/admin/accept-invite-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Accept staff invitation | Mutirikwi REIT",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const validFormat = isStaffInviteToken(token);
  const invite = validFormat
    ? await prisma.staffInvite.findUnique({ where: { tokenHash: hashStaffInviteToken(token) } })
    : null;
  const validInvite = invite && !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > new Date() ? invite : null;

  return (
    <main className="crm-auth-page">
      <section className="crm-auth-card">
        <Link className="crm-brand" href="/">MUTIRIKWI <span>REIT</span></Link>
        <p className="crm-kicker">STAFF ACCESS · SECURE INVITATION</p>
        {validInvite ? (
          <>
            <h1>Activate your account</h1>
            <p className="crm-auth-intro">Welcome, {validInvite.name}. Set a private password to activate your {validInvite.role === "FUND_MANAGER" ? "fund manager" : "relationship manager"} account for <strong>{validInvite.email}</strong>.</p>
            <AcceptInviteForm token={token} />
            <p className="crm-small-print">This one-time invitation expires {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Harare" }).format(validInvite.expiresAt)} Harare time.</p>
          </>
        ) : (
          <>
            <h1>Invitation unavailable</h1>
            <p className="crm-auth-intro">This invitation may have expired, been revoked, or already been used. Ask your Mutirikwi REIT administrator to send a fresh invitation.</p>
            <p className="crm-small-print"><Link href="/admin/login">Go to staff sign in</Link></p>
          </>
        )}
      </section>
    </main>
  );
}
