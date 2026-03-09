
# Revisions: BUILD_PLAN v1 → v2

## Critical Issue Fixes

### 1. Build sequence: `npx convex codegen` moved before React work (was step 16, now step 4)
**Why**: `src/utils/ai.ts` calls `convex.action(api.openai.generateText, { ..., jsonMode: true })`. The generated `api` type doesn't include `jsonMode` until codegen runs after `convex/openai.ts` is modified. Without this fix, `npm run build` at step 15 would fail with a TypeScript type error on every execution. The original step 16 codegen is retained as a final verification pass (now step 17).

### 2. Runtime AI JSON sanitizer added (`sanitizeEvaluationResult`)
**Why**: `EvaluationResult` is a TypeScript type and provides no runtime guarantees. If the AI omits `strengths`, calling `result.strengths.map(...)` in `TraineeDashboard` throws and crashes the view. If any `scores.*` field is missing or is a string instead of a number, Recharts renders `NaN` values and broken bars. A new `sanitizeEvaluationResult` function is specified in Section 5 with `Number(v) || 0` coercion (handles both `undefined` and wrong-type values like `"high"`) and `Array.isArray` guards with `.map(String)` normalization. Step 12 in the build sequence now explicitly calls this sanitizer after `JSON.parse`.

### 3. Empty `result.text` guard added before `JSON.parse` in `EvaluationForm`
**Why**: `convex/openai.ts` returns `{ text: "", responseId: "" }` on API key absence, rate limits, and network errors. Without this guard, `JSON.parse("")` throws a `SyntaxError` and the user sees "AI returned invalid JSON." — an entirely misleading message. The fix checks `if (!result.text)` first and shows "Evaluation failed — check that OPENAI_API_KEY is set in the Convex dashboard." Step 12 in the build sequence and the submit behavior spec now both document this check explicitly.

---

## Architecture Concern Fixes

### 4. All chart components now use `ResponsiveContainer` instead of fixed `width` props
**Why**: Hard-coded pixel widths (`width=380`, `width=400`) cause charts to clip outside their containers on any screen narrower than the specified value. Every chart spec in Section 5 now wraps its chart in `<ResponsiveContainer width="100%" height={N}>` and removes the static `width` prop. This applies to: `SkillRadarChart`, `SkillBarChart`, `SessionComparisonChart`, `CohortRadarChart`, `TrendLineChart`. A new test criterion verifies no horizontal overflow at 375px mobile width.

### 5. `VITE_CHALLENGE_ID` removed from the env vars table (Section 6)
**Why**: Its only consumer (`VoteATron3000`) is deleted in this build. Leaving it in the table would confuse deployers. It has been removed from the table in Section 6, a note has been added to Section 9 explicitly stating it is no longer needed, and a note has been added to the `App.tsx` file spec listing it among removed imports.

### 6. `VITE_DEMO_PASSWORD` security-by-obscurity documented explicitly
**Why**: Vite inlines all `VITE_*` values at build time; any visitor can read the password in DevTools → Sources. The original plan was silent on this. The Overview (Section 1), the env vars table (Section 6), and the Deployment Notes (Section 9) now all state explicitly that this is intentional security-by-obscurity, not meaningful access control, so stakeholders are not surprised.

### 7. `jsonMode` guard changed to `if (args.jsonMode && !isReasoning)` in `convex/openai.ts`
**Why**: The Responses API rejects requests that contain both `body.reasoning` and `body.text`. If a reasoning model is ever passed with `jsonMode: true`, the original guard would produce an API error. The `!isReasoning` check makes the mutual-exclusion constraint explicit. Updated in Section 2 (file changes), Section 4 (Convex functions), and Step 3 of the build sequence.

---

## Missing Piece Fixes

### 8. `cancelAnimationFrame` cleanup specified for score counter animations
**Why**: Without cleanup, if the user switches sessions while the 800ms count-up animation is still running, the RAF callback fires on a stale closure and calls `setState` on outdated values, producing visible counter glitches. The `TraineeDashboard` spec now explicitly states: `const id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);` in the `useEffect` return. A new test criterion validates no animation glitches during mid-animation session switches.

### 9. `onSessionChange` now calls both `setActiveSessionId` and `setActiveView("trainee")`
**Why**: If the user is on the Admin view and clicks a session in the session selector (passed through to `TraineeDashboard`), only calling `setActiveSessionId` does not switch the visible view. The `Index` spec now states the handler must call both `setActiveSessionId(id)` and `setActiveView("trainee")`. The test criteria now include a check that the view remains on the Trainee tab after a session change.

### 10. Form loading overlay specified (`pointer-events-none opacity-60`)
**Why**: During the 3–10 second AI evaluation, the form was fully interactive, enabling duplicate submissions. The `EvaluationForm` Key UI spec now explicitly states: apply `pointer-events-none opacity-60` to the entire form during `loading`. This prevents re-submission and accidental navigation.

---

## Edge Case Fixes

### 11. `AnnotatedTranscript` quote matching uses normalized whitespace comparison
**Why**: `line.includes(moment.quote)` fails silently whenever the AI collapses whitespace or adds minor rewording in its quote. The spec now mandates a `normalize` helper — `const normalize = (s: string) => s.trim().replace(/\s+/g, " ");` — applied to both sides before comparison. The known limitation for multi-line quotes is documented in the spec so implementers are not surprised.

### 12. `sanitizeEvaluationResult` uses `Number(v) || 0` not `?? 0`
**Why**: `?? 0` only handles `null`/`undefined` but passes through wrong-type values like the string `"high"`. `Number("high")` is `NaN`; `NaN || 0` yields `0`. This coercion pattern handles both missing and schema-violating AI responses, preventing broken bar renders in `SkillBarChart`.

### 13. Demo selector change clears stale error state
**Why**: If a user submits with empty fields, sees a validation error, then selects a demo (which fills all fields), the red error message remained visible despite the form now being valid. The `EvaluationForm` spec now states that `selectedDemo` change also sets `error` to `""`.

### 14. Session label counter reset on refresh documented
**Why**: `sessionCount` derives from in-memory React state and resets to 0 on page refresh, causing "Session 1" to appear again after a refresh. No fix is required for a demo, but the behavior is now documented in Section 9 under "Known limitation" so reviewers are not confused.
