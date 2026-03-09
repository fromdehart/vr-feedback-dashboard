import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { EvaluationSession } from "../../types/evaluation";

interface TrendLineChartProps {
  sessions: EvaluationSession[];
}

export function TrendLineChart({ sessions }: TrendLineChartProps) {
  const data = sessions.map((s) => ({
    label: s.label,
    overall_score: s.result.overall_score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
          labelStyle={{ color: "#e5e7eb" }}
          itemStyle={{ color: "#00c2ff" }}
        />
        <ReferenceLine y={60} stroke="#6b7280" strokeDasharray="4 4" label={{ value: "Target", fill: "#6b7280", fontSize: 11 }} />
        <Area
          type="monotone"
          dataKey="overall_score"
          fill="rgba(0,194,255,0.15)"
          stroke="#00c2ff"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
