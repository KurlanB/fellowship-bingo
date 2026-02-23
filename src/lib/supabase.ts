import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Real-time features will be disabled.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Generate a unique device ID for this browser/device
export function getDeviceId(): string {
  const key = "bingo_device_id";
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

// Local storage keys
const STORAGE_KEY = "bingo_game_state";

export function saveGameToLocal(game: {
  playerName: string;
  year: number;
  cohort: string;
  cells: { criteriaId: number; name: string; filled: boolean }[];
  completed: boolean;
}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...game,
    deviceId: getDeviceId(),
    updatedAt: new Date().toISOString(),
  }));
}

export function loadGameFromLocal(): {
  playerName: string;
  year: number;
  cohort: string;
  cells: { criteriaId: number; name: string; filled: boolean }[];
  completed: boolean;
  deviceId: string;
  updatedAt: string;
} | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearGameFromLocal() {
  localStorage.removeItem(STORAGE_KEY);
}
