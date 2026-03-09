# Critique 1

## Critical Issues (must fix before build)

- **Build sequence: codegen runs after build (steps 15 → 16), guaranteed TypeScript error**: `src/utils/ai.ts:16` calls `convex.action(api.openai.generateText, { ..., jsonMode: true })`. The generated `api.openai.generateText` args type won't include `jsonMode` until `npx convex codegen` is run after modifying `convex/openai.ts`. TypeScript will reject the extra property and `npm run build` (step 15) will fail. → Fix: insert `npx convex codegen` as a new step immediately after step 3 (modifying `convex/openai.ts`) and before any React component work, then keep the existing step 16 codegen as a final verification pass.

- **No runtime validation of parsed AI JSON causes React crashes**: `EvaluationResult` is a TypeScript type; it provides zero runtime guarantees. If the AI omits `strengths`, `TraineeDashboard`'s `result.strengths.map(...)` throws and the entire view crashes. If any `scores.*` field is missing, chart data rows contain `undefined`, producing `NaN` values in Recharts cells and `LabelList` text. The system prompt instructs the AI to follow the schema, but LLM output is never guaranteed. → Fix: after `JSON.parse`, apply a sanitize step that fills in defaults before building `EvaluationSession` — e.g., `strengths: parsed.strengths ?? []`, `scores: { active_listening: parsed.scores?.active_listening ?? 0, … }`. A one-function sanitizer with `?? 0` / `?? []` / `?? ""` defaults costs ~15 lines and eliminates the crash class entirely.

- **`result.text === ""` triggers misleading error message**: `convex/openai.ts` returns `{ text: "", responseId: "" }` on missing API key, rate limit, or network error (lines 43–44, 96–97, 107). `EvaluationForm` will call `JSON.parse("")`, get a `SyntaxError`, and show "AI returned invalid JSON." to the user, when the real issue is an API connectivity problem. → Fix: before `JSON.parse`, check `if (!result.text) { setError("Evaluation failed — check that OPENAI_API_KEY is set in the Convex dashboard."); … return; }`.

---

## Architecture Concerns

- **Fixed chart `width` props overflow on mobile**: Every chart component specifies a hard-coded pixel width (e.g., `SkillRadarChart` `width=380`, `CohortRadarChart` `width=400`). On any screen narrower than the specified value the chart clips outside its container. Recharts ships `ResponsiveContainer` precisely for this — wrap each chart in `<ResponsiveContainer width="100%" height={N}>` and remove the static `width` prop.

- **`VITE_CHALLENGE_ID` is listed in Section 6 env vars table but its consumer (`VoteATron3000`) is being deleted**: Deployers will see the variable in the docs and wonder what it does. Remove it from the table and add a note in Section 9 that the challenge ID is no longer needed.

- **`VITE_DEMO_PASSWORD` is compiled into the client bundle**: Vite inlines all `import.meta.env.VITE_*` values at build time; any visitor can read it in DevTools → Sources in two seconds. This is acceptable for a frictionless demo gate, but the plan should explicitly document this as security-by-obscurity so stakeholders aren't surprised.

- **`body.text` assignment doesn't guard against reasoning model conflicts**: The plan places `if (args.jsonMode) { body.text = { format: { type: "json_object" } }; }` after the reasoning block. If a reasoning model is ever passed with `jsonMode: true`, the Responses API will receive both `body.reasoning` and `body.text` — a combination the API does not support and will reject. The guard should be `if (args.jsonMode && !isReasoning)` to make the constraint explicit.

---

## Missing Pieces

- **`requestAnimationFrame` cleanup in animated score counters**: The plan specifies `useEffect` + `requestAnimationFrame` for the 800 ms count-up animation but says nothing about cleanup. If the user switches sessions while the animation is running, the RAF callback fires on a stale closure and calls `setState` after the component's dependency values have changed, producing visible counter glitches. Fix: `const id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);` in the `useEffect` return.

- **`onSessionChange` wiring in `Index` is under-specified**: The plan passes `onSessionChange: (id: string) => setActiveSessionId(id)` to `TraineeDashboard`, and `TraineeDashboard` passes it to a dropdown. But `Index` also needs to stay on `activeView === "trainee"` when this fires — if `activeView` is somehow "admin" when the change occurs, the UI won't update. The spec doesn't describe this guard. Worth making explicit: `onSessionChange` should also call `setActiveView("trainee")`.

- **No loading overlay or progress cue during the 3–10 second AI evaluation beyond the button label**: The only feedback is "Evaluating…" text on the submit button. The form remains fully interactive, making it easy to accidentally re-submit or navigate away. A simple `pointer-events-none opacity-60` overlay on the form during `loading` prevents duplicate submissions.

---

## Edge Cases Not Handled

- **`AnnotatedTranscript` quote matching will silently fail in practice**: `line.includes(moment.quote)` requires the AI's quote to be a byte-for-byte substring of a single line in the raw transcript. The AI frequently rephrases, adds ellipses, or collapses whitespace in quotes; it may also select quotes that span a line break. Result: zero highlighted lines, making the most visually distinctive feature of the Trainee Report a no-op. Mitigation: normalize both sides with `trim()` and collapsed whitespace before comparing; or ask the AI to return character offsets instead of raw quotes.

- **`JSON.parse` on valid-JSON but schema-violating AI response**: The AI could return `{"overall_score": "high", …}` (string instead of number) or include required keys with `null` values. TypeScript won't catch this at runtime. `SkillBarChart` sorting by `.score` and passing the value to `Cell` will quietly render broken bars. The sanitizer recommended above should also coerce `Number(parsed.overall_score) || 0` rather than just `?? 0`.

- **`DEMO_TRANSCRIPTS` selector does not clear stale error state**: If a user submits with an empty field, sees an error, then selects a demo transcript (which fills all fields), the stale error message remains visible. Fix: clear `error` when `selectedDemo` changes.

- **Session label counter resets on page refresh**: `sessionCount` derives from `sessions.length` in React state, which resets to 0 on refresh. If a reviewer evaluates three sessions, refreshes, and evaluates a fourth, it will be labeled "Session 1" again — potentially confusing for anyone taking screenshots or comparing runs. No fix required for a demo, but worth documenting.

---

## Overall Risk Level

**MEDIUM** — One hard build blocker (codegen order must be fixed before writing any React code), one crash-level bug (missing runtime JSON validation on AI response), and one misleading error that will confuse reviewers when the API key is absent. Everything else is UX degradation. All issues are fixable with small, targeted changes before implementation begins.
