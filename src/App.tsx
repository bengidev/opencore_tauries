import { useState } from "react";

import Onboarding from "./features/onboarding/Onboarding";
import Home from "./features/home";
import "./App.css";

const ONBOARDED_KEY = "opencore-onboarded";

type Screen = "onboarding" | "home";

function readOnboarded(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeOnboarded(onboarded: boolean): void {
  try {
    if (onboarded) window.localStorage.setItem(ONBOARDED_KEY, "1");
    else window.localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    // Persistence is best-effort; the screen transition must still happen.
  }
}

function initialScreen(): Screen {
  return readOnboarded() ? "home" : "onboarding";
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);

  function enterWorkspace() {
    setScreen("home");
    writeOnboarded(true);
  }

  function replayIntro() {
    setScreen("onboarding");
    writeOnboarded(false);
  }

  return screen === "home" ? (
    <Home onReplayIntro={replayIntro} />
  ) : (
    <Onboarding onEnterWorkspace={enterWorkspace} />
  );
}

export default App;
