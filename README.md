# Mutirikwi REIT public website

Responsive Next.js App Router website for the Mutirikwi REIT Masvingo Flats Project. The public brochure, supplied logo and project illustration are served from `public/assets/`.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to create a production build and `npm start` to serve it.

## GitHub checks and deployment

The GitHub Actions workflow in `.github/workflows/ci.yml` runs `npm ci`, `npm run build`, and a Docker image build for pushes and pull requests. This verifies the production app and container; it does not publish or deploy the site.

The provided deployment dashboard URL appears to be a Dokploy environment. The repository now includes a multi-stage Dockerfile using Next.js standalone output. In Dokploy, use:

- Build type: Dockerfile
- Dockerfile path: `Dockerfile`
- Docker context: `.`
- Application/domain container port: `3000`
- Connect the GitHub repository and choose its deployment branch; enable Auto Deploy after the source is connected.

Dokploy's GitHub integration can deploy pushes to the selected branch automatically. The Actions workflow remains a build gate only; it does not call the Dokploy API.

The current enquiry form opens the visitor's email application. This repository does not yet store enquiries in PostgreSQL or send notifications through Resend, so it does not currently need `DATABASE_URL` or `RESEND_API_KEY`. Those integrations require a server-side route and real provider credentials; add secrets only in the hosting provider's secret settings, never in Git.

GitHub Pages alone cannot run the planned database/email backend. Choose a Node.js hosting provider before adding an automatic production-deploy workflow.

## Enquiry form

The enquiry form validates required fields and opens a prefilled email addressed to `info@redwood.co.zw`. The visitor must send the email in their email application. The site does not store or transmit enquiry data. A hosted production form can be connected to a secure endpoint when one is available.

## Investment content

Public investment and development facts are based on the supplied September 2026 brochure. Target yield, IRR, listing date and project figures are qualified in context. Project renders are labelled as artist's impressions. The calculator is illustrative and does not initiate an investment, payment, reservation or unit allocation.
