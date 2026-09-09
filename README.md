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
- Gym check-ins, streak tracking, and public profile sharing

## Tech Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui
- **State & Routing:** React Query, React Router
- **Backend:** Lovable Cloud (Supabase), Postgres, RLS, Auth, Storage, Edge Functions
- **AI:** Lovable AI Gateway (`google/gemini-2.5-flash` by default)
- **Notifications:** Sonner

## Setup & Run

```bash
bun install
bun dev
```

Environment configuration is handled by Lovable Cloud, so no local `.env` setup is required.

## Usage

1. Complete onboarding to set goals, experience level, and profile metrics.
2. Generate your workout and nutrition plan.
3. Log workouts, meals, hydration, and measurements daily.
4. Review weekly AI insights and adjust your plan as needed.

## Project Structure

- `src/` — frontend application components and pages
- `supabase/functions/` — backend edge functions
- `supabase/functions/_shared/llm-config.ts` — shared AI provider configuration

## Contributing

Contributions are welcome. Please open an issue to discuss major changes before submitting a pull request.

## License / Contact

This repository is maintained by the BoomStart team. For collaboration or support, open an issue in this repository.
