# Build Plan: VR Feedback Dashboard

## 1. Overview

A single-page React app that accepts a training scenario description and a roleplay transcript, sends them to OpenAI via the existing Convex `generateText` action, and renders two rich dashboards: a trainee coaching view and an admin aggregate view. A simple password gate blocks access before the app renders. Three pre-loaded demo transcripts let reviewers immediately try the app without needing real data.

All state is client-side; no new Convex schema or tables are needed. Recharts provides the chart suite. The existing `src/utils/ai.ts` → `convex/openai.ts` pipeline is reused with a small addition to support JSON output mode.

---

## 2. File Changes Required

### File: `package.json`
- Action: MODIFY
- Purpose: Add Recharts as a dependency
- Key changes: Add `"recharts": "^2.13.3"` under `dependencies`

### File: `.env`
- Action: MODIFY (add line)
- Purpose: Supply the demo password for the password gate
- Key changes: Append `VITE_DEMO_PASSWORD=demo2024`

### File: `convex/openai.ts`
- Action: MODIFY
- Purpose: Allow callers to request JSON-object output mode from the Responses API
- Key changes:
  - Add `jsonMode: v.optional(v.boolean())` to `args`
  - In the `body` assembly block, after the reasoning/temperature conditionals, add: `if (args.jsonMode) { body.text = { format: { type: "json_object" } }; }`

### File: `src/utils/ai.ts`
- Action: MODIFY
- Purpose: Expose `jsonMode` option so callers can request JSON from OpenAI
- Key changes:
  - Add `jsonMode?: boolean` to `GenerateTextOptions` type
  - Pass `jsonMode: options.jsonMode` into the `convex.action(...)` call

### File: `src/App.tsx`
- Action: MODIFY
- Purpose: Replace the email-based gate with the new password gate; strip VoteATron and BrowserRouter boilerplate that is not needed for this app
- Key changes:
  - Remove `useGateAccess` hook (localStorage logic)
  - Remove import of `GateScreen`, `VoteATron3000`, `VoteATronErrorBoundary`, `BrowserRouter`, `Routes`, `Route`
  - Add `import { PasswordGate } from "./components/PasswordGate"`
  - Add `import Index from "./pages/Index"`
  - Replace body: `const [granted, setGranted] = useState(false);` then render `<ConvexProvider client={convex}>{granted ? <Index /> : <PasswordGate onAccessGranted={() => setGranted(true)} />}</ConvexProvider>`

### File: `src/components/PasswordGate.tsx`
- Action: CREATE
- Purpose: Full-screen password form shown before the app renders; checks input against `VITE_DEMO_PASSWORD`
- Key changes: See component spec in Section 5

### File: `src/types/evaluation.ts`
- Action: CREATE
- Purpose: Shared TypeScript types for the evaluation result JSON and session metadata
- Key changes: See types below in Section 5

### File: `src/data/demoTranscripts.ts`
- Action: CREATE
- Purpose: Three hardcoded demo transcripts (poor / average / strong) with a shared scenario description and optional goal, ready to populate the input form
- Key changes: Export `DEMO_SCENARIO`, `DEMO_GOAL`, and `DEMO_TRANSCRIPTS` constant

### File: `src/pages/Index.tsx`
- Action: MODIFY (full rewrite)
- Purpose: Replace template content with the VR Feedback Dashboard — tab navigation across three views: Input Form, Trainee Dashboard, Admin Dashboard
- Key changes: See component spec in Section 5

### File: `src/components/EvaluationForm.tsx`
- Action: CREATE
- Purpose: Scenario description, optional goal, demo transcript selector, transcript textarea, and submit button; calls `generateText` and passes result up via `onResult` callback
- Key changes: See component spec in Section 5

### File: `src/components/TraineeDashboard.tsx`
- Action: CREATE
- Purpose: Coaching view for a single evaluation result — radar + bar charts, score cards, qualitative text, annotated transcript
- Key changes: See component spec in Section 5

### File: `src/components/AdminDashboard.tsx`
- Action: CREATE
- Purpose: Aggregate view across all evaluated sessions — comparison table, grouped bar chart, trend line, cohort radar overlay
- Key changes: See component spec in Section 5

### File: `src/components/charts/SkillRadarChart.tsx`
- Action: CREATE
- Purpose: Recharts `RadarChart` rendering 7 skill dimensions + overall as a spider chart

### File: `src/components/charts/SkillBarChart.tsx`
- Action: CREATE
- Purpose: Animated horizontal `BarChart` with gradient fills and color-coded cells (red < 50, yellow 50–74, green ≥ 75)

### File: `src/components/charts/SessionComparisonChart.tsx`
- Action: CREATE
- Purpose: Grouped `BarChart` with one group per skill, one bar per session; uses session index to assign bar color

### File: `src/components/charts/CohortRadarChart.tsx`
- Action: CREATE
- Purpose: `RadarChart` with two series: cohort average polygon and individual session polygon; shown on admin dashboard

### File: `src/components/charts/TrendLineChart.tsx`
- Action: CREATE
- Purpose: `AreaChart` showing overall_score per session in evaluation order; rendered only when ≥ 2 sessions exist

### File: `src/components/AnnotatedTranscript.tsx`
- Action: CREATE
- Purpose: Renders the raw transcript text alongside a list of key moment callouts with strength/weakness badges and annotation text

---

## 3. Convex Schema Changes

No schema changes. No new tables. The existing `events`, `data`, `votes`, and `leads` tables are untouched.

---

## 4. Convex Functions

### openai/generateText (action) — MODIFY existing
- Purpose: Proxy OpenAI Responses API call, now with optional JSON output mode
- Args (additions only): `jsonMode: v.optional(v.boolean())`
- Returns: `{ text: string; responseId: string }` (unchanged)
- Logic addition: If `args.jsonMode === true`, set `body.text = { format: { type: "json_object" } }` before the `fetch` call. Place this after the reasoning/temperature conditional block and before `JSON.stringify(body)`.

No other Convex functions are created or modified.

---

## 5. React Components & Pages

### Types: `src/types/evaluation.ts`

```ts
export type SkillScores = {
  active_listening: number;        // 0–100
  empathy: number;
  communication_clarity: number;
  conflict_resolution: number;
  rapport_building: number;
  questioning_technique: number;
  solution_orientation: number;
};

export type KeyMoment = {
  quote: string;         // exact substring from the transcript
  type: "strength" | "weakness";
  annotation: string;    // explanation
  skill: keyof SkillScores;
};

export type EvaluationResult = {
  overall_score: number;           // 0–100
  scores: SkillScores;
  strengths: string[];             // 3–5 bullet items
  areas_for_improvement: string[]; // 3–5 bullet items
  recommended_phrases: string[];   // 3–5 example phrases
  overall_feedback: string;        // 2–4 sentence summary paragraph
  key_moments: KeyMoment[];        // 4–8 annotated moments
};

export type EvaluationSession = {
  id: string;            // crypto.randomUUID()
  scenario: string;
  goal: string;
  transcript: string;
  label: string;         // "Session 1", "Session 2", etc.
  result: EvaluationResult;
  evaluatedAt: number;   // Date.now()
};
```

---

### `PasswordGate`
- File: `src/components/PasswordGate.tsx`
- Props: `{ onAccessGranted: () => void }`
- State: `password: string`, `error: string`, `loading: boolean`
- Behavior:
  - Renders a centered card with title "VR Training Feedback Dashboard", subtitle "Demo Access", a password input, and an "Enter Demo" button.
  - On submit: set `loading = true`, wait 400 ms (artificial delay), then compare `password` against `import.meta.env.VITE_DEMO_PASSWORD`. If match, call `onAccessGranted()`. If no match, set `error = "Incorrect password."` and `loading = false`.
  - If `VITE_DEMO_PASSWORD` is undefined/empty, any non-empty password is accepted (dev fallback).
- Key UI: Dark-themed card (`bg-gray-900 text-white rounded-2xl shadow-2xl p-10 max-w-md`), gradient heading using `--accent-coral` → `--accent-sky`, subtle corner accent shapes matching the template aesthetic, error shown in red below the button.

---

### `Index` (page rewrite)
- File: `src/pages/Index.tsx`
- Props: none
- State:
  - `sessions: EvaluationSession[]` — array of all evaluated sessions, initially `[]`
  - `activeView: "form" | "trainee" | "admin"` — current tab, initially `"form"`
  - `activeSessionId: string | null` — which session is shown in trainee view, initially `null`
- Behavior:
  - Renders a sticky top nav bar with the app title and three tab buttons: "Evaluate", "Trainee Report", "Admin Insights".
  - "Trainee Report" and "Admin Insights" tabs are disabled (greyed out, `opacity-40 cursor-not-allowed`) when `sessions.length === 0`.
  - When `EvaluationForm` calls `onResult(session)`, push the session into `sessions`, set `activeSessionId` to the new session's id, and switch `activeView` to `"trainee"`.
  - Passes `sessions`, `activeSessionId`, and `onSessionChange: (id: string) => setActiveSessionId(id)` to `TraineeDashboard`.
- Key UI: Sticky top nav (`bg-gray-900/95 backdrop-blur border-b border-gray-700`) with gradient logo text; tab buttons use `--accent-coral` background for active state, gray for inactive. View area fills remaining height.

---

### `EvaluationForm`
- File: `src/components/EvaluationForm.tsx`
- Props: `{ onResult: (session: EvaluationSession) => void; sessionCount: number }`
- State: `scenario: string`, `goal: string`, `transcript: string`, `selectedDemo: "" | "poor" | "average" | "strong"`, `loading: boolean`, `error: string`
- Behavior:
  - On demo selector change: populate `scenario`, `goal`, and `transcript` from `DEMO_TRANSCRIPTS[value]`; update `selectedDemo`.
  - On submit:
    1. Validate `scenario` and `transcript` are non-empty; if not, set error and return.
    2. Set `loading = true`, `error = ""`.
    3. Build `systemPrompt` (see below).
    4. Build `prompt` embedding scenario, goal, and transcript (see below).
    5. Call `generateText({ prompt, systemPrompt, model: "gpt-4.1-mini", jsonMode: true })`.
    6. Parse `result.text` with `JSON.parse`. On parse failure, set `error = "AI returned invalid JSON. Please try again."` and `loading = false`, then return.
    7. Build `EvaluationSession` with `id: crypto.randomUUID()`, `label: \`Session ${sessionCount + 1}\``, `evaluatedAt: Date.now()`.
    8. Call `onResult(session)`.
  - `systemPrompt` (exact string to pass):
    ```
    You are an expert VR training coach evaluating a roleplay transcript.
    Return ONLY a JSON object with this exact structure — no markdown fences, no explanation text:
    {
      "overall_score": <integer 0-100>,
      "scores": {
        "active_listening": <integer 0-100>,
        "empathy": <integer 0-100>,
        "communication_clarity": <integer 0-100>,
        "conflict_resolution": <integer 0-100>,
        "rapport_building": <integer 0-100>,
        "questioning_technique": <integer 0-100>,
        "solution_orientation": <integer 0-100>
      },
      "strengths": [<3 to 5 string items>],
      "areas_for_improvement": [<3 to 5 string items>],
      "recommended_phrases": [<3 to 5 example phrases the trainee should practice>],
      "overall_feedback": "<2 to 4 sentence paragraph>",
      "key_moments": [
        {
          "quote": "<exact short quote from transcript, max 20 words>",
          "type": "strength",
          "annotation": "<1-2 sentence explanation>",
          "skill": "<one of: active_listening|empathy|communication_clarity|conflict_resolution|rapport_building|questioning_technique|solution_orientation>"
        }
      ]
    }
    Include 4 to 8 key_moments. Score honestly based on the transcript quality.
    ```
  - `prompt` (exact template):
    ```
    SCENARIO: {scenario}
    GOAL: {goal || "Handle the situation effectively and professionally."}

    TRANSCRIPT:
    {transcript}
    ```
- Key UI:
  - Demo selector dropdown at top, full width, placeholder "— Select a demo transcript —".
  - Two-column layout on desktop (stacks on mobile): left = scenario textarea + goal input; right = transcript textarea (min-height 320px).
  - Submit button at bottom right, full width on mobile. Shows spinner + "Evaluating…" during load.
  - Error shown in red below the submit button.

---

### `TraineeDashboard`
- File: `src/components/TraineeDashboard.tsx`
- Props: `{ sessions: EvaluationSession[]; activeSessionId: string | null; onSessionChange: (id: string) => void }`
- State: `activeTab: "overview" | "transcript"` (sub-tabs within trainee view), initially `"overview"`
- Behavior:
  - Derive `session = sessions.find(s => s.id === activeSessionId)`. If null, show placeholder.
  - If `sessions.length > 1`, render a session selector dropdown at top that calls `onSessionChange` on change.
  - "Overview" sub-tab: score cards row → two-column chart section → qualitative panels → overall feedback card.
  - "Transcript" sub-tab: `AnnotatedTranscript` component.
- Key UI:
  - **Score cards row** (4 cards): Overall Score, Best Skill (name + score), Needs Work (name + score), Key Moments count. Each card has an animated counter that counts up from 0 to value over 800ms using `useEffect` + `requestAnimationFrame`. Card background tinted by score: red < 50, yellow 50–74, green ≥ 75.
  - **Two-column chart section** (stacks on mobile): Left = `SkillRadarChart`, Right = `SkillBarChart`.
  - **Qualitative panels** (three cards, equal-width row, stack on mobile):
    - "Strengths": `CheckCircle` (lucide-react, green) icon per item
    - "Areas for Improvement": `AlertCircle` (lucide-react, orange) icon per item
    - "Recommended Phrases": `MessageSquare` (lucide-react, blue) icon + phrase in a pill badge per item
  - "Overall Feedback" paragraph in a white card with a quote/left-border accent.
  - Sub-tabs ("Overview" / "Annotated Transcript") rendered as pill toggle buttons.

---

### `AdminDashboard`
- File: `src/components/AdminDashboard.tsx`
- Props: `{ sessions: EvaluationSession[] }`
- State: none
- Behavior:
  - If `sessions.length === 0`: render empty state message.
  - Compute cohort averages: average each of the 7 skills and `overall_score` across all sessions.
  - Render four sections in order:
    1. Session Summary Table
    2. Skill Comparison Chart (`SessionComparisonChart`)
    3. Cohort vs Latest Session Radar (`CohortRadarChart`)
    4. Score Trend (`TrendLineChart`) — only when `sessions.length >= 2`
- Key UI:
  - **Session Summary Table**: sticky header row, columns = Session, Overall, Active Listening, Empathy, Clarity, Conflict, Rapport, Questions, Solutions. Score cells: `bg-red-100 text-red-800` < 50, `bg-yellow-100 text-yellow-800` 50–74, `bg-green-100 text-green-800` ≥ 75. Last row "Cohort Avg" in bold italic.
  - Section headers in consistent `text-xl font-bold mb-4` style with a subtle top border/divider.

---

### `AnnotatedTranscript`
- File: `src/components/AnnotatedTranscript.tsx`
- Props: `{ transcript: string; keyMoments: KeyMoment[] }`
- Behavior:
  - Split `transcript` by `\n` and render each line as a paragraph.
  - For each line, check if any `KeyMoment.quote` is contained in the line (`line.includes(moment.quote)` after normalizing whitespace). If matched, apply a colored left border: `border-l-4 border-green-400 pl-3` for strength, `border-l-4 border-orange-400 pl-3` for weakness, and a faint background tint.
  - Render a callout panel on the right listing all key moments: badge type pill, skill name in gray caps, italic quote, annotation text.
- Key UI: Two-column layout (`grid grid-cols-5 gap-6`): transcript on left (`col-span-3`), callouts on right (`col-span-2`). Stacks to single column on mobile. Callout cards have matching left border color.

---

### `SkillRadarChart`
- File: `src/components/charts/SkillRadarChart.tsx`
- Props: `{ scores: SkillScores; overallScore: number }`
- Key UI: Recharts `RadarChart` width=380 height=300. Data array: `[{ skill: "Listen", score: scores.active_listening }, { skill: "Empathy", score: scores.empathy }, { skill: "Clarity", score: scores.communication_clarity }, { skill: "Conflict", score: scores.conflict_resolution }, { skill: "Rapport", score: scores.rapport_building }, { skill: "Questions", score: scores.questioning_technique }, { skill: "Solutions", score: scores.solution_orientation }]`. One `Radar` with `fill="rgba(0,194,255,0.2)"` and `stroke="#00c2ff"`. `PolarRadiusAxis` domain `[0, 100]` with `tickCount={5}`. `Tooltip`.

---

### `SkillBarChart`
- File: `src/components/charts/SkillBarChart.tsx`
- Props: `{ scores: SkillScores; overallScore: number }`
- Key UI: Recharts `BarChart` `layout="vertical"` height=320. Data: all 7 skills + overall as rows sorted descending by score. One `Bar` `dataKey="score"` with `isAnimationActive={true}` `animationDuration={800}`. Each bar rendered with a `Cell` colored by score: `#ef4444` (< 50), `#f59e0b` (50–74), `#22c55e` (≥ 75). `XAxis` `type="number"` domain `[0, 100]`. `YAxis` `type="category"` `dataKey="name"` `width={110}`. `LabelList` inside bar shows score value.

---

### `SessionComparisonChart`
- File: `src/components/charts/SessionComparisonChart.tsx`
- Props: `{ sessions: EvaluationSession[] }`
- Key UI: Recharts `BarChart` height=320. X-axis = abbreviated skill names. One `Bar` per session, cycling through colors `["#00c2ff", "#ff5a5f", "#8b5cf6", "#f59e0b", "#22c55e"]`. `Legend` at bottom. `Tooltip` shows session label and score.

---

### `CohortRadarChart`
- File: `src/components/charts/CohortRadarChart.tsx`
- Props: `{ sessions: EvaluationSession[] }`
- Key UI: Recharts `RadarChart` width=400 height=300. Two `Radar` series: "Cohort Avg" (`fill="rgba(0,194,255,0.15)"`, `stroke="#00c2ff"`) and "Latest Session" (`fill="rgba(255,90,95,0.15)"`, `stroke="#ff5a5f"`). `Legend` at bottom.

---

### `TrendLineChart`
- File: `src/components/charts/TrendLineChart.tsx`
- Props: `{ sessions: EvaluationSession[] }`
- Behavior: Caller only renders this when `sessions.length >= 2`.
- Key UI: Recharts `AreaChart` height=200. `Area` `dataKey="overall_score"` `fill="rgba(0,194,255,0.15)"` `stroke="#00c2ff"`. `XAxis` `dataKey="label"`. `YAxis` domain `[0, 100]`. `CartesianGrid` with light dashed strokes. `Tooltip`. `ReferenceLine` at `y={60}` dashed gray labeled "Target".

---

### `src/data/demoTranscripts.ts` — full content

```ts
export const DEMO_SCENARIO =
  "Customer service de-escalation: a customer calls in furious about a damaged product they received as a birthday gift, threatening to post a negative review publicly.";

export const DEMO_GOAL =
  "Acknowledge the customer's frustration, take ownership of the issue, and offer a satisfying resolution while preserving the relationship.";

export const DEMO_TRANSCRIPTS: Record<
  "poor" | "average" | "strong",
  { label: string; transcript: string }
> = {
  poor: {
    label: "Poor performance",
    transcript: `Agent: Hi, what do you want?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed! This is absolutely unacceptable.
Agent: Okay, what's your order number?
Customer: I don't have it in front of me. Can you look it up by my name?
Agent: I need the order number. It's policy.
Customer: This is ridiculous. I'm a loyal customer and you're treating me like this?
Agent: Look, I just need the order number to help you.
Customer: Fine. Whatever. You know what, I'm going to post about this on every review site I can find.
Agent: That's your choice. I can't do anything without the order number.
Customer: You're not even sorry? You don't care that my daughter's birthday was ruined?
Agent: We ship thousands of packages. Damage happens sometimes. If you give me the order number I'll check.
Customer: Forget it. I'm never shopping here again.
Agent: Okay. Have a good day.`,
  },
  average: {
    label: "Average performance",
    transcript: `Agent: Thank you for calling support. How can I help you today?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed. I'm so upset right now.
Agent: I'm sorry to hear that. That sounds really frustrating. Can I get your order number?
Customer: I don't have it with me but can you look me up by name? It's Sarah Chen.
Agent: Sure, let me search for that. Found it. I can see the order. I'm sorry about the damaged item.
Customer: This was a birthday present and her party is tomorrow.
Agent: I understand this is time-sensitive. I can send a replacement but standard shipping would take 3 to 5 days.
Customer: That's too late! Her birthday is tomorrow!
Agent: I see your concern. I can offer you a refund if you'd like.
Customer: A refund doesn't fix tomorrow's birthday. I'm going to leave a review about this.
Agent: I understand your frustration. A refund is what I'm able to offer given the shipping timeframe. I'm really sorry.
Customer: Fine. Process the refund I guess.
Agent: Done. Is there anything else I can help with?
Customer: No. I'm disappointed.
Agent: I'm sorry again. Have a good day.`,
  },
  strong: {
    label: "Strong performance",
    transcript: `Agent: Thank you for calling, you've reached customer support. My name is Jordan. How can I help you today?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed. Her party is tomorrow and I am absolutely furious right now.
Agent: Oh no — I am so sorry. That is genuinely awful, especially with the party tomorrow. A damaged gift right before your daughter's birthday is exactly the kind of thing that should never happen, and I completely understand why you're upset. I want to make this right for you and for her.
Customer: Thank you for saying that. I've been on hold for twenty minutes and I was dreading this call.
Agent: That wait was too long and I appreciate your patience. You have every right to be frustrated on multiple levels here. Can I pull up your order? If you have your order number that's quickest, but I can also search by your name or email if that's easier.
Customer: My name is Sarah Chen.
Agent: Perfect, found you. I can see the order and the item. Sarah, here's what I can do: I'm going to flag this as a priority replacement and personally escalate it to our fulfillment team for overnight shipping at no charge to you. You should have it by 10am tomorrow morning. I'll also issue a full refund for the damaged item so you're not paying twice.
Customer: Wait — you can actually get it here by tomorrow morning?
Agent: That's what I'm pushing for. I want to be transparent: it depends on our warehouse stock and courier cutoff, so I'm going to stay on this call with you, place the escalation right now, and confirm the delivery window before we hang up. Would that work for you?
Customer: Yes, absolutely. I really appreciate you actually trying to help.
Agent: Of course. While I'm placing the escalation — I want to ask, was there any other part of the experience that was disappointing, like the packaging or the communication leading up to delivery? I want to flag everything.
Customer: Honestly the box looked like it had been dropped from a height. The outer packaging was barely taped.
Agent: That's really helpful to know and I'm noting it in your account so our quality team reviews that shipment route. Okay — escalation is in. Overnight delivery confirmed for tomorrow before noon, and your refund will appear in 3 to 5 business days. You'll get an email confirmation in the next 10 minutes. Is there anything else I can do for you today, Sarah?
Customer: No, this is more than I expected honestly. Thank you Jordan.
Agent: I'm glad we could turn this around. I hope your daughter has a wonderful birthday tomorrow.`,
  },
};
```

---

## 6. Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `VITE_CONVEX_URL` | Client (Vite) | Convex deployment URL |
| `VITE_CHALLENGE_ID` | Client (Vite) | App identifier for VoteATron/tracking |
| `VITE_DEMO_PASSWORD` | Client (Vite) | Password for the demo gate; defaults to accepting any non-empty string if unset |
| `OPENAI_API_KEY` | Convex server | OpenAI API key; set in Convex dashboard environment variables |
| `RESEND_API_KEY` | Convex server | Resend email key (template default; not used by this app) |

---

## 7. Build Sequence

Follow this exact order:

1. **Install Recharts**: Run `npm install recharts@^2.13.3`. Verify it appears under `dependencies` in `package.json`.

2. **Add `.env` entry**: Append `VITE_DEMO_PASSWORD=demo2024` to `.env` (create the file at project root if it doesn't exist).

3. **Modify `convex/openai.ts`**: Add `jsonMode: v.optional(v.boolean())` to args. Add `if (args.jsonMode) { body.text = { format: { type: "json_object" } }; }` after the temperature/reasoning conditionals and before `JSON.stringify(body)`. Do not change the `"use node"` directive or any other logic.

4. **Modify `src/utils/ai.ts`**: Add `jsonMode?: boolean` to `GenerateTextOptions` type. Pass `jsonMode: options.jsonMode` into the `convex.action(...)` call arguments.

5. **Create `src/types/evaluation.ts`**: Write `SkillScores`, `KeyMoment`, `EvaluationResult`, `EvaluationSession` types exactly as specified above.

6. **Create `src/data/demoTranscripts.ts`**: Write the three demo transcript entries, `DEMO_SCENARIO`, `DEMO_GOAL`, and `DEMO_TRANSCRIPTS` as specified above.

7. **Create `src/components/PasswordGate.tsx`**: Implement the password gate component per the spec. Keep it self-contained.

8. **Modify `src/App.tsx`**: Replace `GateScreen` + localStorage gate with `PasswordGate` + `useState(false)`. Remove `VoteATron3000`, `VoteATronErrorBoundary`, `BrowserRouter`, `Routes`, `Route`. Final render: `<ConvexProvider client={convex}>{granted ? <Index /> : <PasswordGate onAccessGranted={() => setGranted(true)} />}</ConvexProvider>`.

9. **Create chart components** (all independent, any order):
   - `src/components/charts/SkillRadarChart.tsx`
   - `src/components/charts/SkillBarChart.tsx`
   - `src/components/charts/SessionComparisonChart.tsx`
   - `src/components/charts/CohortRadarChart.tsx`
   - `src/components/charts/TrendLineChart.tsx`

10. **Create `src/components/AnnotatedTranscript.tsx`**: Implement per spec.

11. **Create `src/components/EvaluationForm.tsx`**: Implement form, demo selector, evaluation prompt construction, `generateText` call, JSON parse, session assembly, and `onResult` callback.

12. **Create `src/components/TraineeDashboard.tsx`**: Assemble score cards (with animated counters), chart grid, qualitative panels, `AnnotatedTranscript` sub-tab. Import chart components.

13. **Create `src/components/AdminDashboard.tsx`**: Assemble session table (with heat-map score cells and cohort avg row), `SessionComparisonChart`, `CohortRadarChart`, conditional `TrendLineChart`. Compute cohort averages inline.

14. **Rewrite `src/pages/Index.tsx`**: Implement three-view tab nav with `sessions` state. Wire `EvaluationForm.onResult` to push session and switch to trainee view. Pass all needed props to dashboard components.

15. **Run `npm run build`**: Fix any TypeScript or import errors until exit code 0.

16. **Run `npx convex codegen`**: Confirm exit code 0.

---

## 8. Test Criteria

- `npm run build` exits 0 with no TypeScript errors
- `npx convex codegen` exits 0 with no schema validation errors
- App loads to the password gate; entering `demo2024` grants access; wrong password shows "Incorrect password." error message
- "Trainee Report" and "Admin Insights" tabs are non-interactive (visually disabled) before any evaluation
- Selecting "Poor performance" from the demo selector populates all three form fields (scenario, goal, transcript)
- Clicking "Evaluate" with the poor demo transcript (and `OPENAI_API_KEY` set in Convex) returns a parsed result and switches to the Trainee dashboard
- Trainee dashboard renders with radar chart, bar chart, 4 score summary cards, 3 qualitative panels, and overall feedback card
- Annotated Transcript sub-tab renders the transcript text with at least one highlighted line and a callout panel
- Running a second evaluation switches session selector and makes the Admin Insights tab available
- Admin dashboard shows session table with colored cells, grouped bar chart, cohort radar, and (with 2+ sessions) trend line chart
- Session selector on Trainee dashboard allows switching between two evaluated sessions and re-renders charts

---

## 9. Deployment Notes

- **Convex**: No schema migration needed. The existing deployment handles `openai.generateText`. Ensure `OPENAI_API_KEY` is set in the Convex dashboard under **Settings → Environment Variables** before running evaluations.
- **Vite/Vercel**: Set `VITE_DEMO_PASSWORD` in Vercel's **Settings → Environment Variables** before deploying. `VITE_CONVEX_URL` must also be set there.
- No new Convex env vars are required — `OPENAI_API_KEY` was already a template requirement.
- The app has no server-side routes beyond the existing Convex HTTP actions; plain static hosting (Vercel, Netlify) works without additional configuration.
