import { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import type { EvaluationSession, SkillScores } from "../types/evaluation";
import { SkillRadarChart } from "./charts/SkillRadarChart";
import { SkillBarChart } from "./charts/SkillBarChart";
import { AnnotatedTranscript } from "./AnnotatedTranscript";

interface TraineeDashboardProps {
  sessions: EvaluationSession[];
  activeSessionId: string | null;
  onSessionChange: (id: string) => void;
}

const SKILL_LABELS: Record<keyof SkillScores, string> = {
  active_listening: "Active Listening",
  empathy: "Empathy",
  communication_clarity: "Clarity",
  conflict_resolution: "Conflict Resolution",
  rapport_building: "Rapport Building",
  questioning_technique: "Questioning",
  solution_orientation: "Solutions",
};

function scoreColor(score: number): string {
  if (score < 50) return "bg-red-900/40 border-red-700";
  if (score < 75) return "bg-yellow-900/40 border-yellow-700";
  return "bg-green-900/40 border-green-700";
}

function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{value}</>;
}

export function TraineeDashboard({ sessions, activeSessionId, onSessionChange }: TraineeDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">("overview");

  const session = sessions.find((s) => s.id === activeSessionId) ?? null;

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No session selected. Submit a transcript to see your report.
      </div>
    );
  }

  const { result } = session;
  const skillEntries = Object.entries(result.scores) as [keyof SkillScores, number][];
  const bestSkill = skillEntries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const worstSkill = skillEntries.reduce((a, b) => (b[1] < a[1] ? b : a));

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Session selector */}
      {sessions.length > 1 && (
        <div className="mb-6">
          <select
            value={activeSessionId ?? ""}
            onChange={(e) => onSessionChange(e.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sub-tab toggle */}
      <div className="flex gap-2 mb-6">
        {(["overview", "transcript"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200",
            ].join(" ")}
            style={activeTab === tab ? { backgroundColor: "var(--accent-coral)" } : {}}
          >
            {tab === "overview" ? "Overview" : "Annotated Transcript"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Score cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-2xl border p-4 ${scoreColor(result.overall_score)}`}>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Overall Score</p>
              <p className="text-4xl font-extrabold text-white">
                <AnimatedCounter key={`overall-${session.id}`} target={result.overall_score} />
              </p>
              <p className="text-xs text-gray-400 mt-1">/ 100</p>
            </div>
            <div className={`rounded-2xl border p-4 ${scoreColor(bestSkill[1])}`}>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Best Skill</p>
              <p className="text-xl font-bold text-white">
                <AnimatedCounter key={`best-${session.id}`} target={bestSkill[1]} />
              </p>
              <p className="text-xs text-gray-300 mt-1">{SKILL_LABELS[bestSkill[0]]}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${scoreColor(worstSkill[1])}`}>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Needs Work</p>
              <p className="text-xl font-bold text-white">
                <AnimatedCounter key={`worst-${session.id}`} target={worstSkill[1]} />
              </p>
              <p className="text-xs text-gray-300 mt-1">{SKILL_LABELS[worstSkill[0]]}</p>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-800/40 p-4">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Key Moments</p>
              <p className="text-4xl font-extrabold text-white">
                <AnimatedCounter key={`moments-${session.id}`} target={result.key_moments.length} />
              </p>
              <p className="text-xs text-gray-400 mt-1">annotated</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Skill Radar</h3>
              <SkillRadarChart scores={result.scores} overallScore={result.overall_score} />
            </div>
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Skill Scores</h3>
              <SkillBarChart scores={result.scores} overallScore={result.overall_score} />
            </div>
          </div>

          {/* Qualitative panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {result.areas_for_improvement.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <AlertCircle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Recommended Phrases
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.recommended_phrases.map((phrase, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-blue-900/40 border border-blue-700 text-blue-200 text-xs px-3 py-1.5 rounded-full"
                  >
                    <MessageSquare size={11} />
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overall feedback */}
          {result.overall_feedback && (
            <div className="bg-white rounded-2xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: "var(--accent-sky)" }}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Overall Feedback</h3>
              <p className="text-gray-800 leading-relaxed">{result.overall_feedback}</p>
            </div>
          )}
        </>
      )}

      {activeTab === "transcript" && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <AnnotatedTranscript
            transcript={session.transcript}
            keyMoments={result.key_moments}
          />
        </div>
      )}
    </div>
  );
}
