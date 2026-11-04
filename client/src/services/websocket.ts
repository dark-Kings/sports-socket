import type { WsEnvelope } from "../types/sports";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

interface SocketHandlers {
  onStatus?: (status: "connecting" | "connected" | "disconnected") => void;
  onCommentary?: (payload: WsEnvelope) => void;
  onMatchCreated?: (payload: WsEnvelope) => void;
}

export function createMatchSocket(
  matchId: number | null,
  handlers: SocketHandlers,
) {
  let socket: WebSocket | null = null;
  let stopped = false;
  let retryTimer: number | undefined;
  let retryDelay = 1000;

  const connect = () => {
    if (stopped) return;

    handlers.onStatus?.("connecting");
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      retryDelay = 1000;
      handlers.onStatus?.("connected");

      if (matchId !== null) {
        socket?.send(JSON.stringify({
          type: "subscribe",
          matchId
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as WsEnvelope;

        if (payload.type === "match_created") {
          handlers.onMatchCreated?.(payload);
        }
        if (
          payload.type === "commentary_created" &&
          payload.matchId === matchId
        ) {
          handlers.onCommentary?.(payload);
        }
      } catch {
        // Ignore malformed frames without dropping the connection.
      }
    };

    socket.onerror = () => {
      // onclose handles reconnection to avoid parallel connections.
    };

    socket.onclose = () => {
      handlers.onStatus?.("disconnected");
      if (stopped) return;

      retryTimer = window.setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    };
  };

  connect();

  return {
    disconnect() {
      stopped = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);

      if (
        matchId !== null &&
        socket?.readyState === WebSocket.OPEN
      ) {
        socket.send(JSON.stringify({
          type: "unsubscribe",
          matchId
        }));
      }
      socket?.close(1000, "Leaving match");
    },
  };
}