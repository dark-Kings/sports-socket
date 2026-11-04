
import { useEffect } from "react";
import { createMatchSocket } from "../services/websocket";
import type { Match, WsEnvelope } from "../types/sports";

interface Props {
    onMatchCreated: (match: Match) => void;
}

export function useMatchUpdates({ onMatchCreated }: Props) {

    useEffect(() => {

        const connection = createMatchSocket(null, {
            onMatchCreated: (payload: WsEnvelope) => {
                const match = payload.data as Match | undefined;

                if (!match || typeof match.id !== "number") return;

                onMatchCreated(match);
            }
        });

        return () => {
            connection.disconnect();
        };

    }, [onMatchCreated]);
}
