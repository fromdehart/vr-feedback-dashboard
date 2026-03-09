import type { EvaluationSession, SkillScores } from "../types/evaluation";
import { SessionComparisonChart } from "./charts/SessionComparisonChart";
import { CohortRadarChart } from "./charts/CohortRadarChart";
import { TrendLineChart } from "./charts/TrendLineChart";

interface AdminDashboardProps {
  sessions: EvaluationSession[];
}

function scoreCell(score: number): string {
  if (score < 50) return "bg-red-100 text-red-800";
  if (score < 75) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

function avg(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

const SKILLS: { key: keyof SkillScores; label: string }[] = [
  { key: "active_listening", label: "Active Listening" },
  { key: "empathy", label: "Empathy" },
  { key: "communication_clarity", label: "Clarity" },
  { key: "conflict_resolution", label: "Conflict" },
  { key: "rapport_building", label: "Rapport" },
  { key: "questioning_technique", label: "Questions" },
  { key: "solution_orientation", label: "Solutions" },
];

export function AdminDashboard({ sessions }: AdminDashboardProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No sessions evaluated yet. Submit at least one transcript to see aggregate data.
      </div>
    );
  }

  const cohortAvg: Record<keyof SkillScores | "overall", number> = {
    overall: avg(sessions.map((s) => s.result.overall_score)),
    active_listening: avg(sessions.map((s) => s.result.scores.active_listening)),
    empathy: avg(sessions.map((s) => s.result.scores.empathy)),
    communication_clarity: avg(sessions.map((s) => s.result.scores.communication_clarity)),
    conflict_resolution: avg(sessions.map((s) => s.result.scores.conflict_resolution)),
    rapport_building: avg(sessions.map((s) => s.result.scores.rapport_building)),
    questioning_technique: avg(sessions.map((s) => s.result.scores.questioning_technique)),
    solution_orientation: avg(sessions.map((s) => s.result.scores.solution_orientation)),
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Session Summary Table */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-white border-t border-gray-700 pt-4">
          Session Summary
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-300 sticky top-0">
                <th className="text-left px-4 py-3 font-semibold">Session</th>
                <th className="text-center px-3 py-3 font-semibold">Overall</th>
                {SKILLS.map((s) => (
                  <th key={s.key} className="text-center px-3 py-3 font-semibold whitespace-nowrap">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-gray-700 bg-gray-900 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-200 font-medium">{session.label}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scoreCell(session.result.overall_score)}`}>
                      {session.result.overall_score}
                    </span>
                  </td>
                  {SKILLS.map((s) => {
                    const val = session.result.scores[s.key];
                    return (
                      <td key={s.key} className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scoreCell(val)}`}>
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Cohort avg row */}
              <tr className="border-t-2 border-gray-600 bg-gray-800">
                <td className="px-4 py-3 text-gray-200 font-bold italic">Cohort Avg</td>
                <td className="px-3 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold italic ${scoreCell(cohortAvg.overall)}`}>
                    {cohortAvg.overall}
                  </span>
                </td>
                {SKILLS.map((s) => (
                  <td key={s.key} className="px-3 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold italic ${scoreCell(cohortAvg[s.key])}`}>
                      {cohortAvg[s.key]}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Skill Comparison Chart */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-white border-t border-gray-700 pt-4">
          Skill Comparison
        </h2>
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
          <SessionComparisonChart sessions={sessions} />
        </div>
      </section>

      {/* Cohort Radar */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-white border-t border-gray-700 pt-4">
          Cohort vs Latest Session
        </h2>
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
          <CohortRadarChart sessions={sessions} />
        </div>
      </section>

      {/* Trend Line (only with 2+ sessions) */}
      {sessions.length >= 2 && (
        <section>
          <h2 className="text-xl font-bold mb-4 text-white border-t border-gray-700 pt-4">
            Score Trend
          </h2>
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
            <TrendLineChart sessions={sessions} />
          </div>
        </section>
      )}
    </div>
  );
}
