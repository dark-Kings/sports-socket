import { useEffect, useState } from "react";
import { api } from "../services/api";
import { createMatchSocket } from "../services/websocket";
import type { Commentary } from "../types/sports";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useMatchCommentary(matchId: number | null) {
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId === null) {
      setCommentary([]);
      setStatus("disconnected");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setCommentary([]);

    // Open the socket first so events occurring during the REST request aren't missed.
    const connection = createMatchSocket(matchId, {
      onStatus: setStatus,
      onCommentary: (payload) => {
        const incoming = payload.data as Commentary | undefined;
        if (!incoming || !active) return;

        setCommentary((current) => {
          if (current.some((item) => item.id === incoming.id)) return current;
          return [...current, incoming].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
              a.id - b.id,
          );
        });
      },
    });

    api.getCommentary(matchId)
      .then((result) => {
        if (!active) return;
        setCommentary((current) => {
          const byId = new Map<number, Commentary>();
          [...result.data, ...current].forEach((item) => byId.set(item.id, item));
          return [...byId.values()].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
              a.id - b.id,
          );
        });
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load commentary");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      connection.disconnect();
    };
  }, [matchId]);

  return { commentary, status, loading, error };
}