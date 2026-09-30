import "server-only";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

type LeadEmail = {
  leadId: string;
  enquiryId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  investorType: string;
  investmentRange: string;
  timeline: string;
  preferredContact: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[character];
  });
}

function safeText(value: string | undefined) {
  return value?.trim() ? value.trim().replace(/[\r\n]+/g, " ") : "Not provided";
}

function emailShell(content: string, preheader: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f4f6;color:#17243a;font-family:Arial,Helvetica,sans-serif">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f6;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e1e5ea">
      <tr><td style="padding:22px 30px;background:#14243d;border-bottom:4px solid #ed1c24">
        <img src="https://mutirikwireitzim.com/assets/mutirikwi-reit-logo.png" width="142" alt="Mutirikwi REIT" style="display:block;width:142px;max-width:100%;height:auto;border:0">
      </td></tr>
      <tr><td style="padding:30px">${content}</td></tr>
      <tr><td style="padding:20px 30px;background:#f7f8fa;border-top:1px solid #e7e9ed;color:#5b6574;font-size:12px;line-height:1.6">
        <strong style="color:#17243a">Mutirikwi REIT</strong><br>Investing in the future, today.<br>
        For information only. An enquiry is not an investment, offer acceptance or reservation of units.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function notificationRecipients() {
  const configured = [
    ...(process.env.LEAD_NOTIFICATION_EMAILS ?? "").split(","),
    process.env.LEAD_NOTIFICATION_EMAIL ?? "",
  ];
  return [...new Set(configured.map((address) => address.trim()).filter(Boolean))];
}

export async function deliverLeadEmails(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);
  const recipients = notificationRecipients();
  const fullName = `${safeText(lead.firstName)} ${safeText(lead.lastName)}`;
  const greeting = escapeHtml(safeText(lead.firstName));
  const siteUrl = (process.env.AUTH_URL ?? "https://mutirikwireitzim.com").replace(/\/+$/, "");
  const crmUrl = `${siteUrl}/admin`;
  const acknowledgementContent = `
    <p style="margin:0 0 9px;color:#ed1c24;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Enquiry received</p>
    <h1 style="margin:0 0 18px;color:#14243d;font-size:28px;line-height:1.2">Thank you, ${greeting}.</h1>
    <p style="margin:0 0 16px;color:#354052;font-size:15px;line-height:1.75">Your investor enquiry has been received. A member of the Mutirikwi REIT team will review your details and contact you using your preferred method.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f7f8fa;border-left:3px solid #ed1c24"><tr><td style="padding:15px 18px;color:#354052;font-size:13px;line-height:1.65"><strong style="color:#14243d">What happens next</strong><br>The team will follow up to discuss your enquiry and provide relevant information. Please review the official offer documents and risks before making any investment decision.</td></tr></table>
    <p style="margin:0;color:#657083;font-size:12px;line-height:1.6">This acknowledgement does not create an investment, accept an offer or reserve units. If you did not submit this enquiry, you can disregard this email.</p>`;

  const deliveries: Array<Promise<{ kind: "acknowledgement" | "notification"; failed: boolean }>> = [
    resend.emails.send({
      from,
      to: [lead.email],
      replyTo: "info@redwood.co.zw",
      subject: "We received your Mutirikwi REIT enquiry",
      text: `Hello ${safeText(lead.firstName)},\n\nYour investor enquiry has been received. A member of the Mutirikwi REIT team will review your details and contact you using your preferred method.\n\nThis acknowledgement does not create an investment, accept an offer or reserve units.\n\nMutirikwi REIT`,
      html: emailShell(acknowledgementContent, "Your Mutirikwi REIT investor enquiry has been received."),
    }).then(({ error }) => ({ kind: "acknowledgement" as const, failed: Boolean(error) })),
  ];

  if (recipients.length) {
    const fields: Array<[string, string]> = [
      ["Name", fullName],
      ["Email", lead.email],
      ["Phone", safeText(lead.phone)],
      ["WhatsApp", safeText(lead.whatsapp)],
      ["Country", safeText(lead.country)],
      ["Investor type", lead.investorType],
      ["Intended investment range", lead.investmentRange],
      ["Timeline", lead.timeline],
      ["Preferred contact", lead.preferredContact],
    ];
    const rows = fields.map(([label, value]) => `
      <tr><td style="padding:10px 12px;border-bottom:1px solid #e6e9ee;color:#657083;font-size:12px;width:39%">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e6e9ee;color:#17243a;font-size:13px;font-weight:600;word-break:break-word">${escapeHtml(value)}</td></tr>`).join("");
    const notificationContent = `
      <p style="margin:0 0 9px;color:#ed1c24;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Website investor enquiry</p>
      <h1 style="margin:0 0 8px;color:#14243d;font-size:26px;line-height:1.2">New lead received</h1>
      <p style="margin:0 0 22px;color:#586477;font-size:14px;line-height:1.6">A visitor has completed the Mutirikwi REIT three-step enquiry form. Please follow up using their selected contact preference.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e6e9ee;border-collapse:collapse">${rows}</table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px"><tr><td style="background:#ed1c24"><a href="${escapeHtml(crmUrl)}" style="display:inline-block;padding:13px 18px;color:#fff;text-decoration:none;font-size:13px;font-weight:700">Open lead management&nbsp; →</a></td></tr></table>
      <p style="margin:18px 0 0;color:#788294;font-size:11px">Lead reference: ${escapeHtml(lead.enquiryId)}</p>`;
    const text = [
      "New Mutirikwi REIT website investor enquiry",
      ...fields.map(([label, value]) => `${label}: ${value}`),
      `Lead reference: ${lead.enquiryId}`,
      `Lead management: ${crmUrl}`,
    ].join("\n");

    deliveries.push(
      resend.emails.send({
        from,
        to: [recipients[0]],
        bcc: recipients.slice(1),
        replyTo: lead.email,
        subject: `New Mutirikwi REIT enquiry — ${safeText(lead.firstName)} ${safeText(lead.lastName)}`.slice(0, 180),
        text,
        html: emailShell(notificationContent, `New investor enquiry from ${fullName}.`),
      }).then(({ error }) => ({ kind: "notification" as const, failed: Boolean(error) })),
    );
  }

  const results = await Promise.allSettled(deliveries);
  const successfulKinds = results.flatMap((result) => {
    if (result.status !== "fulfilled" || result.value.failed) return [];
    return [result.value.kind];
  });

  for (const kind of successfulKinds) {
    try {
      await prisma.activity.create({
        data: {
          leadId: lead.leadId,
          type: "EMAIL_SENT",
          body: kind === "acknowledgement" ? "Enquiry acknowledgement email sent." : "Lead notification email sent to configured team inboxes.",
          metadata: { enquiryId: lead.enquiryId, recipientType: kind },
        },
      });
    } catch {
      // Email delivery must not be reported as failed solely because CRM activity logging failed.
    }
  }

  if (results.some((result) => result.status === "rejected" || (result.status === "fulfilled" && result.value.failed))) {
    // Keep recipient addresses and provider payloads out of application logs.
    console.error("A lead email could not be delivered.");
  }
}

export async function sendStaffInviteEmail(input: {
  email: string;
  name: string;
  role: "FUND_MANAGER" | "RELATIONSHIP_MANAGER";
  inviteUrl: string;
  expiresAt: Date;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  const roleLabel = input.role === "FUND_MANAGER" ? "Fund manager" : "Relationship manager";
  const greeting = escapeHtml(input.name);
  const safeUrl = escapeHtml(input.inviteUrl);
  const expiry = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Harare",
  }).format(input.expiresAt);
  const content = `
    <p style="margin:0 0 9px;color:#ed1c24;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Staff access invitation</p>
    <h1 style="margin:0 0 16px;color:#14243d;font-size:27px;line-height:1.2">You’re invited, ${greeting}.</h1>
    <p style="margin:0 0 16px;color:#354052;font-size:15px;line-height:1.75">You have been invited to the Mutirikwi REIT staff workspace as a <strong>${roleLabel}</strong>. Use the secure link below to activate your account and choose your own password.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0"><tr><td style="background:#ed1c24"><a href="${safeUrl}" style="display:inline-block;padding:14px 20px;color:#fff;text-decoration:none;font-size:14px;font-weight:700">Accept invitation&nbsp; →</a></td></tr></table>
    <p style="margin:0 0 12px;color:#586477;font-size:13px;line-height:1.65">This invitation expires on <strong>${escapeHtml(expiry)} (Harare time)</strong>. The link can be used once. If you were not expecting this invitation, you can ignore this email.</p>
    <p style="margin:0;color:#657083;font-size:12px;line-height:1.6;word-break:break-word">If the button does not work, copy this address into your browser:<br>${safeUrl}</p>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: [input.email],
      replyTo: "info@redwood.co.zw",
      subject: "Your Mutirikwi REIT staff invitation",
      text: `Hello ${input.name},\n\nYou have been invited to the Mutirikwi REIT staff workspace as a ${roleLabel}. Accept the invitation and choose your own password here:\n${input.inviteUrl}\n\nThis link expires on ${expiry} (Harare time) and can be used once. If you were not expecting this invitation, you can ignore this email.\n\nMutirikwi REIT`,
      html: emailShell(content, `You have been invited to join the Mutirikwi REIT staff workspace as a ${roleLabel}.`),
    });
    return !error;
  } catch {
    // Keep provider details and invite tokens out of logs.
    return false;
  }
}
