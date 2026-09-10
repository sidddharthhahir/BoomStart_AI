# BoomStart Architecture

## Overview

BoomStart is a full-stack fitness coaching app: React + TypeScript frontend, Supabase backend (Postgres, Auth, Storage, Edge Functions), with AI-generated workout/diet plans via an OpenAI-compatible LLM gateway.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Backend**: Supabase (Auth, Postgres, Edge Functions, Storage)
- **AI**: OpenAI-compatible chat completions API (Lovable AI Gateway by default; provider is swappable via `LLM_API_URL`/`LLM_API_KEY`)

## Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/               # MainLayout, DesktopNav, MobileNav, OnboardingHint
│   ├── dashboard/             # QuickStatsGrid
│   ├── Hero.tsx               # Landing page hero
│   ├── OnboardingForm.tsx     # User profile setup
│   ├── DietPlan.tsx, WorkoutPlan.tsx
│   ├── ProgressTracker.tsx    # Weight & weekly insights
│   ├── MealLogger.tsx, NutritionChat.tsx
│   ├── WorkoutLogger.tsx
│   ├── GymCheckin.tsx         # Photo check-in
│   ├── PlanAdjustment.tsx     # AI plan re-adjustment
│   ├── BodyMeasurements.tsx, WaterTracker.tsx, RestDayToggle.tsx
│   ├── TodayFocus.tsx, TomorrowList.tsx, VisionBoard.tsx
│   ├── LifeCountdowns.tsx, FutureMessage.tsx
│   ├── ProfileSection.tsx, ErrorBoundary.tsx
│   └── ThemeProvider.tsx, ThemeToggle.tsx
├── pages/
│   ├── Index.tsx        # Landing page with auth flow
│   ├── Auth.tsx          # Sign in/up
│   ├── Dashboard.tsx, Workouts.tsx, Nutrition.tsx, Progress.tsx, Photos.tsx, Profile.tsx
│   └── NotFound.tsx
├── routes/AppRoutes.tsx  # Protected route definitions (loads the user's profile, redirects to onboarding if missing)
├── hooks/
│   ├── useAuth.tsx
│   ├── useBodyMeasurements.ts, useRestDay.ts, useWaterSleepStats.ts, useDashboardStats.ts
│   └── use-mobile.tsx
├── integrations/supabase/
│   ├── client.ts    # Supabase client (auto-generated)
│   └── types.ts     # Database types (auto-generated)
└── lib/
    ├── utils.ts, validationSchemas.ts (Zod)
    └── notifications.ts   # Local reminder scheduling via Service Worker
```

## Database Schema (active tables)

1. **profiles** — weight, height, age, gender, goal, experience, dietary_preference
2. **fitness_plans** — AI-generated plan_data (JSON), target_calories, target_protein, tdee, is_active
3. **workout_logs** — completed workouts (exercises JSON, completed, notes)
4. **meal_logs** — logged meals (items JSON, total_calories, total_protein)
5. **weight_logs** — daily weight entries
6. **weekly_insights** — AI-generated progress analysis
7. **gym_checkins** — photo check-in attendance (photo_url, ai_is_gym, ai_comment)
8. **body_measurements**, **rest_days**, **water_logs**, **sleep_logs**
9. **countdowns**, **future_messages**, **tomorrow_tasks**, **vision_board_items** — dashboard habit widgets

> The migrations also define `buddies`, `buddy_invites`, `commitments`, `group_challenges`, `challenge_members`, `challenge_checkins`, `dream_logs`, and the `gita_*` tables from earlier iterations of the product. No current frontend code reads or writes them — see "Known gaps" below.

## Storage Buckets

- **checkins** — gym check-in photos (private, signed URLs)
- **meal-photos** — meal photos for AI analysis (private, signed URLs)

## Security

- Zod validation (`src/lib/validationSchemas.ts`) with realistic bounds (age 13–120, weight 20–500kg, height 50–300cm); edge functions re-validate the same bounds server-side
- User-submitted text sent to the LLM is sanitized to strip prompt-injection patterns (`ignore previous instructions`, fake `system:`/`user:` role markers) before interpolation
- RLS enabled on all tables — `auth.uid() = user_id`
- Both storage buckets are private; photos are served via short-lived signed URLs

## Edge Functions

1. **generate-fitness-plan** — creates a personalized workout/diet plan from onboarding data (Mifflin-St Jeor TDEE, protein targets, a weekly workout split)
2. **generate-weekly-insights** — summarizes the last 7 days of logs and returns AI recommendations
3. **parse-meal** — parses a free-text meal description into calorie/protein estimates
4. **analyze-meal-photo** — same as parse-meal, but from a photo via a vision-capable model
5. **adjust-plan** — re-adjusts an active plan's calories/protein/workout split based on user feedback
6. **nutrition-ai** — conversational nutrition coach (chat-style, keeps short conversation history)

Each function reads its LLM credentials from `LLM_API_KEY`/`LLM_API_URL`/`LLM_MODEL` (falling back to `LOVABLE_API_KEY` and the Lovable gateway URL), so switching providers is a Supabase secrets change, not a code change.

## Key Flows

**Onboarding**: Hero → Sign in → Onboarding form → `generate-fitness-plan` → Dashboard

**Daily usage**: Dashboard → view plan → log workouts/meals → track hydration, sleep, weight → weekly AI insights

## Calculations

**TDEE** (Mifflin-St Jeor):
- Male: BMR = 10×weight + 6.25×height − 5×age + 5
- Female: BMR = 10×weight + 6.25×height − 5×age − 161
- TDEE = BMR × activity multiplier (1.2–1.9)

**Targets**: Bulk = TDEE + 300–400, Cut = TDEE − 400–500, Protein = 1.6–2.2g/kg bodyweight

## Known gaps

- The DB schema carries tables for features not present in the current UI (accountability buddies, commitment contracts, group challenges, a dream journal, a Bhagavad Gita tracker). They appear to be leftovers from an earlier product direction — worth a decision on whether to build the UI, migrate the data out, or drop the tables.
