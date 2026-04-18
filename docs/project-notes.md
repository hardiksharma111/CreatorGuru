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

## Design Preferences
- Avoid plain dashboard layouts.
- Use expressive typography, layered gradients, color variation, shadows, and subtle animation.
- Support both morning and night mode.
- Settings should not expose raw environment keys to end users.
- The UI should feel colorful and experimental rather than minimal and flat.

## Repo Hygiene
- Keep docs in `docs/`.
- Keep temporary extraction artifacts out of the repo.
- Update these notes after major implementation steps.

## Follow-up Reminder
- Fine-tuning a creator-specific model should be revisited later in backend planning.
