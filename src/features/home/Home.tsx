import { useCallback, useEffect, useRef, useState } from "react";
import HeroBackdrop from "./components/HeroBackdrop";
import HomeSidebar from "./components/HomeSidebar";
import HomeStatus from "./components/HomeStatus";
import HomeTopbar from "./components/HomeTopbar";
import Composer from "./components/Composer";
import { useTheme } from "../../shared/use-theme";
import {
  DEFAULT_MODEL,
  MOCK_SESSIONS,
  newSession,
  sessionTitleFromPrompt,
  type Session,
} from "./sessions";
import { DEFAULT_ACCESS_ID, DEFAULT_EFFORT_ID } from "./composer-options";
import "./home.css";

export type HomeProps = {
  onReplayIntro?: () => void;
  onSubmitPrompt?: (prompt: string, session: Session) => void;
};

const MOCK_DIFF = { added: 842, removed: 0 };

export default function Home({ onReplayIntro, onSubmitPrompt }: HomeProps) {
  const [sessions, setSessions] = useState<Session[]>(() => [...MOCK_SESSIONS]);
  const [activeId, setActiveId] = useState<string>(MOCK_SESSIONS[0].id);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState<Record<string, { effort: string; access: string }>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();

  const activeSession = sessions.find((session) => session.id === activeId) ?? sessions[0] ?? null;
  const draft = activeSession ? drafts[activeSession.id] ?? "" : "";
  const prefsForActive = activeSession ? prefs[activeSession.id] : undefined;
  const effort = prefsForActive?.effort ?? DEFAULT_EFFORT_ID;
  const access = prefsForActive?.access ?? DEFAULT_ACCESS_ID;

  const openSidebar = useCallback((selectSearch: boolean) => {
    setSidebarOpen(true);
    // The closed drawer is inert; the state update has committed by the next frame,
    // so focus can move into the panel without landing off-screen.
    requestAnimationFrame(() => {
      const input = searchRef.current;
      if (!input) return;
      input.focus();
      if (selectSearch) input.select();
    });
  }, []);

  const openSearch = useCallback(() => openSidebar(true), [openSidebar]);

  const closeSidebar = useCallback((restoreFocus: "toggle" | "composer" = "toggle") => {
    setSidebarOpen(false);
    requestAnimationFrame(() => {
      if (restoreFocus === "composer") {
        document.querySelector<HTMLTextAreaElement>(".home-composer-input")?.focus();
      } else {
        toggleRef.current?.focus();
      }
    });
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape" || event.defaultPrevented) return;

      // The search clears on its first Escape; a second one closes the drawer.
      const input = searchRef.current;
      if (input && document.activeElement === input && input.value) return;

      closeSidebar();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (event.shiftKey || event.altKey) return;

      event.preventDefault();
      openSearch();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  function handleNewSession(): void {
    const session = newSession(`session-${Date.now()}`);
    setSessions((current) => [session, ...current]);
    setActiveId(session.id);
    setQuery("");
    // The new row is prepended above the scrollport on short viewports.
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }));
    closeSidebar("composer");
  }

  function handleDraftChange(value: string): void {
    if (!activeSession) return;
    const sessionId = activeSession.id;
    setDrafts((current) => ({ ...current, [sessionId]: value }));
  }

  function handleModelChange(model: string): void {
    if (!activeSession) return;
    // The model lives on the session, so the sidebar row updates with the pill.
    setSessions((current) =>
      current.map((session) =>
        session.id === activeSession.id ? { ...session, model } : session,
      ),
    );
  }

  function updatePrefs(change: { effort?: string; access?: string }): void {
    if (!activeSession) return;
    setPrefs((current) => ({
      ...current,
      [activeSession.id]: {
        effort: current[activeSession.id]?.effort ?? DEFAULT_EFFORT_ID,
        access: current[activeSession.id]?.access ?? DEFAULT_ACCESS_ID,
        ...change,
      },
    }));
  }

  function handleEffortChange(effort: string): void {
    updatePrefs({ effort });
  }

  function handleAccessChange(access: string): void {
    updatePrefs({ access });
  }

  function handleSubmitPrompt(): void {
    if (!activeSession) return;

    const prompt = draft.trim();
    if (!prompt) return;

    const updatedSession: Session = {
      ...activeSession,
      title: sessionTitleFromPrompt(prompt),
      updatedAt: new Date().toISOString(),
    };

    setSessions((current) =>
      current.map((session) => (session.id === updatedSession.id ? updatedSession : session)),
    );
    setDrafts((current) => ({ ...current, [updatedSession.id]: "" }));
    onSubmitPrompt?.(prompt, updatedSession);
  }

  return (
    <div className="home-shell" data-sidebar-open={sidebarOpen}>
      <HeroBackdrop theme={theme} />

      <HomeSidebar
        sessions={sessions}
        activeId={activeId}
        query={query}
        onQueryChange={setQuery}
        onSelectSession={(id) => {
          setActiveId(id);
          closeSidebar("composer");
        }}
        onNewSession={handleNewSession}
        onClose={() => closeSidebar()}
        onReplayIntro={onReplayIntro}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchRef={searchRef}
        listRef={listRef}
        inert={!sidebarOpen}
      />

      <div className="home-scrim" aria-hidden="true" onClick={() => closeSidebar()} />

      <main className="home-main" inert={sidebarOpen}>
        <HomeTopbar
          title={activeSession?.title ?? "No sessions"}
          diff={MOCK_DIFF}
          onNewSession={handleNewSession}
          onToggleSidebar={() => (sidebarOpen ? closeSidebar() : openSidebar(false))}
          onOpenSearch={openSearch}
          sidebarOpen={sidebarOpen}
          toggleRef={toggleRef}
        />

        <section className="home-stage" aria-labelledby="home-title">
          <h1 className="home-title" id="home-title">
            What should we work on in <span className="home-title-project">OpenCore</span>?
          </h1>
          <Composer
            key={activeSession?.id ?? "empty"}
            value={draft}
            onChange={handleDraftChange}
            onSubmit={handleSubmitPrompt}
            model={activeSession?.model ?? DEFAULT_MODEL}
            effort={effort}
            access={access}
            onModelChange={handleModelChange}
            onEffortChange={handleEffortChange}
            onAccessChange={handleAccessChange}
            disabled={!activeSession}
          />
          <HomeStatus branch={activeSession?.branch ?? "—"} />
        </section>
      </main>
    </div>
  );
}
