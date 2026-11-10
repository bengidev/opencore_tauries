import { useRef, useState } from "react";
import HeroBackdrop from "./components/HeroBackdrop";
import HomeSidebar from "./components/HomeSidebar";
import HomeStatus from "./components/HomeStatus";
import HomeTopbar from "./components/HomeTopbar";
import { MOCK_SESSIONS, newSession, type Session } from "./sessions";
import "./home.css";

export type HomeProps = {
  onReplayIntro?: () => void;
};

const MOCK_DIFF = { added: 12, removed: 3 };

// The topbar sidebar toggle is wired in Task 5 (drawer).
function noop(): void {}

export default function Home({ onReplayIntro }: HomeProps) {
  const [sessions, setSessions] = useState<Session[]>(() => [...MOCK_SESSIONS]);
  const [activeId, setActiveId] = useState<string>(MOCK_SESSIONS[0].id);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((session) => session.id === activeId) ?? sessions[0] ?? null;

  function handleNewSession(): void {
    const session = newSession(`session-${Date.now()}`);
    setSessions((current) => [session, ...current]);
    setActiveId(session.id);
    setQuery("");
  }

  return (
    <div className="home-shell">
      <HomeSidebar
        sessions={sessions}
        activeId={activeId}
        query={query}
        onQueryChange={setQuery}
        onSelectSession={setActiveId}
        onNewSession={handleNewSession}
        onReplayIntro={onReplayIntro}
        searchRef={searchRef}
      />

      <main className="home-main">
        <HomeTopbar
          title={activeSession?.title ?? "No sessions"}
          diff={MOCK_DIFF}
          onNewSession={handleNewSession}
          onToggleSidebar={noop}
        />

        <section className="home-stage" aria-labelledby="home-title">
          <HeroBackdrop />
          <h1 className="home-title" id="home-title">What should we work on?</h1>
          <div className="home-composer-slot" aria-hidden="true" />
          <HomeStatus branch={activeSession?.branch ?? "—"} />
        </section>
      </main>
    </div>
  );
}
