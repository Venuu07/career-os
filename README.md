# CareerOS

CareerOS is a lightweight careers-page CMS for recruiting teams. It helps a recruiter turn company branding, company story, culture content, and open roles into a polished public careers experience for candidates.

The product is intentionally focused on the careers-page experience rather than becoming a full ATS.

## What I Built

### Recruiter experience

- Secure recruiter authentication
- Company-scoped careers-page management
- Brand customization:
  - primary/accent/background colors
  - logo
  - typography
  - culture/media configuration
  - social links
- Visual careers-page builder
- Add, remove, reorder, and configure content sections
- Live preview while editing
- AI-assisted career copy generation
- Save-as-draft workflow
- Explicit publish workflow
- Job management for open, draft, and closed roles
- Career-page quality and SEO checks
- Shareable company careers URL

### Candidate experience

- Branded public careers page
- Company story and culture content
- Benefits and media sections
- Department-grouped open roles
- Search and job filtering
- Clear/reset filters
- Job detail pages
- Role snapshot with key job information
- Job freshness indicators
- Related roles
- External application CTA
- Responsive mobile experience
- SEO metadata and JobPosting structured data

## Product Flow

### Recruiter

```text
Login
  ↓
Dashboard
  ↓
Branding
  ↓
Career Page Builder
  ↓
Edit / Preview
  ↓
Save Draft
  ↓
Publish
  ↓
Public Careers Page
```

### Candidate

```text
Public Careers Page
  ↓
Explore company
  ↓
Search / filter roles
  ↓
Job detail
  ↓
External Apply
```

## Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- Python
- SQLAlchemy 2.x
- Alembic
- PostgreSQL
- Pydantic

### Authentication

- JWT-based authentication
- HttpOnly cookie for browser sessions
- Bearer-token support for API usage

### AI

- Google Gemini
- Server-side API access through the FastAPI backend

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Architecture

At a high level:

```text
                Candidate / Recruiter
                         │
                         ▼
                  Next.js Frontend
                         │
                         ▼
                    FastAPI API
                    /          \
                   /            \
                  ▼              ▼
           PostgreSQL         Gemini API
             (Neon)
```

The frontend is responsible for the recruiter builder and candidate-facing experience. FastAPI handles authentication, company-scoped business logic, career-page persistence, publishing, jobs, and AI requests. PostgreSQL stores the application data.

The application keeps customer data company-scoped so resources are resolved from the authenticated user's company membership rather than trusting an arbitrary company ID from the client.

## Career Page Publishing

CareerOS separates editing from publishing.

A recruiter edits a draft version of the careers page. Publishing promotes the draft to the public version while preserving the previous published state through the versioned career-page model.

Conceptually:

```text
Career Page
   │
   ├── Published Version
   │
   └── Draft Version
```

This prevents incomplete edits from immediately becoming public.

Jobs are company-level resources. Public candidate pages only expose jobs whose status is `OPEN`.

## Main Data Models

The core entities are:

- `User` — recruiter identity
- `Company` — employer/company account
- `CompanyMembership` — association between users and companies
- `CareerPage` — company careers-page configuration
- `CareerPageVersion` — draft/published versions of the careers page
- `Job` — company job openings and their status

Career-page sections and theme configuration are stored as structured JSON configuration, allowing the page builder to evolve without requiring a new database column for every visual section setting.

## AI-Assisted Content

CareerOS includes an AI-assisted copywriting flow for career content.

Supported generation areas include:

- Hero copy
- About/company copy
- Culture copy
- Job descriptions

The AI flow is intentionally assistive rather than autonomous:

```text
Recruiter requests generation
        ↓
FastAPI validates request
        ↓
Gemini generates draft content
        ↓
Recruiter reviews result
        ↓
Recruiter explicitly uses/saves it
        ↓
Publish remains a separate action
```

The Gemini API key is kept on the backend and is never exposed to the browser.

## SEO

The public candidate experience is designed to be crawlable and includes:

- Server-rendered page metadata
- Page titles and descriptions
- Company careers-page metadata
- Job-detail metadata
- `JobPosting` structured data on job pages

The goal is for candidates and search engines to see meaningful HTML content rather than a client-only placeholder.

## Demo

### Demo company

**Stark Industries**

### Demo recruiter

```text
Email: demo@careeros.dev
Password: Demo@12345
```

### Public careers page

```text
https://career-os-5txu.vercel.app/stark-industries/careers
```

### Production frontend

```text
https://career-os-5txu.vercel.app
```

### Production backend

```text
https://career-os-aote.onrender.com
```

> Replace the deployment URLs above if the final production URLs change before submission.

## Local Development

### Prerequisites

- Node.js
- npm
- Python 3.x
- PostgreSQL-compatible database
- A Gemini API key for AI functionality

### Clone

```bash
git clone <your-github-repository-url>
cd career-os
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Create and configure the backend environment using the provided environment-variable example.

Then run the FastAPI application using the project's configured startup command, for example:

```bash
uvicorn app.main:app --reload
```

### Environment Variables

Do not commit secrets.

The backend requires values such as:

```text
DATABASE_URL=
SECRET_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
```

The frontend requires the configured API base URL:

```text
NEXT_PUBLIC_API_URL=
```

See the project's `.env.example` files for the exact variables used by the implementation.

## Testing

The final release was checked with:

### Frontend

```bash
npm run lint
npm run build
```

### Backend

```bash
pytest
```

A backend startup/import check was also performed.

In addition to automated checks, the final release was manually verified through the main recruiter and candidate flows, including:

- Demo login
- Branding
- Builder editing
- AI copy generation
- Save draft
- Preview
- Publish
- Public careers page
- Search and filtering
- Job details
- External Apply flow
- Mobile candidate experience
- Public social links
- Published-vs-draft behavior

## Sample Data

The project includes sample job data used for the demo.

The final Stark Industries demo dataset is intentionally curated for presentation while the underlying application remains designed to support larger company job inventories.

## Design Approach

The product is designed around two different experiences:

### Recruiter

A focused content studio for creating and publishing a branded careers page.

### Candidate

An editorial, employer-brand-led careers experience that helps a candidate understand the company first and then discover relevant roles.

The goal is to avoid making the public page feel like a raw ATS job table.

## Key Product Decisions

### Structured builder instead of drag-and-drop

The builder uses a structured section model with explicit controls for adding, reordering, configuring, previewing, saving, and publishing.

This keeps the editing experience predictable while still giving recruiters control over the page.

### Draft and publish separation

Career pages use separate draft and published versions so an unfinished change does not immediately affect the public site.

### Company-scoped data

Company resources are resolved through the authenticated user's membership. Client input is not treated as authoritative for company ownership.

### PostgreSQL

PostgreSQL provides relational integrity for users, companies, memberships, career pages, versions, and jobs while still allowing flexible page and theme configuration through JSON data.

## Known Trade-offs

This is a focused prototype rather than a full production ATS platform.

Current trade-offs include:

- The builder is optimized primarily for desktop editing.
- Media configuration is lightweight rather than a full asset-management system.
- Candidate application submission is intentionally external and outside the scope of the assignment.
- The demo uses curated sample jobs rather than a large production job inventory.
- Advanced collaboration and analytics are not part of the current scope.

## Future Improvements

If CareerOS were taken further, useful next steps would include:

- Rich media uploads and asset management
- Reusable page templates and theme presets
- Collaborative editing and change history
- Candidate analytics and conversion insights
- More advanced publishing/version history
- Additional performance and caching strategies for larger company/job volumes

## Repository Structure

The project is organized roughly as:

```text
career-os/
├── frontend/
│   └── Next.js application
├── backend/
│   └── FastAPI application
├── README.md
├── Tech Spec.md
└── AGENT_LOG.md
```
