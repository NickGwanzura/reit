# Lead CRM implementation plan

## Delivered in this release

- Public enquiry endpoint with strict field validation, consent capture, same-origin checks, a honeypot, request-size limits, and database-backed IP rate limiting.
- PostgreSQL persistence for contacts, current lead state, immutable enquiry snapshots, marketing attribution, activities, tasks, and audit events.
- Staff sign-in, password hashing, throttling, role checks, relationship-manager assignment scope, and a private lead workspace.
- A shared staff sidebar and super-admin-only staff invitation workflow with branded Resend emails, one-use expiring activation links, resend/revoke controls, and account audit events.
- CRM actions for stage changes, lead assignment, notes/contact activities, and follow-up task management.
- Optional Resend acknowledgement and internal notification after the lead is safely stored.
- Production migrations applied at container startup; the database service remains private.

## Deliberately deferred

No subscriptions, payment processing, unit allocations, distribution calculations, investor wallet, KYC document uploads, or automated investment decisions. Status labels such as KYC or subscription stages do not implement those processes. If those capabilities are required later, define their legal, operational, security, and approval controls before implementing them.

## Before production use

1. Set production secrets in Dokploy and remove the bootstrap password after the first successful seed.
2. Verify the official notification recipient and configure a verified Resend sender if email is required.
3. Create named staff users with least-privilege roles; do not share the initial SUPER_ADMIN account.
4. Confirm database backup and restore procedures, retention policy, privacy notice, and consent wording with the responsible business/legal owners.
5. Test a synthetic enquiry end-to-end, verify notification behavior, and confirm the authorised team can process the lead.
