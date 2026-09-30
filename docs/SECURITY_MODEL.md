# Security model

- Passwords are salted and hashed with bcrypt. The initial account is seeded from deployment-only environment variables and existing accounts are never overwritten by the seed command.
- The initial super-admin must change their seeded password before using lead or team features. Staff invited through `/admin/team` choose their own password from a single-use, 72-hour invitation link; raw invite tokens are never stored in the database.
- Credentials sign-in is throttled by a hashed source address; public lead submissions have an independent persistent rate limit and a honeypot.
- Staff access is checked against the active database user and current role on every CRM request. Password changes increment a session version, invalidating existing sessions.
- Relationship managers see and act only on their assigned leads/tasks. Fund managers and super admins can manage the whole pipeline. Public users cannot query CRM endpoints.
- State-changing CRM APIs require an authenticated staff session and same-origin JSON request. Inputs are validated and bounded.
- Audit records avoid password values and store a one-way IP hash rather than the raw address.
- PostgreSQL must be private to the application network and protected by a strong secret. Use TLS for public site traffic and do not expose database port 5432.
- Resend is optional; only a provider key and verified sender in the runtime environment enable email. Leads remain stored if email delivery fails.

This is an application-level design, not a substitute for infrastructure access controls, TLS, patching, backups, incident response, privacy review, or professional security testing.
