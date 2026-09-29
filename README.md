# Mutirikwi REIT website and lead CRM

Next.js public website with a PostgreSQL-backed enquiry pipeline and private staff CRM. Website enquiries are validated and stored in PostgreSQL; authorised staff can qualify, assign, track, and follow up leads at `/admin`.

## Run locally

Requires Node.js 20.19+ (24 LTS recommended) and PostgreSQL 15 or later.

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a unique `AUTH_SECRET`.
2. Install dependencies and generate the Prisma client: `npm ci`.
3. Apply migrations: `npm run db:migrate:deploy`.
4. Create the first staff account by setting `CRM_ADMIN_EMAIL` and a unique `CRM_ADMIN_PASSWORD` (16–72 UTF-8 bytes), then run `npm run db:seed-admin`. Remove the bootstrap password from the environment after it succeeds.
5. Start the site: `npm run dev`.

Open `http://localhost:3000`. The CRM is at `/admin`; staff can change their password at `/admin/security`. A super admin can provision named fund/relationship managers at `/admin/team`; new team members must change their generated temporary password at first sign-in. To develop a schema change, use `npm run db:migrate:dev` against a local development database.

## Production deployment

Use a private PostgreSQL service and keep its hostname, database, and credentials in the application’s secret environment—not in Git. Configure `DATABASE_URL`, `AUTH_SECRET` (unique, high entropy), `AUTH_URL` (the canonical HTTPS site URL), and `CRM_ADMIN_EMAIL`. Set a one-time `CRM_ADMIN_PASSWORD` for the first app boot; after the initial account is created, remove that variable and redeploy. Startup applies checked-in migrations before the Next.js server starts.

The included Dockerfile uses Next.js standalone output and listens on port `3000`. In Dokploy, connect the repository and deployment branch, select Dockerfile build, use `Dockerfile` at repository root, and route the production domain to container port `3000`. Keep PostgreSQL on the private application network; do not publish port `5432` to the Internet. Set up automated database backups before production use.

GitHub Actions runs unit validation, Prisma checks, a Next.js production build, and a Docker image build. These checks do not deploy the site by themselves.

## Email notifications

The lead is committed to the database before email is attempted. Configure `RESEND_API_KEY`, a verified `EMAIL_FROM` sender, and (optionally) `LEAD_NOTIFICATION_EMAIL` in Dokploy to enable acknowledgement and internal notification messages. If Resend is not configured or has an outage, the enquiry remains stored in the CRM. No provider credential is included in this repository.

## Scope and safety

This release collects and manages enquiries only. It does not take payments, subscribe investors, allocate units, calculate distributions, run a wallet, or store KYC documents. Statuses named for later compliance/subscription phases are tracking labels only; this CRM does not perform those regulated processes. Yield and return content on the public website remains indicative and is not calculated from a lead record. See `docs/` for the data model, permissions, security design, lead flow, and deployment operations.

## Site content

Public investment and development facts are based on the supplied project brochure. Project renders are labelled as artist’s impressions. The public calculator is illustrative and does not initiate an investment, payment, reservation, or unit allocation.
