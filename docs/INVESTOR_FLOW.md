# Public enquiry flow

1. Visitor submits the enquiry form with contact preference, intended investment range/timing, investor category, and consent.
2. The browser sends the payload to `POST /api/leads`; tracking parameters and landing/referrer details are captured where available.
3. The server checks origin, payload size, schema, honeypot, and persistent rate limit, then normalises contact details.
4. A contact/lead is created or deduplicated, and an immutable enquiry snapshot plus initial activity/audit data are persisted in a transaction.
5. Optional Resend acknowledgement and staff notification run after persistence. Email failure does not discard the lead.
6. Staff sign in at `/admin`, assign and qualify the lead, append notes/contact history, and create follow-up tasks.

The submission records interest only. It is not an application, offer acceptance, payment, investment, unit reservation, or KYC approval.
