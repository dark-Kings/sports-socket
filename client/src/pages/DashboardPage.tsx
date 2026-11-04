
import { useMemo, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";

import { CommentaryPanel } from "../components/CommentaryPanel";
import { MatchSection } from "../components/MatchSection";

import { useMatchCommentary } from "../hooks/useMatchCommentary";
import { useMatchUpdates } from "../hooks/useMatchUpdates";
import { useMatches } from "../hooks/useMatches";

import type { Match } from "../types/sports";
import { getMatchGroup } from "../utils/matches";

export function DashboardPage() {

  const {
    matches,
    loading,
    error,
    refresh,
    addMatch
  } = useMatches();

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  // Listen for newly created matches through WebSocket
  useMatchUpdates({
    onMatchCreated: addMatch
  });

  // Separate matches into their respective sections
  const groups = useMemo(() => ({
    live: matches.filter((match) => getMatchGroup(match) === "live"),
    upcoming: matches.filter((match) => getMatchGroup(match) === "upcoming"),
    history: matches.filter((match) => getMatchGroup(match) === "history"),
  }), [matches]);

  // Currently selected match
  const selectedMatch =
    matches.find((match) => match.id === selectedMatchId) ?? null;

  // Listen for commentary of the selected match
  const {
    commentary,
    status,
    loading: commentaryLoading,
    error: commentaryError
  } = useMatchCommentary(selectedMatchId);

  const selectMatch = (match: Match) => {
    setSelectedMatchId(match.id);
  };

  return (
    <>
      <section className="hero-band">
        <div>
          <span className="hero-kicker">
            <Trophy size={14} /> YOUR SPORTS COMMAND CENTRE
          </span>

          <h1>
            Every moment.<br />
            <em>In real time.</em>
          </h1>

          <p>
            Live scores, match history and what&apos;s coming next — all in one place.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <strong>{groups.live.length}</strong>
            <span>LIVE NOW</span>
          </div>

          <div>
            <strong>{groups.upcoming.length}</strong>
            <span>UPCOMING</span>
          </div>

          <div>
            <strong>{groups.history.length}</strong>
            <span>COMPLETED</span>
          </div>
        </div>

        <span className="hero-stamp">
          LIVE<br />SPORTS<br />DATA
        </span>
      </section>

      <div className="dashboard-layout">

        <div className="matches-column">

          <div className="board-title-row">
            <div>
              <span className="section-eyebrow">THE FIXTURE BOARD</span>
              <h2>Matches</h2>
            </div>

            <button
              className="refresh-button"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "spin" : ""}
              />
              REFRESH
            </button>
          </div>

          {error && (
            <div className="api-error">
              <strong>Could not load matches</strong>
              <span>{error}</span>
              <button onClick={() => void refresh()}>
                TRY AGAIN
              </button>
            </div>
          )}

          {loading && matches.length === 0 ? (
            <div className="loading-board">
              LOADING MATCH DATA…
            </div>
          ) : (
            <>
              <MatchSection
                title="Current matches"
                eyebrow="01 / LIVE ACTION"
                matches={groups.live}
                selectedId={selectedMatchId}
                onSelect={selectMatch}
                emptyText="No matches are live right now."
              />

              <MatchSection
                title="Upcoming"
                eyebrow="02 / NEXT UP"
                matches={groups.upcoming}
                selectedId={selectedMatchId}
                onSelect={selectMatch}
                emptyText="No upcoming fixtures found."
              />

              <MatchSection
                title="History"
                eyebrow="03 / THE ARCHIVE"
                matches={groups.history}
                selectedId={selectedMatchId}
                onSelect={selectMatch}
                emptyText="Completed matches will appear here."
              />
            </>
          )}

        </div>

        <CommentaryPanel
          match={selectedMatch}
          commentary={commentary}
          status={status}
          loading={commentaryLoading}
          error={commentaryError}
        />

      </div>
    </>
  );
}
