import type { RefObject } from "react";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PanelIcon,
  PlusIcon,
  SearchIcon,
  SparkleIcon,
} from "./icons";

export type HomeTopbarProps = {
  title: string;
  diff: { added: number; removed: number };
  onNewSession: () => void;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  sidebarOpen: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
};

export default function HomeTopbar({
  title,
  diff,
  onNewSession,
  onToggleSidebar,
  onOpenSearch,
  sidebarOpen,
  toggleRef,
}: HomeTopbarProps) {
  return (
    <header className="home-topbar" data-tauri-drag-region="deep">
      <div className="home-topbar-nav">
        <button className="home-icon-button" type="button" aria-label="Back" disabled>
          <ArrowLeftIcon />
        </button>
        <button className="home-icon-button" type="button" aria-label="Forward" disabled>
          <ArrowRightIcon />
        </button>
      </div>

      <div className="home-tab">
        <SparkleIcon className="home-tab-mark" />
        <span className="home-tab-title" title={title}>{title}</span>
      </div>

      <button
        className="home-icon-button home-tab-new"
        type="button"
        aria-label="New session"
        onClick={onNewSession}
      >
        <PlusIcon />
      </button>

      <div className="home-topbar-spacer" />

      <div
        className="home-diff"
        role="img"
        aria-label={`${diff.added} lines added, ${diff.removed} lines removed`}
      >
        <span className="home-diff-add">+{diff.added}</span>
        <span className="home-diff-del">−{diff.removed}</span>
      </div>

      <button
        className="home-icon-button"
        type="button"
        aria-label="Search sessions"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={onOpenSearch}
      >
        <SearchIcon />
      </button>

      <button
        ref={toggleRef}
        className="home-icon-button home-sidebar-toggle"
        type="button"
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="home-sidebar"
        onClick={onToggleSidebar}
      >
        <PanelIcon />
      </button>
    </header>
  );
}
