import { useState } from "react";

import { AppShell, type Screen } from "./components/AppShell";
import { AccessibilityWidget } from "./components/AccessibilityWidget";
import { AskAtlas } from "./screens/AskAtlas";
import { MedicalKnowledge } from "./screens/MedicalKnowledge";
import { Languages } from "./screens/Languages";
import { RuntimeBenchmark } from "./screens/RuntimeBenchmark";
import { BrixPlatform } from "./screens/BrixPlatform";
import { useRuntimeStatus } from "./lib/useRuntimeStatus";

/**
 * Root component for the Atlas desktop shell.
 *
 * Routing is a plain `useState`, not a router library — five fixed
 * screens in a desktop shell don't need URL-based routing, and this
 * keeps the dependency surface minimal per this project's "prefer the
 * existing stack" standard.
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>("ask");
  const runtimeStatus = useRuntimeStatus();

  return (
    <AppShell active={screen} onNavigate={setScreen} runtimeStatus={runtimeStatus}>
      {screen === "ask" && <AskAtlas runtimeStatus={runtimeStatus} />}
      {screen === "knowledge" && <MedicalKnowledge runtimeStatus={runtimeStatus} />}
      {screen === "drugs" && <MedicalKnowledge runtimeStatus={runtimeStatus} />}
      {screen === "languages" && <Languages runtimeStatus={runtimeStatus} />}
      {screen === "runtime" && <RuntimeBenchmark runtimeStatus={runtimeStatus} />}
      {screen === "brix" && <BrixPlatform />}
      <AccessibilityWidget />
    </AppShell>
  );
}
