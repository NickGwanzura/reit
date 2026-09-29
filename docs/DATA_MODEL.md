# Lead CRM data model

- `Contact` stores the current deduplicated contact record. Email and normalised phone/WhatsApp values are unique when supplied.
- `Lead` stores the current pipeline status, intended range, timing, preferred contact, source, and assigned relationship manager.
- `Enquiry` is an append-only snapshot of each website submission, including consent timestamp, self-reported interest, UTM fields, referrer, and landing path.
- `Activity` is the chronological lead history for stage/assignment changes, staff notes, contacts, tasks, and email results.
- `Task` stores follow-up actions and their owner, due date, priority, and completion state.
- `AuditLog` captures administrative changes separately from the human-readable lead activity stream. It stores hashed request IPs only where available.
- `User`, `LoginThrottle`, and `RateLimitBucket` support staff access and abuse throttling.

The schema stores enquiry and contact details necessary to respond. It does not store card/payment data, investor units, distributions, KYC documents, or identity documents. Database deletion is restricted for related lead records so enquiry/audit history is not silently cascaded away.
