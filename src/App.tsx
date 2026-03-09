import { useState } from "react";
import { ConvexProvider } from "convex/react";
import { convex } from "./lib/convexClient";
import { PasswordGate } from "./components/PasswordGate";
import Index from "./pages/Index";

const App = () => {
  const [granted, setGranted] = useState(false);

  return (
    <ConvexProvider client={convex}>
      {granted ? <Index /> : <PasswordGate onAccessGranted={() => setGranted(true)} />}
    </ConvexProvider>
  );
};

export default App;
