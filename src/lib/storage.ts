import { GameState, Cohort } from "./bingo-data";

const STORAGE_KEY = "mcm-bingo-game";
const LEADERBOARD_KEY = "mcm-bingo-leaderboard";

export interface LeaderboardEntry {
  playerName: string;
  year: number;
  cohort: Cohort;
  completedAt: number;
  duration: number; // ms from start to completion
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getLeaderboard(year: number, cohort: Cohort): LeaderboardEntry[] {
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  if (!raw) return [];
  try {
    const all: LeaderboardEntry[] = JSON.parse(raw);
    return all
      .filter(e => e.year === year && e.cohort === cohort)
      .sort((a, b) => a.duration - b.duration);
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  let all: LeaderboardEntry[] = [];
  try {
    if (raw) all = JSON.parse(raw);
  } catch { /* ignore */ }
  all.push(entry);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(all));
}
