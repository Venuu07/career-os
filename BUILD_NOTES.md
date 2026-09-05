## Decision — Backend Architecture

Chosen:
Next.js frontend + FastAPI backend + Neon PostgreSQL.

Reason:
Separate the presentation/API layers and keep Python available for
resume processing and AI workflows.

Rejected:
Next.js-only backend.

Reason:
The planned resume-processing and AI workload fits naturally into the
Python backend, and the separate API boundary gives us a clearer
architecture for future scale.

Status:
Accepted