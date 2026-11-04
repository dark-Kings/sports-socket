import type { ApiList, Commentary, Match } from "../types/sports";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getMatches: () => request<ApiList<Match>>("/matches"),
  getCommentary: (matchId: number, limit = 100) =>
    request<ApiList<Commentary>>(
      `/matches/${matchId}/commentary?limit=${limit}`,
    ),
};