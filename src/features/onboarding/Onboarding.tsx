import { useLayoutEffect, useRef, useState } from "react";

import { useTheme } from "../../shared/use-theme";
import type { AppTheme } from "../../shared/theme";
import { HeroStage } from "./HeroStage";

export type OnboardingTheme = AppTheme;

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

export type OnboardingProps = {
  onEnterWorkspace?: () => void;
};

export default function Onboarding({ onEnterWorkspace }: OnboardingProps) {
  const { theme, toggleTheme } = useTheme();
  const [headerInset, setHeaderInset] = useState(0);
  const [footerInset, setFooterInset] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;
    const footer = footerRef.current;
    if (!shell || !header || !footer) return;

    const update = () => {
      const shellRect = shell.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const nextHeaderInset = Math.max(0, headerRect.bottom - shellRect.top);
      const nextFooterInset = Math.max(0, shellRect.bottom - footerRect.top);
      shell.style.setProperty("--footer-space", `${nextFooterInset}px`);
      setHeaderInset((previous) =>
        Math.abs(previous - nextHeaderInset) < 0.5 ? previous : nextHeaderInset,
      );
      setFooterInset((previous) =>
        Math.abs(previous - nextFooterInset) < 0.5 ? previous : nextFooterInset,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(shell);
    observer.observe(header);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="onboarding-shell" ref={shellRef}>
      <header className="topbar" ref={headerRef}>
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

      <HeroStage theme={theme} headerInset={headerInset} footerInset={footerInset} />

      <footer className="bottombar" ref={footerRef}>
        <span className="action-status" aria-live="polite">[ SYSTEM READY ]</span>
        <div className="action-wrap">
          <button className="primary-action" type="button" onClick={onEnterWorkspace}>
            ENTER WORKSPACE
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
