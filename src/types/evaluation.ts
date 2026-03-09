export type SkillScores = {
  active_listening: number;
  empathy: number;
  communication_clarity: number;
  conflict_resolution: number;
  rapport_building: number;
  questioning_technique: number;
  solution_orientation: number;
};

export type KeyMoment = {
  quote: string;
  type: "strength" | "weakness";
  annotation: string;
  skill: keyof SkillScores;
};

export type EvaluationResult = {
  overall_score: number;
  scores: SkillScores;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_phrases: string[];
  overall_feedback: string;
  key_moments: KeyMoment[];
};

export type EvaluationSession = {
  id: string;
  scenario: string;
  goal: string;
  transcript: string;
  label: string;
  result: EvaluationResult;
  evaluatedAt: number;
};
