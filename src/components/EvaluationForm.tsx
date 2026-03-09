import { useState } from "react";
import { generateText } from "../utils/ai";
import { DEMO_TRANSCRIPTS, DEMO_SCENARIO, DEMO_GOAL } from "../data/demoTranscripts";
import type { EvaluationResult, EvaluationSession, SkillScores } from "../types/evaluation";

interface EvaluationFormProps {
  onResult: (session: EvaluationSession) => void;
  sessionCount: number;
}

function sanitizeEvaluationResult(parsed: unknown): EvaluationResult {
  const p = (parsed ?? {}) as Record<string, unknown>;
  const rawScores = (p.scores ?? {}) as Record<string, unknown>;
  const coerceNum = (v: unknown) => Number(v) || 0;
  return {
    overall_score: coerceNum(p.overall_score),
    scores: {
      active_listening: coerceNum(rawScores.active_listening),
      empathy: coerceNum(rawScores.empathy),
      communication_clarity: coerceNum(rawScores.communication_clarity),
      conflict_resolution: coerceNum(rawScores.conflict_resolution),
      rapport_building: coerceNum(rawScores.rapport_building),
      questioning_technique: coerceNum(rawScores.questioning_technique),
      solution_orientation: coerceNum(rawScores.solution_orientation),
    },
    strengths: Array.isArray(p.strengths) ? p.strengths.map(String) : [],
    areas_for_improvement: Array.isArray(p.areas_for_improvement) ? p.areas_for_improvement.map(String) : [],
    recommended_phrases: Array.isArray(p.recommended_phrases) ? p.recommended_phrases.map(String) : [],
    overall_feedback: typeof p.overall_feedback === "string" ? p.overall_feedback : "",
    key_moments: Array.isArray(p.key_moments)
      ? p.key_moments.map((m: unknown) => {
          const km = (m ?? {}) as Record<string, unknown>;
          return {
            quote: typeof km.quote === "string" ? km.quote : "",
            type: km.type === "strength" ? "strength" : "weakness",
            annotation: typeof km.annotation === "string" ? km.annotation : "",
            skill:
              typeof km.skill === "string"
                ? (km.skill as keyof SkillScores)
                : "active_listening",
          };
        })
      : [],
  };
}

const SYSTEM_PROMPT = `You are an expert VR training coach evaluating a roleplay transcript.
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
Include 4 to 8 key_moments. Score honestly based on the transcript quality.`;

export function EvaluationForm({ onResult, sessionCount }: EvaluationFormProps) {
  const [scenario, setScenario] = useState("");
  const [goal, setGoal] = useState("");
  const [transcript, setTranscript] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<"" | "poor" | "average" | "strong">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as "" | "poor" | "average" | "strong";
    setSelectedDemo(val);
    setError("");
    if (val && DEMO_TRANSCRIPTS[val]) {
      setScenario(DEMO_SCENARIO);
      setGoal(DEMO_GOAL);
      setTranscript(DEMO_TRANSCRIPTS[val].transcript);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) {
      setError("Scenario description is required.");
      return;
    }
    if (!transcript.trim()) {
      setError("Transcript is required.");
      return;
    }
    setLoading(true);
    setError("");

    const effectiveGoal = goal.trim() || "Handle the situation effectively and professionally.";
    const prompt = `SCENARIO: ${scenario}
GOAL: ${effectiveGoal}

TRANSCRIPT:
${transcript}`;

    try {
      const result = await generateText({
        prompt,
        systemPrompt: SYSTEM_PROMPT,
        model: "gpt-4.1-mini",
        jsonMode: true,
      });

      if (!result.text) {
        setError("Evaluation failed — check that OPENAI_API_KEY is set in the Convex dashboard.");
        setLoading(false);
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(result.text);
      } catch {
        setError("AI returned invalid JSON. Please try again.");
        setLoading(false);
        return;
      }

      const evalResult = sanitizeEvaluationResult(parsed);
      const session: EvaluationSession = {
        id: crypto.randomUUID(),
        scenario,
        goal: effectiveGoal,
        transcript,
        label: `Session ${sessionCount + 1}`,
        result: evalResult,
        evaluatedAt: Date.now(),
      };
      onResult(session);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-6 ${loading ? "pointer-events-none opacity-60" : ""}`}
    >
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Demo Transcript
        </label>
        <select
          value={selectedDemo}
          onChange={handleDemoChange}
          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
        >
          <option value="">— Select a demo transcript —</option>
          <option value="poor">Poor performance</option>
          <option value="average">Average performance</option>
          <option value="strong">Strong performance</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scenario Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Describe the training scenario..."
                rows={5}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00c2ff] resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Goal <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should the trainee achieve?"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              />
            </div>
          </div>

          {/* Right column */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transcript <span className="text-red-400">*</span>
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the roleplay transcript here..."
              style={{ minHeight: "320px" }}
              className="w-full h-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00c2ff] resize-y font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-60 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: "var(--accent-coral)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Evaluating…
              </>
            ) : (
              "Evaluate Transcript"
            )}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </form>
    </div>
  );
}
