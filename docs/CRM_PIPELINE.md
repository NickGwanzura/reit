# CRM pipeline and operations

## Lead stages

`NEW_LEAD` → `CONTACTED` → `QUALIFIED` → `INTERESTED` → later review/decision labels, with `DEFERRED` and `LOST` available when appropriate. Stage movement is tracked in the activity stream and audit log. KYC, subscription, approval, and onboarding labels are placeholders for manual tracking only; this release does not process those activities.

## Daily workflow

1. Review new enquiries and validate contact preference.
2. Assign an owner (super admin/fund manager) or work assigned records (relationship manager).
3. Log calls, emails, WhatsApp interactions, meetings, or internal notes as append-only activities.
4. Create a dated follow-up task and close it only when complete.
5. Move the lead stage to reflect the latest interaction and record substantive context in a note.

The dashboard shows the most recently updated 100 visible leads and up to 12 open follow-ups. Audit/activity records should not be edited or deleted through the CRM UI.
