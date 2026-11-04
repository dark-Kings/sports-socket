export type MatchStatus = "scheduled" | "live" | "finished" | string;

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  startTime: string | null;
  endTime: string | null;
  homeScore: number;
  awayScore: number;
  createdAt?: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute: number | null;
  sequence?: number | null;
  period?: string | null;
  eventType?: string | null;
  actor?: string | null;
  team?: string | null;
  message: string;
  metadata?: Record<string, unknown> | null;
  tags?: string[] | null;
  createdAt: string;
}

export interface ApiList<T> {
  data: T[];
}

export interface WsEnvelope<T = unknown> {
  type: string;
  matchId?: number;
  data?: T;
  message?: string;
}