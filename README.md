# CreatorGuru

AI-powered content strategy platform for solo YouTube and Instagram creators.

## Repository Layout
- `frontend/`: Next.js app (Pages Router) with all UI pages, components, and mock data.
- `backend/`: API route scaffolds, integration clients, services, and utility helpers.
- `docs/`: source project/product documents.
- `scripts/`: repo utility scripts.

## Quick Start
From repository root:

```bash
npm run verify:layout
npm run frontend:install
npm run frontend:dev
```

Then open `http://localhost:3000`.

## Frontend Pages Implemented
- Landing page: `/`
- Auth: `/auth`
- Dashboard: `/dashboard`
- Profile Analyzer: `/analyze`
- Trend Radar: `/trends`
- AI Coach Chat: `/chat`
- Post/Video Auditor: `/audit`
- Thumbnail & Caption Scorer: `/thumbnail`
- 30-Day Calendar: `/calendar`
- Competitor Benchmarking: `/benchmarks`
- Settings/Integrations: `/settings`

## Current Backend State
Backend is scaffolded with route placeholders and service stubs for all major features, but business logic and third-party integrations are still mostly mocked.

## Notes
- The frontend currently uses mock data and UI-first behavior.
- API integration wiring is the next implementation step.
