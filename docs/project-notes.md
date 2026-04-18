# CreatorGuru Project Notes

## Product Direction
- CreatorGuru is an AI content strategist for solo YouTube and Instagram creators.
- Core MVP flow: profile analysis, trend discovery, coach chat, post/video audit, thumbnail/caption scoring, 30-day content calendar, competitor benchmarking.

## Frontend State
- Next.js Pages Router app lives in `frontend/`.
- Current UI uses mock data but is fully runnable locally.
- Priority now: stronger visual identity, theme toggle, nicer motion, and less plain layout.

## Backend State
- `backend/` contains route stubs and service scaffolds for all major features.
- Real integrations still needed for YouTube, Instagram, Supabase, Gemini, and Groq.
- Fine-tuning/custom creator model should be revisited later in backend work, not now.

## Backend-First Execution Checklist
- [x] Slice 1: Dashboard and Trends data contract
	- Backend: implement `analyze/profile` + `trends/niche` responses with typed payloads.
	- Frontend: replace dashboard and trends mock imports with API calls.
	- Validation: verify cards render with live API payload and no mock fallback.
- [x] Slice 2: Coach chat loop
	- Backend: implement `chat/message` with request validation and provider adapter.
	- Frontend: send user prompt from chat screen and render assistant response.
	- Validation: prompt, response, and error-state handling work.
- [ ] Slice 3: Calendar generator
	- Backend: implement `calendar/generate` with niche + cadence inputs.
	- Frontend: replace calendar mock entries with generated plan.
	- Validation: month grid fills from API and supports regenerate action.
- [ ] Slice 4: Post and thumbnail analyzer
	- Backend: implement `analyze/post` + `analyze/thumbnail` scoring payloads.
	- Frontend: wire analyze and thumbnail pages to submit and render scores.
	- Validation: score breakdown and recommendations match API response.
- [ ] Slice 5: Benchmarks compare
	- Backend: implement `benchmarks/compare` payload and sorting.
	- Frontend: replace benchmark table mock rows with API data.
	- Validation: table sorting/filtering with real payload.
- [ ] Slice 6: Auth and persistence
	- Backend: wire Supabase auth/session and DB write paths.
	- Frontend: gate pages on auth state, store analyses/history.
	- Validation: login/logout/session persistence across refreshes.

## Mock Replacement Order
- Start with dashboard + trends because those pages are heavily visible and easiest to verify quickly.
- Remove `frontend/data/mockData.ts` usage page-by-page only after the corresponding backend endpoint is integrated.
- Keep a temporary fallback only during in-progress slice work, then remove fallback before checking off that slice.
- Add one checklist tick only when backend route, frontend wiring, and manual validation are all complete.

## Latest Progress
- Slice 1 completed: dashboard and trends now fetch live data from API routes instead of mock imports.
- Verified with successful `next build` and direct endpoint checks for `/api/analyze/profile` and `/api/trends/niche`.
- Dashboard UI pass completed from provided inspiration reference: cleaner analytics shell, grouped sidebar navigation, hero insight block, compact metric tiles, and quick action rail.
- Frontend baseline replaced with the provided v3 code direction: icon rail shell, animated hero/metric dashboard, canvas charts, period tabs, counters, and AI coach interactions are now the main implementation in Next.js.
- Slice 2 completed: chat page now posts to `/api/chat/message`, renders assistant replies live, and the endpoint returns contextual responses from a local adapter with optional provider selection.

## Design Preferences
- Avoid plain dashboard layouts.
- Use expressive typography, layered gradients, color variation, shadows, and subtle animation.
- Support both morning and night mode.
- Settings should not expose raw environment keys to end users.
- The UI should feel colorful and experimental rather than minimal and flat.
- Put the Morning/Night toggle in the left sidebar beneath Settings for visibility.
- Use stronger contrast and richer accent colors so controls and text stay visible.

## Repo Hygiene
- Keep docs in `docs/`.
- Keep temporary extraction artifacts out of the repo.
- Store local provider key placeholders in `keys.md` at the repo root. Keep the file untracked.
- Update these notes after major implementation steps.

## Follow-up Reminder
- Fine-tuning a creator-specific model should be revisited later in backend planning.
