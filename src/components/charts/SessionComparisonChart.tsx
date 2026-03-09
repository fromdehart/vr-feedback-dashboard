import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EvaluationSession } from "../../types/evaluation";

interface SessionComparisonChartProps {
  sessions: EvaluationSession[];
}

const COLORS = ["#00c2ff", "#ff5a5f", "#8b5cf6", "#f59e0b", "#22c55e"];

const SKILLS = [
  { key: "active_listening", label: "Listen" },
  { key: "empathy", label: "Empathy" },
  { key: "communication_clarity", label: "Clarity" },
  { key: "conflict_resolution", label: "Conflict" },
  { key: "rapport_building", label: "Rapport" },
  { key: "questioning_technique", label: "Questions" },
  { key: "solution_orientation", label: "Solutions" },
] as const;

export function SessionComparisonChart({ sessions }: SessionComparisonChartProps) {
  const data = SKILLS.map(({ key, label }) => {
    const row: Record<string, string | number> = { skill: label };
    sessions.forEach((s) => {
      row[s.label] = s.result.scores[key];
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
        <XAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
        {sessions.map((session, index) => (
          <Bar
            key={session.id}
            dataKey={session.label}
            fill={COLORS[index % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
