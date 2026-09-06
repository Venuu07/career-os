# CareerOS — Technical Specification

## 1. Assumptions

- Each recruiter manages a company-specific careers page.
- Company and job data must remain isolated between companies.
- Recruiters can edit a draft without changing the currently published page.
- Only published page content and `OPEN` jobs are visible publicly.
- Job applications are handled externally and are outside this assignment.
- Page sections and theme settings are stored as structured configuration.
- The demo uses a small curated job set, while the system can support a larger job inventory.

## 2. Architecture

```text
Recruiter / Candidate
        |
        v
 Next.js Frontend
        |
        v
   FastAPI Backend
      /       \
     v         v
PostgreSQL   Gemini API
   (Neon)
```

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui. It provides the recruiter dashboard/builder and the public candidate experience.
- **Backend:** FastAPI handles authentication, company-scoped access, careers-page management, publishing, jobs, and AI requests.
- **Database:** PostgreSQL stores users, companies, memberships, career pages, versions, and jobs.
- **AI:** Gemini is accessed through the backend so the API key remains server-side.

## 3. Database Schema

```text
User
 |
 v
CompanyMembership
 |
 v
Company
 |  v  v
CareerPage   Job
 |
 v
CareerPageVersion
```

- **User:** recruiter account and authentication data.
- **Company:** employer using CareerOS.
- **CompanyMembership:** connects users to companies and their roles.
- **CareerPage:** company careers-page configuration and published-version reference.
- **CareerPageVersion:** stores draft/published state, section configuration, and theme configuration.
- **Job:** company-owned job with information and status such as `OPEN`, `DRAFT`, or `CLOSED`.

The draft/published version model keeps unfinished changes separate from the public page.

## 4. Test Plan

### Backend

- Authentication and login
- Company-scoped access
- Career-page draft saving
- Publish workflow
- Job creation and status changes
- Public visibility of only `OPEN` jobs
- Public careers-page API
- AI copy generation
- Draft/published separation

### Frontend

```bash
npm run lint
npm run build
```

### Manual

**Recruiter:**

```text
Login
→ Dashboard
→ Branding
→ Builder
→ AI Assist
→ Save Draft
→ Preview
→ Publish
```

**Candidate:**

```text
Public Careers Page
→ Search / Filter
→ Job Detail
→ Apply
```

Also verified:
- responsive/mobile layout
- social links
- CareerOS branding
- filter clearing
- published vs draft behavior
- SEO metadata
- `JobPosting` structured data

### Final Verification

- Frontend lint: PASS
- Frontend build: PASS
- Backend tests: PASS
- Backend startup/import: PASS
