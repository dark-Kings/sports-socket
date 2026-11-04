import type { Match } from "../types/sports";

export type MatchGroup = "live" | "upcoming" | "history";

export function getMatchGroup(match: Match): MatchGroup {
  const status = match.status.toLowerCase();
  if (status === "live") return "live";
  if (status === "finished" || status === "completed") return "history";
  return "upcoming";
}

export function formatMatchTime(value: string | null): string {
  if (!value) return "TIME TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatEventTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}