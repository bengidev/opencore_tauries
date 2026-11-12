import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import type { AppTheme } from "../../../shared/theme";
import { filterSessions, groupSessions, type Session } from "../sessions";
import SessionList from "./SessionList";
import {
  AutomationsIcon,
  CloseIcon,
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
  onClose: () => void;
  onReplayIntro?: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
  listRef?: RefObject<HTMLElement | null>;
  /** Removes the whole panel from the tab order and the a11y tree (closed drawer). */
  inert?: boolean;
};

export default function HomeSidebar({
  sessions,
  activeId,
  query,
  onQueryChange,
  onSelectSession,
  onNewSession,
  onClose,
  onReplayIntro,
  theme,
  onToggleTheme,
  searchRef,
  listRef,
  inert,
}: HomeSidebarProps) {
  const panelRef = useRef<HTMLElement>(null);
  const shortcutLabel = document.documentElement.dataset.platform === "macos" ? "⌘K" : "Ctrl K";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const input = searchRef.current;

      // Clear a filtered search first; Home closes the drawer on the next Escape.
      if (event.key === "Escape" && input && document.activeElement === input && input.value) {
        event.preventDefault();
        onQueryChange("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRef, onQueryChange]);

  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLElement>): void {
    if (event.key !== "Tab") return;

    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const groups = groupSessions(filterSessions(sessions, query));

  return (
    <aside
      ref={panelRef}
      className="home-sidebar"
      id="home-sidebar"
      role="dialog"
      aria-label="Workspace"
      aria-modal={inert ? undefined : true}
      inert={inert}
      onKeyDown={handlePanelKeyDown}
    >
      <div className="home-brand">
        <span className="home-brand-mark" aria-hidden="true">/</span>
        <span className="home-brand-name">OPENCORE</span>
        <button
          className="home-sidebar-close"
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
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
            aria-keyshortcuts="Meta+K Control+K"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <kbd className="home-nav-hint" aria-hidden="true">{shortcutLabel}</kbd>
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
          <button
            className="home-session-new"
            type="button"
            aria-label="New session"
            onClick={onNewSession}
          >
            <PlusIcon />
            <span>New</span>
          </button>
        </div>

        <nav className="home-session-list" aria-label="Sessions" ref={listRef}>
          <SessionList
            groups={groups}
            activeId={activeId}
            onSelect={onSelectSession}
            query={query}
          />
        </nav>
      </div>

      <div className="home-sidebar-footer">
        <div className="home-footer-row">
          <button className="home-footer-action" type="button" onClick={onReplayIntro}>
            REPLAY INTRO
          </button>
          <button
            className="home-footer-action"
            type="button"
            aria-label={`Theme: ${theme}. Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "DARK" : "LIGHT"}
          </button>
        </div>
        <span className="home-memory">MEMORY: MOCK</span>
      </div>
    </aside>
  );
}
