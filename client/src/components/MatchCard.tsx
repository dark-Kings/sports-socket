import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Match } from "../types/sports";
import { formatMatchTime } from "../utils/matches";

interface Props {
  match: Match;
  selected: boolean;
  onSelect: (match: Match) => void;
}

export function MatchCard({ match, selected, onSelect }: Props) {
  const live = match.status.toLowerCase() === "live";
  const finished = ["finished", "completed"].includes(match.status.toLowerCase());

  return (
    <article className={`match-card ${selected ? "selected" : ""} ${live ? "is-live" : ""}`}>
      <div className="match-card-top">
        <span className="sport-pill">{match.sport || "SPORT"}</span>
        <span className={`match-state ${live ? "live" : finished ? "finished" : "upcoming"}`}>
          {live && <i />}
          {match.status.toUpperCase()}
        </span>
      </div>

      <div className="teams-score">
        <div className="teams">
          <strong>{match.homeTeam}</strong>
          <strong>{match.awayTeam}</strong>
        </div>
        <div className="scores">
          <span>{match.homeScore ?? "—"}</span>
          <span>{match.awayScore ?? "—"}</span>
        </div>
      </div>

      <div className="match-card-bottom">
        <span className="match-time"><Clock3 size={13} /> {formatMatchTime(match.startTime)}</span>
        <button className={`small-action ${selected ? "watching" : ""}`} onClick={() => onSelect(match)}>
          {selected ? "SELECTED" : live ? "WATCH LIVE" : "VIEW MATCH"}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}