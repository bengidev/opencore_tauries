import { AutomationsIcon, ChevronDownIcon, InboxIcon, NoteIcon, SearchIcon } from "./icons";

export type HomeSidebarProps = {
  onReplayIntro?: () => void;
};

export default function HomeSidebar({ onReplayIntro }: HomeSidebarProps) {
  return (
    <aside className="home-sidebar" aria-label="Workspace">
      <div className="home-brand">
        <span className="home-brand-mark" aria-hidden="true">/</span>
        <span className="home-brand-name">OPENCORE</span>
        <ChevronDownIcon className="home-brand-chevron" />
      </div>

      <nav className="home-nav" aria-label="Primary">
        <button className="home-nav-item" type="button">
          <SearchIcon className="home-nav-icon" />
          <span className="home-nav-label">Search</span>
          <kbd className="home-nav-hint">⌘K</kbd>
        </button>
        <button className="home-nav-item" type="button">
          <InboxIcon className="home-nav-icon" />
          <span className="home-nav-label">Inbox</span>
        </button>
        <button className="home-nav-item" type="button">
          <NoteIcon className="home-nav-icon" />
          <span className="home-nav-label">Notes</span>
        </button>
        <button className="home-nav-item" type="button">
          <AutomationsIcon className="home-nav-icon" />
          <span className="home-nav-label">Automations</span>
        </button>
      </nav>

      <div className="home-sessions">
        <p className="home-section-label">SESSIONS</p>
        <div className="home-session-list" />
      </div>

      <div className="home-sidebar-footer">
        <button className="home-footer-action" type="button" onClick={onReplayIntro}>
          REPLAY INTRO
        </button>
        <span className="home-memory">MEMORY: MOCK</span>
      </div>
    </aside>
  );
}
