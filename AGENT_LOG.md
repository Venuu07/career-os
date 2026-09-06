# AGENT_LOG — CareerOS

## How I Used AI

I used AI throughout the project, mainly for brainstorming, architecture discussions, implementation, debugging, and final review.

I used **ChatGPT** and **Gemini** mainly for brainstorming and making product/technical decisions. I used **Antigravity** for most of the actual implementation, with AI-generated changes reviewed and tested before keeping them.

## 1. Starting the Project

I first used ChatGPT and Gemini to understand the assignment, identify the main recruiter and candidate flows, and decide what the MVP should include.

The main direction became:

```text
Recruiter
Login → Brand → Build → Preview → Publish

Candidate
Explore company → Search/filter roles → Job detail → Apply
```

I also used AI to compare possible approaches for the builder, publishing model, authentication, database structure, and overall product direction.

## 2. Development with Antigravity

Antigravity handled most of the implementation from the initial project setup through the final polish.

Some of the main areas where I used it were:

- FastAPI backend and API structure
- PostgreSQL models and migrations
- JWT authentication
- Company-scoped authorization
- Career-page draft/publish flow
- Job CRUD and job status management
- Next.js recruiter dashboard
- Career-page builder and live preview
- Public careers page and job detail pages
- SEO metadata and structured data
- Gemini AI integration
- Responsive UI and final visual polish

I generally worked by giving Antigravity a focused task, checking the result, running the application/tests, and then refining the prompt when the first implementation was not enough.

## 3. A Debugging Problem That Took Significant Time

One of the biggest practical issues I faced was with the local development environment.

Antigravity was running while I was also using the terminal, and the agent could not reliably access or control the terminal process I needed. I spent roughly two to three hours debugging the environment and figuring out how to get the development and verification workflow working properly.

This was a useful reminder that AI coding tools still depend on the local environment and that debugging the tooling itself can take as much time as debugging the application.

I also encountered several normal development issues during the build, including database/driver configuration problems, Windows terminal encoding issues, TypeScript errors, dependency conflicts, and production configuration problems. I used the agents to investigate the causes, but verified the fixes through actual commands and application behavior.

## 4. Refining AI Output

I did not keep every AI-generated implementation as-is.

A recurring pattern was:

```text
AI suggestion
    ↓
Run / inspect
    ↓
Find issue or UX weakness
    ↓
Refine the prompt
    ↓
Implement again
    ↓
Test
```

For example, during final polishing I noticed that some UI decisions still felt too much like an admin dashboard. I then used more constrained prompts to improve the builder sidebar, candidate experience, landing page, and visual hierarchy without changing the underlying architecture.

I also used focused prompts to fix real bugs instead of asking the agent to broadly "improve" the project.

## 5. AI Integration

Gemini was added as an assistive feature rather than an autonomous system.

The AI can generate:

- Hero copy
- About/company copy
- Culture copy
- Job descriptions

The recruiter still reviews the result and explicitly chooses whether to use it. AI does not automatically save or publish content.

During deployment I also found a production configuration issue where the AI endpoint returned `503` because the Gemini API key was not configured on the backend. I fixed the deployment configuration and verified the real production flow.

## 6. AI/Tool Prompts That Shaped the Product

Some of the main prompt themes I used were:

### Product and UX

- Define the recruiter-to-candidate experience.
- Make the builder feel like a professional content studio instead of a generic admin dashboard.
- Review the public page from the perspective of a candidate.
- Improve hierarchy without adding unnecessary features.

### Engineering

- Build company-scoped APIs.
- Separate draft and published career-page versions.
- Keep public job visibility limited to `OPEN` roles.
- Keep AI keys on the server.
- Add validation and error handling.
- Run regression checks after changes.

### Debugging

- Trace the full data flow instead of guessing.
- Identify the root cause before changing code.
- Make the smallest safe fix.
- Re-run tests and build after the fix.

## 7. Final Review

Near the end, I deliberately stopped feature development and used AI mainly for auditing and targeted fixes.

Some of the final issues found during review included:

- A clear-filters action that missed one filter.
- Publish errors that were not visible to the recruiter.
- Job form failures that did not provide feedback.
- Raw icon names appearing instead of actual icons.
- Production AI configuration missing.
- Social links being saved but not reaching the published footer.
- Visual hierarchy issues in the builder.

I treated these as bugs or usability problems and fixed them individually rather than expanding the scope.

## 8. What I Learned

The biggest lesson was that AI is much more useful when I give it a clear goal, constraints, and an existing architecture to work within.

I also learned that generated code still needs to be tested like normal code. Some of the most important fixes came from manually using the application and noticing behavior that a build or test alone would not reveal.

The final product was built with AI as a development partner, but the product decisions, testing, debugging, and final acceptance were still driven by my own review.
