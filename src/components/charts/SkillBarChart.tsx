import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { SkillScores } from "../../types/evaluation";

interface SkillBarChartProps {
  scores: SkillScores;
  overallScore: number;
}

function getColor(score: number): string {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#f59e0b";
  return "#22c55e";
}

export function SkillBarChart({ scores, overallScore }: SkillBarChartProps) {
  const data = [
    { name: "Overall", score: overallScore },
    { name: "Active Listening", score: scores.active_listening },
    { name: "Empathy", score: scores.empathy },
    { name: "Clarity", score: scores.communication_clarity },
    { name: "Conflict Res.", score: scores.conflict_resolution },
    { name: "Rapport", score: scores.rapport_building },
    { name: "Questioning", score: scores.questioning_technique },
    { name: "Solutions", score: scores.solution_orientation },
  ].sort((a, b) => b.score - a.score);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart layout="vertical" data={data} margin={{ left: 0, right: 30, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
          labelStyle={{ color: "#e5e7eb" }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        <Bar dataKey="score" isAnimationActive animationDuration={800} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.score)} />
          ))}
          <LabelList dataKey="score" position="insideRight" style={{ fill: "#fff", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
