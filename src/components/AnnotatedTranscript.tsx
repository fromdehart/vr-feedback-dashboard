import type { KeyMoment } from "../types/evaluation";

interface AnnotatedTranscriptProps {
  transcript: string;
  keyMoments: KeyMoment[];
}

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

const SKILL_LABELS: Record<string, string> = {
  active_listening: "ACTIVE LISTENING",
  empathy: "EMPATHY",
  communication_clarity: "CLARITY",
  conflict_resolution: "CONFLICT RESOLUTION",
  rapport_building: "RAPPORT",
  questioning_technique: "QUESTIONING",
  solution_orientation: "SOLUTIONS",
};

export function AnnotatedTranscript({ transcript, keyMoments }: AnnotatedTranscriptProps) {
  const lines = transcript.split("\n");

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Transcript */}
      <div className="md:col-span-3 space-y-2">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-2" />;
          const matchedMoment = keyMoments.find((m) =>
            m.quote && normalize(line).includes(normalize(m.quote))
          );
          const isStrength = matchedMoment?.type === "strength";
          const isWeakness = matchedMoment?.type === "weakness";

          return (
            <p
              key={i}
              className={[
                "text-sm leading-relaxed py-1 px-2 rounded",
                isStrength
                  ? "border-l-4 border-green-400 pl-3 bg-green-900/20"
                  : isWeakness
                  ? "border-l-4 border-orange-400 pl-3 bg-orange-900/20"
                  : "text-gray-300",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {line}
            </p>
          );
        })}
      </div>

      {/* Callout panel */}
      <div className="md:col-span-2 space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Key Moments
        </h4>
        {keyMoments.map((moment, i) => (
          <div
            key={i}
            className={[
              "rounded-xl p-3 border-l-4",
              moment.type === "strength"
                ? "border-green-400 bg-green-900/20"
                : "border-orange-400 bg-orange-900/20",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={[
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  moment.type === "strength"
                    ? "bg-green-800 text-green-200"
                    : "bg-orange-800 text-orange-200",
                ].join(" ")}
              >
                {moment.type === "strength" ? "Strength" : "Weakness"}
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                {SKILL_LABELS[moment.skill] ?? moment.skill.toUpperCase()}
              </span>
            </div>
            {moment.quote && (
              <p className="text-xs italic text-gray-400 mb-1">"{moment.quote}"</p>
            )}
            <p className="text-xs text-gray-300">{moment.annotation}</p>
          </div>
        ))}
        {keyMoments.length === 0 && (
          <p className="text-sm text-gray-500">No key moments identified.</p>
        )}
      </div>
    </div>
  );
}
