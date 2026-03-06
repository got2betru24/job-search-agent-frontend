# Job Search Agent — Frontend

A dark-mode React/TypeScript interface for a personal AI-powered job search agent. Aggregates job postings from curated company career pages, provides Claude-powered resume tailoring, and tracks application status — all in one place.

> **This is the frontend repo.** The backend (FastAPI + Python) lives in a separate repository. See [Backend](#backend) below.

---

## What It Does

- **Personal job board** — aggregates postings from your own curated list of company career pages (no job boards, no noise)
- **Resume tailoring** — Claude reads a job description and your base resume, then produces a tailored version side-by-side
- **Role-aware resumes** — maintains separate base resumes for Engineering Manager, Product Manager, and Engineer roles; automatically selects the right one per job
- **Application tracking** — simple funnel: New → Saved → Applied, with Archived as a soft-delete off-ramp
- **Filtering** — combine status filters (All / New / Applied / Archived) with role filters (EM / PM / DEV)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Node version | 22 (Alpine, containerized) |
| Styling | Plain CSS with CSS variables |
| Fonts | IBM Plex Sans + IBM Plex Mono |
| Reverse proxy | Traefik v3.6 |
| Container | Docker (Engine 20.10.21) |
| Compose | Docker Compose v2 |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                  # Shell and view routing
│   ├── App.css                  # Global styles and design tokens
│   ├── main.tsx                 # Entry point
│   ├── types/
│   │   └── index.ts             # JobStatus, JobRole, Job, Resume types
│   ├── data/
│   │   └── fakeData.ts          # Fake jobs and resumes (dev only)
│   └── components/
│       ├── Sidebar.tsx          # VS Code-style icon sidebar
│       ├── JobBoard.tsx         # Split pane: job list + detail + tailoring
│       ├── AppTracker.tsx       # Kanban tracker (commented out, coming soon)
│       └── ResumeManager.tsx    # Split pane: resume list + preview
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig*.json
```

---

## Views

### Job Board
The main view. Left pane shows a filterable job list; right pane shows the selected job's full description, requirements, match score, and base resume indicator. Clicking **Tailor Resume** replaces the detail view with a side-by-side diff of the base resume vs. the Claude-generated tailored version.

### Resume Manager
Displays all resumes — three role-specific base resumes plus any tailored versions generated per job. Select a resume to preview the full text.

### Application Tracker *(coming soon)*
Kanban-style board. Currently commented out in `Sidebar.tsx` and `App.tsx`.

---

## Job Status Flow

```
New → Saved → Applied
       ↓
    Archived
```

- **New** — freshly scraped, not yet reviewed
- **Saved** — interesting, intend to tailor and apply
- **Applied** — submitted
- **Archived** — not a fit right now; hidden from the default feed but preserved in the database so it won't resurface as new on the next scrape

---

## Role Types

Three job role types, each mapped to a distinct base resume on the backend:

| Role | Tag | Color |
|---|---|---|
| Engineering Manager | EM | Orange |
| Product Manager | PM | Purple |
| Engineer | DEV | Blue |

---

## Getting Started

This frontend is designed to run as part of the full Docker Compose stack alongside the backend, MySQL, and Traefik. Running it standalone is possible for UI development using the fake data layer.

### Prerequisites

- Docker Engine 20.10.21+
- Docker Desktop 4.15.0+
- Docker Compose v2.13.0+

### Running the Full Stack

Clone both repos into the same parent directory, then from the project root:

```bash
cp .env.example .env
# Fill in your values in .env
docker compose up --build
```

The frontend will be available at `http://localhost`.  
The Traefik dashboard is at `http://localhost:8080`.

### Environment Variables

The frontend container reads one environment variable at build time:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API base path (default: `/api`) |

All other secrets (DB credentials, Anthropic API key) are managed by the backend. See the backend repo for the full `.env` reference.

---

## Backend

The backend is a separate FastAPI (Python 3.13) service responsible for:

- Scraping and diffing career pages on a schedule
- Storing jobs, resumes, and application state in MySQL
- Calling the Anthropic API (Claude) for match scoring and resume tailoring
- Exposing a REST API consumed by this frontend at `/api`

> Backend repo: [**job-search-agent-backend**](https://github.com/got2betru24/job-search-agent-backend)

All API requests from the frontend are routed through Traefik via the `/api` path prefix — no direct frontend-to-backend networking configuration is needed.

---

## Development Notes

- **Hot reload** is enabled in dev — source files are mounted as a Docker volume so changes are reflected immediately without rebuilding
- **Fake data** lives in `src/data/fakeData.ts` and is used throughout the UI until backend API endpoints are wired up. Swap fake data imports for `fetch('/api/...')` calls as each endpoint is built
- **Playwright scraper** will run as a separate dedicated Docker service (not part of this repo) to keep the backend image lean
- The **Tracker view** is fully built but commented out pending a decision on the final status model

---

## Roadmap

- [ ] Wire up job listing API (`GET /api/jobs`)
- [ ] Wire up status update API (`PATCH /api/jobs/:id/status`)
- [ ] Wire up resume tailoring API (`POST /api/jobs/:id/tailor`)
- [ ] Wire up resume manager API (`GET /api/resumes`)
- [ ] Add source manager UI (add/remove career page URLs)
- [ ] Manual refresh button (trigger scrape on demand)
- [ ] Re-enable Application Tracker view
- [ ] Cover letter generation