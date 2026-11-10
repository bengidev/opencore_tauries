import { ArrowLeftIcon, ArrowRightIcon, PanelIcon, PlusIcon } from "./icons";

export type HomeTopbarProps = {
  title: string;
  diff: { added: number; removed: number };
  onNewSession: () => void;
  onToggleSidebar: () => void;
};

export default function HomeTopbar({ title, diff, onNewSession, onToggleSidebar }: HomeTopbarProps) {
  return (
    <header className="home-topbar">
      <div className="home-topbar-nav">
        <button className="home-icon-button" type="button" aria-label="Back" disabled>
          <ArrowLeftIcon />
        </button>
        <button className="home-icon-button" type="button" aria-label="Forward" disabled>
          <ArrowRightIcon />
        </button>
      </div>

      <div className="home-crumb">
        <span className="home-crumb-dot" aria-hidden="true" />
        <span className="home-crumb-title" title={title}>{title}</span>
      </div>

      <button className="home-icon-button" type="button" aria-label="New session" onClick={onNewSession}>
        <PlusIcon />
      </button>

      <div className="home-topbar-spacer" data-tauri-drag-region />

      <div
        className="home-diff"
        aria-label={`${diff.added} lines added, ${diff.removed} lines removed`}
      >
        <span className="home-diff-added" aria-hidden="true">+{diff.added}</span>
        <span className="home-diff-removed" aria-hidden="true">−{diff.removed}</span>
      </div>

      <button
        className="home-icon-button"
        type="button"
        aria-label="Toggle sidebar"
        onClick={onToggleSidebar}
      >
        <PanelIcon />
      </button>
    </header>
  );
}
