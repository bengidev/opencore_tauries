import { useEffect, type RefObject } from "react";
import { filterSessions, groupSessions, type Session } from "../sessions";
import SessionList from "./SessionList";
import {
  AutomationsIcon,
  ChevronDownIcon,
  InboxIcon,
  NoteIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";

export type HomeSidebarProps = {
  sessions: readonly Session[];
  activeId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onReplayIntro?: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
  /** Removes the whole panel from the tab order and the a11y tree (closed mobile drawer). */
  inert?: boolean;
};

export default function HomeSidebar({
  sessions,
  activeId,
  query,
  onQueryChange,
  onSelectSession,
  onNewSession,
  onReplayIntro,
  searchRef,
  inert,
}: HomeSidebarProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const input = searchRef.current;

      if (event.key === "Escape" && input && document.activeElement === input) {
        input.blur();
        document.body.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRef]);

  const groups = groupSessions(filterSessions(sessions, query));

  return (
    <aside className="home-sidebar" aria-label="Workspace" inert={inert}>
      <div className="home-brand">
        <span className="home-brand-mark" aria-hidden="true">/</span>
        <span className="home-brand-name">OPENCORE</span>
        <ChevronDownIcon className="home-brand-chevron" />
      </div>

      <nav className="home-nav" aria-label="Primary">
        <div className="home-nav-search">
          <SearchIcon className="home-nav-icon" />
          <input
            ref={searchRef}
            className="home-search-input"
            type="search"
            placeholder="Search"
            aria-label="Search sessions"
            aria-keyshortcuts="Meta+K"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <kbd className="home-nav-hint" aria-hidden="true">⌘K</kbd>
        </div>
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
        <div className="home-sessions-head">
          <button className="home-session-new" type="button" onClick={onNewSession}>
            <PlusIcon />
            <span>New</span>
          </button>
        </div>

        <nav className="home-session-list" aria-label="Sessions">
          <SessionList
            groups={groups}
            activeId={activeId}
            onSelect={onSelectSession}
            query={query}
          />
        </nav>
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
