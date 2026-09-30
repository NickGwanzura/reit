# CRM PostgreSQL backup and restore checks

This CRM stores investor enquiry identities, preferences, consent timestamps, notes, assignments, and audit history. Treat database backups as confidential personal data. This runbook documents checks; it does not configure or trigger Dokploy backups.

## Before relying on production backups

- In Dokploy, identify the PostgreSQL service and verify that a recurring backup is enabled. Record the schedule, retention window, encryption-at-rest, storage location, and who can access/restore it.
- Keep backup credentials and storage separate from the application runtime credentials. Restrict access to named administrators and never put a database dump in Git, a public bucket, or a support ticket.
- Confirm that PostgreSQL data is on persistent storage and that a backup is not merely a copy of the running container filesystem.
- Agree a documented retention period with the compliance/legal team. Until then, use CRM retention-review flags; there is no automatic lead/contact deletion.

## Restore test (recommended quarterly and after material infrastructure changes)

1. Select a recent encrypted backup and record its timestamp and checksum. Do not restore over production.
2. Restore into an isolated, access-restricted PostgreSQL service/network with no public ingress and no production email credentials.
3. Verify the database opens, Prisma migrations are present, and representative row counts for `Lead`, `Contact`, `Enquiry`, `Activity`, `Task`, `AuditLog`, and `User` are plausible. Avoid copying or circulating contact-level output.
4. Start the application against the isolated database with separate test credentials. Verify staff authentication, lead listing, lead activity, reports, and the current schema migration state.
5. Record restore duration, backup age, checks performed, failures, corrective work, and the tester. Retain only the test evidence needed for operations; do not keep the restored personal data longer than necessary.
6. Destroy the isolated test service and its restored data using the platform's supported deletion process, then verify that production services were untouched.

## Incident recovery

- Stop writes to the affected application before any point-in-time recovery or restore.
- Identify the correct recovery point and expected lead/enquiry loss window with the service owner.
- Restore to a new isolated service first, validate it, then have the authorized operator approve the production cutover.
- Preserve the pre-restore database until recovery is verified and the incident owner approves its disposition.
- Record the restore/cutover in the operational incident log. Never paste `DATABASE_URL`, dump contents, investor data, or secret values into this runbook.

## Current verification status

This repository cannot confirm the live Dokploy backup schedule, backup encryption, retention, or restore history. An operator must check the PostgreSQL service settings and complete an isolated restore test before claiming backups are verified.

## Scheduled first-contact reminders

The app exposes `POST /api/cron/lead-reminders`. Configure a Dokploy scheduled task (or another trusted scheduler) to call it hourly during Harare business hours. If the scheduler uses UTC, `0 6-15 * * 1-5` corresponds to 08:00–17:00 in Harare (UTC+2). The SLA currently counts weekdays and weekends only; no Zimbabwe public-holiday calendar is configured. Add `CRON_SECRET` to the app's protected environment and pass it only as `Authorization: Bearer <secret>` from the scheduler. Do not place it in a URL, Git, or visible command logs. The endpoint uses a database claim and provider idempotency key to avoid duplicate first-contact reminder emails, and returns aggregate counts only. Test with a controlled lead and verify the audit event before enabling the schedule broadly.
