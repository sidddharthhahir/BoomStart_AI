# BoomStart

A focused fitness companion — AI workouts, nutrition tracking, body measurements, and daily habits in one clean dashboard.

**Live:** https://boomstart.lovable.app

---

## Features

### Workouts
- AI-generated workout plans personalized by goal, experience, and body profile
- Workout logger with sets, reps, weights, and editable history
- Rest day toggle and weekly schedule (PPL / ABC rotation)

### Nutrition
- Meal logging via natural language or photo analysis (Gemini 2.5 Flash)
- AI nutrition coach chat
- Calorie + protein tracking with daily targets
- AI-generated diet plan

### Health & Progress
- Water tracking with daily goals
- Body measurements tracker (weight, waist, chest, arms, etc.)
- Weight log + progress charts
- Gym photo check-ins with streak tracking
- Weekly AI insights

### Other
- Future messages, vision board, tomorrow list, life countdowns
- Public profile sharing (`/u/:username`)
- Onboarding flow with calculated TDEE & macros

---

## Tech Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui
- **State:** React Query, React Router
- **Backend:** Lovable Cloud (Supabase) — Postgres + RLS, Auth, Storage, Edge Functions
- **AI:** Lovable AI Gateway (default: `google/gemini-2.5-flash`)
- **Notifications:** Sonner (toasts)

### Edge Functions
All edge functions use the shared LLM helper at `supabase/functions/_shared/llm-config.ts` for provider-agnostic AI calls.

- `generate-fitness-plan` — workout + diet plan
- `adjust-plan` — adapt plan to missed days or low gains
- `parse-meal` / `analyze-meal-photo` — log meals from text or image
- `nutrition-ai` — coaching chat
- `generate-weekly-insights` — Sunday recap

---

## Development

```bash
bun install
bun dev
```

Environment is auto-configured via Lovable Cloud — no `.env` setup needed.

## Security

All user tables use Row-Level Security scoped to `auth.uid()`. Storage buckets (`checkins`, `meal-photos`) are private; access via signed URLs only. See `mem://security/*` notes for full policy.
