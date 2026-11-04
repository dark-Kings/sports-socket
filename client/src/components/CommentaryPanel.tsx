import { MessageSquareText, Radio } from "lucide-react";
import type { Commentary, Match } from "../types/sports";
import { formatEventTime } from "../utils/matches";
import { ConnectionBadge } from "./ConnectionBadge";

interface Props {
  match: Match | null;
  commentary: Commentary[];
  status: "connecting" | "connected" | "disconnected";
  loading: boolean;
  error: string | null;
}

export function CommentaryPanel({
  match, commentary, status, loading, error,
}: Props) {
  return (
    <aside className="commentary-panel">
      <div className="commentary-header">
        <div>
          <span className="section-eyebrow">MATCH CENTRE</span>
          <h2>Live commentary</h2>
        </div>
        <ConnectionBadge status={match?.status.toLowerCase() === "live" ? status : "disconnected"} />
      </div>

      {match ? (
        <>
          <div className="selected-match-strip">
            <span>{match.homeTeam}</span>
            <b>{match.homeScore} — {match.awayScore}</b>
            <span>{match.awayTeam}</span>
          </div>

          <div className="feed-meta">
            <span><Radio size={13} /> {match.sport.toUpperCase()}</span>
            <span>{commentary.length} EVENTS</span>
          </div>

          <div className="commentary-feed">
            {loading && commentary.length === 0 && <div className="feed-placeholder">Loading match timeline…</div>}
            {error && <div className="feed-error">{error}</div>}
            {!loading && !error && commentary.length === 0 && (
              <div className="feed-placeholder">
                <MessageSquareText size={25} />
                <strong>No commentary yet</strong>
                <span>New match events will appear here in real time.</span>
              </div>
            )}

            {[...commentary].reverse().map((event) => (
              <article className="event-item" key={event.id}>
                <div className="event-rail"><span /></div>
                <div className="event-content">
                  <div className="event-meta">
                    <time>{formatEventTime(event.createdAt)}</time>
                    {event.minute !== null && <span className="event-minute">{event.minute}&apos;</span>}
                    {event.sequence != null && <span className="event-sequence">SEQ {event.sequence}</span>}
                    {event.period && <span className="event-period">{event.period}</span>}
                    {event.eventType && <span className="event-type">{event.eventType.replace(/_/g, " ")}</span>}
                  </div>
                  {(event.actor || event.team) && (
                    <strong className="event-byline">
                      {[event.actor, event.team].filter(Boolean).join(" · ")}
                    </strong>
                  )}
                  <p className="event-message">{event.message}</p>
                  {!!event.tags?.length && (
                    <div className="event-tags">
                      {event.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="feed-placeholder panel-empty">
          <MessageSquareText size={28} />
          <strong>Select a match</strong>
          <span>Choose any match card to see its score and commentary.</span>
        </div>
      )}
    </aside>
  );
}