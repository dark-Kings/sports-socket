import type { Match } from "../types/sports";
import { MatchCard } from "./MatchCard";

interface Props {
  title: string;
  eyebrow: string;
  matches: Match[];
  selectedId: number | null;
  onSelect: (match: Match) => void;
  emptyText: string;
}

export function MatchSection({
  title, eyebrow, matches, selectedId, onSelect, emptyText,
}: Props) {
  return (
    <section className="match-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <span className="count-chip">{String(matches.length).padStart(2, "0")}</span>
      </div>

      {matches.length > 0 ? (
        <div className="match-grid">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              selected={selectedId === match.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">{emptyText}</div>
      )}
    </section>
  );
}