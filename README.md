# BoomStart

An AI-powered fitness dashboard for workouts, nutrition, and progress tracking.

## Overview

BoomStart helps users plan, track, and improve their fitness journey from one interface. It combines personalized training plans, nutrition intelligence, and habit-based progress monitoring.

## Key Features

- Personalized AI workout and diet planning
- Workout logging with sets, reps, weights, and schedule rotation
- Meal tracking from text and photo analysis
- AI nutrition coaching and weekly fitness insights
- Water, weight, and body measurement tracking
- Gym check-ins with photo verification and streak tracking

## Tech Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui
- **State & Routing:** React Query, React Router
- **Backend:** Lovable Cloud (Supabase), Postgres, RLS, Auth, Storage, Edge Functions
- **AI:** OpenAI-compatible chat completions API — Lovable AI Gateway (`google/gemini-2.5-flash`) by default, swappable via `LLM_API_URL`/`LLM_API_KEY` Supabase secrets
- **Notifications:** Sonner

## Setup & Run

```bash
bun install
cp .env.example .env   # fill in your Supabase project URL and anon/publishable key
bun dev
```

The Supabase project itself needs a `LLM_API_KEY` (or `LOVABLE_API_KEY`) secret set for the edge functions to reach an LLM — see [ARCHITECTURE.md](ARCHITECTURE.md#edge-functions).

## Usage

1. Complete onboarding to set goals, experience level, and profile metrics.
2. Generate your workout and nutrition plan.
3. Log workouts, meals, hydration, and measurements daily.
4. Review weekly AI insights and adjust your plan as needed.

## Project Structure

- `src/` — frontend application components and pages
- `supabase/functions/` — backend edge functions (see [ARCHITECTURE.md](ARCHITECTURE.md) for details)
- `supabase/migrations/` — database schema

## Contributing

Contributions are welcome. Please open an issue to discuss major changes before submitting a pull request.

## Contact

Maintained by [Siddharth Ahir](https://github.com/sidddharthhahir). Open an issue for questions or bug reports.
