
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Match } from "../types/sports";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches from backend
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getMatches();
      setMatches(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load matches"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial API request
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Add newly created match without duplicates
  const addMatch = useCallback((newMatch: Match) => {
    setMatches((currentMatches) => {
      const alreadyExists = currentMatches.some(
        (match) => match.id === newMatch.id
      );

      if (alreadyExists) return currentMatches;

      return [newMatch, ...currentMatches];
    });
  }, []);

  return {
    matches,
    loading,
    error,
    refresh,
    setMatches,
    addMatch,
  };
}
