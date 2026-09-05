# CareerOS — Engineering & Product Constitution

## 1. Product

CareerOS is a multi-tenant Careers Page Builder for ATS platforms.

The primary customer is the Recruiter.

Recruiters should be able to:
- create a branded careers page
- customize themes
- add/remove/reorder content sections
- manage jobs
- preview changes
- save drafts
- publish careers pages
- share a public careers URL
- use AI assistance to improve careers-page content

Candidates should be able to:
- discover the company's story
- browse open jobs
- search by job title
- filter by location and job type
- view jobs comfortably on mobile
- use an accessible interface
- access SEO-friendly crawlable pages

The product should feel like a real SaaS product, not a CRUD demo.

---

## 2. Product Priority

Priority order:

P0 — Recruiter experience
P1 — Candidate careers experience
P2 — AI Careers Copilot
P3 — Resume parsing + job matching
P4 — Additional polish

Never sacrifice P0 functionality for a lower-priority feature.

The recruiter experience should receive approximately 70% of product-design attention.

---

## 3. Core User Journey

Recruiter:

Login
→ Dashboard
→ Career Page Builder
→ Edit
→ Preview
→ Save Draft
→ Publish
→ Share public careers page

Candidate:

Company Careers URL
→ Company story
→ Open roles
→ Search/filter
→ Job detail

---

## 4. Public URL

Public careers pages MUST use:

/{companySlug}/careers

Example:

/acme/careers

Do not replace this with /c/[slug] or another arbitrary routing scheme.

---

## 5. Architecture

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- FastAPI
- Python

Database:
- PostgreSQL
- Neon PostgreSQL in production/development cloud environment

Architecture:

Browser
→ Next.js
→ FastAPI
→ PostgreSQL

Keep frontend and backend responsibilities clearly separated.

---

## 6. Multi-Tenancy

Companies are first-class tenants.

Do NOT model users as belonging directly to one company.

Use:

users
company_members
companies

Conceptually:

User
→ Company Membership
→ Company

Company-owned resources must be scoped by company_id.

Authorization must always verify that the authenticated user has access to the requested company.

Never trust company_id supplied by the client without authorization checks.

---

## 7. Core Data Model

Initial entities:

users
company_members
companies
careers_pages
career_page_versions
jobs

Additional tables should only be introduced when they solve a real requirement.

Avoid unnecessary database complexity.

---

## 8. Draft / Preview / Publish

Career pages use a versioned publishing model.

Conceptually:

Published Version
       ↓
Recruiter edits
       ↓
Draft Version
       ↓
Preview
       ↓
Publish
       ↓
New Published Version

Published content should not be modified directly by ordinary editing operations.

Publishing should create/promote a stable published snapshot.

---

## 9. Page Builder

The builder is the flagship recruiter experience.

It should support:

- sections
- section ordering
- enable/disable
- add/remove
- editing
- theme customization
- live preview

Initial section types:

- Hero
- About
- Culture / Life at Company
- Benefits
- Video / Media
- Open Roles
- Custom Content

Do not build a full Webflow clone.

Favor a simple, polished builder.

---

## 10. UX Principles

The product must prioritize:

- clarity
- minimal cognitive load
- fast editing
- responsive design
- mobile-first candidate experience
- accessibility
- keyboard navigation
- visible focus states
- strong color contrast
- meaningful empty states
- loading states
- error states
- success feedback

Avoid UI clutter.

Do not add features simply because they are technically interesting.

---

## 11. AI Careers Copilot

AI is a product differentiator but must not compromise the core builder.

The AI assistant should operate through structured actions.

Conceptually:

User request
→ LLM
→ structured action
→ validation
→ draft modification
→ preview
→ recruiter approval

The AI must NOT arbitrarily execute code or directly mutate production data.

Examples:

"Rewrite our hero to sound more modern."

"Add an engineering culture section."

"Make the careers page more appealing to software engineers."

AI suggestions should be reviewable before being applied when the action materially changes content.

---

## 12. Resume Matching

Resume upload and job matching are stretch functionality.

If implemented:

PDF
→ text extraction
→ candidate profile
→ job matching
→ ranked jobs
→ explanation

Use deterministic matching logic where possible.

Do not introduce complex ML infrastructure unless it materially improves the result.

---

## 13. Candidate Experience

Candidate pages should be intentionally simpler than the recruiter interface.

Required:

- company branding
- company story
- open jobs
- search
- location filter
- job type filter
- responsive layout
- accessible controls
- SEO metadata
- crawlable HTML
- structured data where appropriate

Do not turn CareerOS into a general job portal.

---

## 14. Engineering Principles

Prefer:

- simple architecture
- typed interfaces
- reusable components
- clear domain boundaries
- server-side validation
- meaningful error handling
- testable services
- small focused modules
- explicit API contracts

Avoid:

- premature abstraction
- unnecessary dependencies
- giant components
- duplicated business logic
- hardcoded production data
- client-side-only authorization
- unnecessary microservices

---

## 15. AI Development Workflow

AI coding tools are allowed and encouraged.

However:

Plan
→ inspect
→ implement
→ run
→ verify
→ review
→ commit

Do not make large uncontrolled changes.

Before major architectural changes, explain the reasoning.

If an instruction conflicts with this document, stop and ask for clarification rather than silently changing architecture.

---

## 16. Documentation

During development maintain:

BUILD_NOTES.md

Record:
- important architectural decisions
- trade-offs
- rejected approaches
- bugs and solutions
- AI-generated suggestions that were changed/rejected
- important implementation decisions

The final README.md, Tech Spec.md and AGENT_LOG.md should be based on our actual development process.

---

## 17. Definition of Done

A feature is not complete merely because code exists.

A feature is complete when:

- it works
- UI is polished
- responsive behavior is verified
- loading/error/empty states are handled
- relevant validation exists
- authorization is considered
- tests exist where appropriate
- existing functionality still works

Always run the relevant checks after implementation.

---

## 18. Current Development Strategy

Build vertically.

Do not implement the entire backend before the frontend.

Preferred sequence:

Database foundation
→ company/page model
→ recruiter builder
→ save draft
→ preview
→ publish
→ public careers page
→ jobs/search/filter
→ AI Copilot
→ resume matching
→ polish/testing/deployment

Always prioritize a working end-to-end slice.