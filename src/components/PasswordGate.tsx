import { useState } from "react";

interface PasswordGateProps {
  onAccessGranted: () => void;
}

export function PasswordGate({ onAccessGranted }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    const expected = import.meta.env.VITE_DEMO_PASSWORD;
    if (!expected || password === expected) {
      onAccessGranted();
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f1117 0%, rgba(0,194,255,0.07) 40%, rgba(255,90,95,0.06) 70%, #0f1117 100%)",
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 right-0 w-32 h-48 rounded-bl-[3rem] opacity-70"
        style={{ backgroundColor: "var(--accent-coral)" }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-32 rounded-tr-[3rem] opacity-60"
        style={{ backgroundColor: "var(--accent-sky)" }}
        aria-hidden
      />

      <div className="relative z-10 bg-gray-900 text-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--accent-coral), var(--accent-sky))",
              }}
            >
              VR Training Feedback Dashboard
            </span>
          </h1>
          <p className="text-gray-400 text-sm">Demo Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none"
              style={{ "--tw-ring-color": "var(--accent-sky)" } as React.CSSProperties}
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "var(--accent-coral)" }}
          >
            {loading ? "Verifying…" : "Enter Demo"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
