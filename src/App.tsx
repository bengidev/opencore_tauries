import { useState } from "react";

import Onboarding from "./features/onboarding/Onboarding";
import Home from "./features/home";
import "./App.css";

const ONBOARDED_KEY = "opencore-onboarded";

type Screen = "onboarding" | "home";

function initialScreen(): Screen {
  return window.localStorage.getItem(ONBOARDED_KEY) === "1" ? "home" : "onboarding";
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);

  function enterWorkspace() {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
    setScreen("home");
  }

  function replayIntro() {
    window.localStorage.removeItem(ONBOARDED_KEY);
    setScreen("onboarding");
  }

  return screen === "home" ? (
    <Home onReplayIntro={replayIntro} />
  ) : (
    <Onboarding onEnterWorkspace={enterWorkspace} />
  );
}

export default App;
