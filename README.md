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

Then open `http://localhost:3010`.

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
Backend is partially integrated:
- `/api/chat/message` is live with provider-backed responses.
- `/api/trends/niche` can run a Reddit PRAW + Social Searcher signal pipeline.
- Remaining feature APIs are still being completed slice-by-slice.

## Notes
- Dashboard coach and `/chat` both use the same live chat API flow.
- Trend Radar can use non-AI discovery signals through Reddit + Social Searcher.

## Trend Pipeline Setup (YouTube + open web, Reddit optional)
1. Install Python dependencies:

```bash
pip install -r scripts/trend_pipeline/requirements.txt
```

2. Configure local keys in `keys.md` and export them to your shell env before starting Next.js:
- `YOUTUBE_API_KEY`
- `YOUTUBE_VERIFY_TOP_K`
- `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are optional now

3. Run frontend:

```bash
npm run frontend:dev
```

4. Verify source:
- Open `/trends`
- Confirm the source label shows `youtube+internet` or `youtube+internet+youtube-verified`.
