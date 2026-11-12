import { formatUpdatedAt, groupSessions } from "../sessions";
import { FilterIcon } from "./icons";

export type SessionListProps = {
  groups: ReturnType<typeof groupSessions>;
  activeId: string | null;
  onSelect: (id: string) => void;
  query: string;
};

export default function SessionList({ groups, activeId, onSelect, query }: SessionListProps) {
  if (groups.length === 0) {
    return (
      <p className="home-empty">
        {query.trim() ? `No sessions match “${query}”.` : "No sessions yet."}
      </p>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div className="home-session-group" key={group.id}>
          <div className="home-session-group-head">
            <p className="home-section-label">{group.label}</p>
            {group.id === "older" ? (
              <button
                className="home-session-filter"
                type="button"
                aria-label="Filter older sessions"
                disabled
              >
                <FilterIcon />
              </button>
            ) : null}
          </div>

          {group.items.map((session) => {
            const active = session.id === activeId;

            return (
              <button
                className="home-session-row"
                key={session.id}
                type="button"
                data-active={active}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(session.id)}
              >
                <span className="home-session-line">
                  <span className="home-session-title">{session.title}</span>
                  <span className="home-session-date">{formatUpdatedAt(session.updatedAt)}</span>
                </span>
                <span className="home-session-meta">
                  <span className="home-session-branch">{session.branch}</span>
                  <span className="home-session-sep" aria-hidden="true">·</span>
                  <span className="home-session-model">{session.model}</span>
                  <span className="home-session-dot" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}
