import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EvaluationSession } from "../../types/evaluation";

interface CohortRadarChartProps {
  sessions: EvaluationSession[];
}

const SKILLS = [
  { key: "active_listening" as const, label: "Listen" },
  { key: "empathy" as const, label: "Empathy" },
  { key: "communication_clarity" as const, label: "Clarity" },
  { key: "conflict_resolution" as const, label: "Conflict" },
  { key: "rapport_building" as const, label: "Rapport" },
  { key: "questioning_technique" as const, label: "Questions" },
  { key: "solution_orientation" as const, label: "Solutions" },
];

export function CohortRadarChart({ sessions }: CohortRadarChartProps) {
  const latest = sessions[sessions.length - 1];

  const data = SKILLS.map(({ key, label }) => {
    const avg = sessions.reduce((sum, s) => sum + s.result.scores[key], 0) / sessions.length;
    return {
      skill: label,
      cohortAvg: Math.round(avg),
      latestSession: latest.result.scores[key],
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "#6b7280", fontSize: 10 }} />
        <Radar
          name="Cohort Avg"
          dataKey="cohortAvg"
          fill="rgba(0,194,255,0.15)"
          stroke="#00c2ff"
          strokeWidth={2}
        />
        <Radar
          name="Latest Session"
          dataKey="latestSession"
          fill="rgba(255,90,95,0.15)"
          stroke="#ff5a5f"
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
          labelStyle={{ color: "#e5e7eb" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
