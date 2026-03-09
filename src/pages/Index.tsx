import { useState } from "react";
import type { EvaluationSession } from "../types/evaluation";
import { EvaluationForm } from "../components/EvaluationForm";
import { TraineeDashboard } from "../components/TraineeDashboard";
import { AdminDashboard } from "../components/AdminDashboard";

type ActiveView = "form" | "trainee" | "admin";

export default function Index() {
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("form");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleResult = (session: EvaluationSession) => {
    setSessions((prev) => [...prev, session]);
    setActiveSessionId(session.id);
    setActiveView("trainee");
  };

  const handleSessionChange = (id: string) => {
    setActiveSessionId(id);
    setActiveView("trainee");
  };

  const tabs: { id: ActiveView; label: string }[] = [
    { id: "form", label: "Evaluate" },
    { id: "trainee", label: "Trainee Report" },
    { id: "admin", label: "Admin Insights" },
  ];

  const hasResults = sessions.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <span
            className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent select-none"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--accent-coral), var(--accent-sky))",
            }}
          >
            VR Feedback Dashboard
          </span>

          <div className="flex gap-1">
            {tabs.map(({ id, label }) => {
              const disabled = id !== "form" && !hasResults;
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => !disabled && setActiveView(id)}
                  disabled={disabled}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    disabled
                      ? "opacity-40 cursor-not-allowed text-gray-400"
                      : isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800",
                  ].join(" ")}
                  style={isActive && !disabled ? { backgroundColor: "var(--accent-coral)" } : {}}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* View area */}
      <main className="min-h-[calc(100vh-57px)]">
        {activeView === "form" && (
          <EvaluationForm
            onResult={handleResult}
            sessionCount={sessions.length}
          />
        )}
        {activeView === "trainee" && (
          <TraineeDashboard
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
        )}
        {activeView === "admin" && (
          <AdminDashboard sessions={sessions} />
        )}
      </main>
    </div>
  );
}
