import HeroBackdrop from "./components/HeroBackdrop";
import HomeSidebar from "./components/HomeSidebar";
import HomeStatus from "./components/HomeStatus";
import HomeTopbar from "./components/HomeTopbar";
import { MOCK_SESSIONS } from "./sessions";
import "./home.css";

export type HomeProps = {
  onReplayIntro?: () => void;
};

const MOCK_DIFF = { added: 12, removed: 3 };

// Sidebar and topbar actions are wired in Task 4 (sessions) and Task 5 (drawer).
function noop(): void {}

export default function Home({ onReplayIntro }: HomeProps) {
  const sessions = MOCK_SESSIONS;
  const activeSession = sessions[0];

  return (
    <div className="home-shell">
      <HomeSidebar onReplayIntro={onReplayIntro} />

      <main className="home-main">
        <HomeTopbar
          title={activeSession.title}
          diff={MOCK_DIFF}
          onNewSession={noop}
          onToggleSidebar={noop}
        />

        <section className="home-stage" aria-labelledby="home-title">
          <HeroBackdrop />
          <h1 className="home-title" id="home-title">What should we work on?</h1>
          <div className="home-composer-slot" aria-hidden="true" />
          <HomeStatus branch={activeSession.branch} />
        </section>
      </main>
    </div>
  );
}
