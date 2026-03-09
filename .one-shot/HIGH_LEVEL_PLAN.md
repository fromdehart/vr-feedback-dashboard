# High-Level Plan: VR Feedback Dashboard

## What It Does
A demo web application that accepts roleplay/VR training transcripts along with a scenario description, sends them to the OpenAI API, and renders two structured dashboards: a trainee-facing coaching dashboard and an admin-facing aggregate insights dashboard. The system includes pre-loaded sample transcripts at varying performance levels for immediate demonstration. No backend persistence is needed — evaluation results are held in React state and dashboards populate directly from the returned JSON.

## Key Features
- Simple password gate on the demo to protect API token usage
- Scenario input form: scenario description, optional goal, and transcript paste area
- AI transcript evaluation via the existing Convex `generateText` action (`src/utils/ai.ts` → `convex/openai.ts`, model: `gpt-4.1-mini`) returning structured JSON scores and qualitative feedback
- Trainee coaching dashboard:
  - Radar/spider chart of all 7 skill dimensions + overall score (Recharts `RadarChart`)
  - Animated horizontal bar chart for individual skill scores with color gradients
  - Strengths and areas-for-improvement with icon badges
  - Recommended phrases panel
  - Annotated transcript with inline strength/weakness highlights and hover tooltips per key moment
  - Score summary cards with animated number reveals
- Admin insights dashboard:
  - Session comparison table with color-coded score cells (heat map style)
  - Grouped bar chart comparing skill scores across all evaluated sessions
  - Aggregate radar overlay showing cohort average vs individual sessions
  - Trend line chart if multiple sessions are evaluated
- Pre-loaded demo transcripts (low/medium/high performance) selectable from the input form
- All state is client-side; no persistence layer required

## Tech Stack
- Frontend: React + Vite + Tailwind (template already in place)
- Backend: Convex (existing `convex/openai.ts` action used as the AI proxy — no new schema or tables needed)
- AI: OpenAI `gpt-4.1-mini` via the existing `generateText` utility in `src/utils/ai.ts`
- Charts: Recharts (add as dependency) — `RadarChart`, `BarChart`, `LineChart`, `ComposedChart` for maximum visual richness
- Auth: Hardcoded password gate (env var `VITE_DEMO_PASSWORD`); simple client-side check before the app renders

## Scope & Constraints
**In scope:**
- Password gate: single shared password stored in `.env` as `VITE_DEMO_PASSWORD`; blocks access until entered correctly; no sessions/cookies needed
- Single-page app with tab/view switching between input form, trainee dashboard, and admin dashboard
- OpenAI-powered evaluation using `gpt-4.1-mini`, returning all specified metrics (7 skill scores + overall_score, qualitative fields, key_moments array) as JSON via `response_format: { type: "json_object" }`
- 3 hardcoded demo transcripts (poor/average/strong performance) selectable from the input form
- Client-side state management for the current session's evaluations (array of results for admin view)
- Responsive layout suitable for desktop demo
- Visually rich chart suite: radar chart for skill profile, animated bar chart for scores, grouped bar chart for session comparison, trend line if multiple sessions present

**Out of scope:**
- Persistent storage / Convex database tables (no schema changes)
- User authentication or multi-tenant sessions (password gate only)
- File upload for transcripts (paste only)
- Export/download of reports
- Real-time collaborative evaluation
- Real VR/headset integration

## Implementation Approach
1. Add Recharts as a dependency
2. Add password gate component: reads `VITE_DEMO_PASSWORD` from env; renders a centered login form; stores auth state in React state (no localStorage)
3. Build the evaluation prompt: system prompt with scenario/goal injection; enforce JSON output with all required metrics and key_moments array using `response_format: { type: "json_object" }`; call `generateText` with `model: "gpt-4.1-mini"`
4. Build the input form view: scenario, goal, transcript fields; demo transcript selector dropdown; submit button calls `generateText` and stores result in React state array
5. Build the trainee coaching dashboard: RadarChart for skill profile, animated BarChart for individual scores with gradient fills, score summary cards, qualitative text sections, annotated transcript with key moment highlights and tooltips
6. Build the admin insights dashboard: session list table with heat-map score cells, grouped BarChart comparing all sessions, ComposedChart with aggregate radar overlay, trend LineChart
7. Wire tab/view navigation and loading/error states

## Open Questions
- Should the admin dashboard persist evaluations across page reloads (e.g., localStorage), or reset on each visit? (Current plan: reset on visit)
- For key_moments, should the UI highlight the exact quoted line within the rendered transcript, or display them as a separate annotated list alongside the transcript? (Current plan: annotated list alongside, with visual callouts)
- Should the radar chart and bar chart be shown simultaneously on the trainee dashboard, or toggled? (Current plan: both visible simultaneously in a two-column layout)
