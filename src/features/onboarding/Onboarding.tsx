import { useLayoutEffect, useState } from "react";
import { getCurrentWindow, type Theme } from "@tauri-apps/api/window";

import { HeroStage } from "./HeroStage";

export type OnboardingTheme = Extract<Theme, "light" | "dark">;

const THEME_STORAGE_KEY = "opencore-theme";
const SURFACE_COLORS: Record<OnboardingTheme, string> = {
  light: "#f5f5f5",
  dark: "#000000",
};

function getInitialTheme(): OnboardingTheme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncNativeTheme(theme: OnboardingTheme): void {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const windowHandle = getCurrentWindow();
  void Promise.all([
    windowHandle.setTheme(theme),
    windowHandle.setBackgroundColor(SURFACE_COLORS[theme]),
  ]).catch(() => undefined);
}

function setBrowserThemeColor(color: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  meta.content = color;
}

function ModeIcon({ theme }: { theme: OnboardingTheme }) {
  return theme === "dark" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export default function Onboarding() {
  const [theme, setTheme] = useState<OnboardingTheme>(getInitialTheme);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    setBrowserThemeColor(SURFACE_COLORS[theme]);
    syncNativeTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return (
    <main className="onboarding-shell">
      <header className="topbar">
        <div className="wordmark" aria-label="OpenCore">
          <span className="wordmark-mark" aria-hidden="true">/</span>
          <span>OPENCORE</span>
        </div>
        <div className="topbar-meta">
          <span className="system-status"><i /> SYSTEM READY</span>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-pressed={theme === "dark"}
            onClick={toggleTheme}
          >
            <ModeIcon theme={theme} />
            <span>{theme === "dark" ? "DARK" : "LIGHT"}</span>
          </button>
        </div>
      </header>

      <section className="onboarding-content" aria-labelledby="onboarding-title">
        <div className="copy-column">
          <p className="eyebrow"><span>01</span> PRIVATE INTELLIGENCE / DESKTOP</p>
          <h1 id="onboarding-title">A quieter way<br /><em>to think.</em></h1>
          <p className="intro">
            OpenCore keeps your AI tools close, local, and ready when the work gets serious.
          </p>
          <ul className="feature-list" aria-label="OpenCore features">
            <li className="feature-row">One focused workspace</li>
            <li className="feature-row">Models on your terms</li>
            <li className="feature-row">Signal without the noise</li>
          </ul>
        </div>

        <HeroStage />
      </section>

      <footer className="bottombar">
        <span className="action-status" aria-live="polite">{isReady ? "[ CORE INITIALIZED ]" : "[ READY WHEN YOU ARE ]"}</span>
        <div className="action-wrap">
          <button
            className="primary-action"
            type="button"
            title="Workspace navigation is not wired yet in this preview build"
            onClick={() => setIsReady(true)}
          >
            {isReady ? "ENTER WORKSPACE" : "INITIALIZE CORE"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
