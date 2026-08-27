import type { PlayerState } from "../types";

const KEY = "maths-mate-v2";

export const DEFAULT_SETTINGS = {
  sound: true,
  tts: true,
  ttsSpeed: 1,
  carColor: "#e74c3c",
  theme: "light" as const,
  music: false,
  googlePlay: false,
  facebook: false,
};

export function defaultState(): PlayerState {
  return {
    coins: 100,
    xp: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    lessonsCompleted: [],
    achievements: {},
    topicStats: {},
    highScores: {},
    lastSpinDay: null,
    spinCount: 0,
    purchases: {},
    adsSeen: 0,
    gamesSinceAd: 0,
    settings: { ...DEFAULT_SETTINGS },
    createdAt: Date.now(),
  };
}

export function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      topicStats: { ...(parsed.topicStats ?? {}) },
      achievements: { ...(parsed.achievements ?? {}) },
      highScores: { ...(parsed.highScores ?? {}) },
      purchases: { ...(parsed.purchases ?? {}) },
      lessonsCompleted: [...(parsed.lessonsCompleted ?? [])],
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: PlayerState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function levelForXp(xp: number): number {
  let level = 1;
  let need = 150;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = 150 + (level - 1) * 50;
  }
  return level;
}

export function levelProgress(xp: number): { level: number; current: number; need: number; pct: number } {
  let level = 1;
  let need = 150;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = 150 + (level - 1) * 50;
  }
  return { level, current: remaining, need, pct: Math.round((remaining / need) * 100) };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}