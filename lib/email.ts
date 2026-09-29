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

export async function deliverLeadEmails(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);
  const notificationAddress = process.env.LEAD_NOTIFICATION_EMAIL;
  const name = `${lead.firstName} ${lead.lastName}`;
  const greeting = escapeHtml(lead.firstName);
  const deliveries: Array<Promise<{ kind: "acknowledgement" | "notification"; failed: boolean }>> = [
    resend.emails.send({
      from,
      to: [lead.email],
      subject: "We received your Mutirikwi REIT enquiry",
      text: `Hello ${lead.firstName},\n\nYour investment enquiry has been received. A member of the Mutirikwi REIT team will contact you regarding next steps.\n\nThis acknowledgement does not create an investment or reserve units.\n\nMutirikwi REIT`,
      html: `<div style="font-family:Arial,sans-serif;color:#182d36;line-height:1.7"><h1 style="font-size:22px">Enquiry received</h1><p>Hello ${greeting},</p><p>Your investment enquiry has been received. A member of the Mutirikwi REIT team will contact you regarding next steps.</p><p style="font-size:13px;color:#596a70">This acknowledgement does not create an investment or reserve units.</p><p>Mutirikwi REIT</p></div>`,
    }).then(({ error }) => ({ kind: "acknowledgement" as const, failed: Boolean(error) })),
  ];

  if (notificationAddress) {
    deliveries.push(
      resend.emails.send({
        from,
        to: [notificationAddress],
        subject: `New Mutirikwi REIT lead: ${name}`,
        text: [
          `A new website enquiry was received.`,
          `Name: ${name}`,
          `Email: ${lead.email}`,
          `Phone: ${lead.phone ?? "Not provided"}`,
          `WhatsApp: ${lead.whatsapp ?? "Not provided"}`,
          `Country: ${lead.country ?? "Not provided"}`,
          `Investor type: ${lead.investorType}`,
          `Intended investment range: ${lead.investmentRange}`,
          `Timeline: ${lead.timeline}`,
          `Preferred contact: ${lead.preferredContact}`,
          `CRM lead: ${process.env.AUTH_URL ?? "https://mutirikwireitzim.com"}/admin`,
        ].join("\n"),
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
          body: kind === "acknowledgement" ? "Enquiry acknowledgement email sent." : "Lead notification email sent.",
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
