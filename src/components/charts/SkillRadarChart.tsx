import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SkillScores } from "../../types/evaluation";

interface SkillRadarChartProps {
  scores: SkillScores;
  overallScore: number;
}

export function SkillRadarChart({ scores }: SkillRadarChartProps) {
  const data = [
    { skill: "Listen", score: scores.active_listening },
    { skill: "Empathy", score: scores.empathy },
    { skill: "Clarity", score: scores.communication_clarity },
    { skill: "Conflict", score: scores.conflict_resolution },
    { skill: "Rapport", score: scores.rapport_building },
    { skill: "Questions", score: scores.questioning_technique },
    { skill: "Solutions", score: scores.solution_orientation },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "#6b7280", fontSize: 10 }} />
        <Radar
          name="Score"
          dataKey="score"
          fill="rgba(0,194,255,0.2)"
          stroke="#00c2ff"
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
          labelStyle={{ color: "#e5e7eb" }}
          itemStyle={{ color: "#00c2ff" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
