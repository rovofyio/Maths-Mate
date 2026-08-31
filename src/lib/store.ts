import { signal } from "@preact/signals";
import { loadState, saveState, clearState, todayKey } from "./storage";
import type { GameResult, PlayerState } from "../types";

export const state = signal<PlayerState>(loadState());

function commit(next: PlayerState) {
  state.value = next;
  saveState(next);
}

export const getState = () => state.value;

export function addCoins(amount: number): number {
  const s = getState();
  const next = { ...s, coins: Math.max(0, s.coins + amount) };
  commit(next);
  return next.coins;
}

export function spendCoins(amount: number): boolean {
  const s = getState();
  if (s.coins < amount) return false;
  const next = { ...s, coins: s.coins - amount };
  commit(next);
  return true;
}

export function addXp(amount: number): number {
  const s = getState();
  const next = { ...s, xp: s.xp + amount };
  commit(next);
  return next.xp;
}

export function recordAnswer(topicId: string, correct: boolean): void {
  const s = getState();
  const t = s.topicStats[topicId] ?? { played: 0, correct: 0, total: 0 };
  const topicStats = {
    ...s.topicStats,
    [topicId]: { played: t.played + 1, correct: t.correct + (correct ? 1 : 0), total: t.total + 1 },
  };
  commit({ ...s, topicStats, totalAnswers: s.totalAnswers + 1, correctAnswers: s.correctAnswers + (correct ? 1 : 0) });
}

export function recordGame(won: boolean): void {
  const s = getState();
  commit({ ...s, gamesPlayed: s.gamesPlayed + 1, gamesWon: s.gamesWon + (won ? 1 : 0) });
}

export function setHighScore(gameId: string, score: number): boolean {
  const s = getState();
  if ((s.highScores[gameId] ?? 0) >= score) return false;
  commit({ ...s, highScores: { ...s.highScores, [gameId]: score } });
  return true;
}

export function completeLesson(id: string): void {
  const s = getState();
  if (s.lessonsCompleted.includes(id)) return;
  commit({ ...s, lessonsCompleted: [...s.lessonsCompleted, id] });
}

export function unlockAchievement(id: string): boolean {
  const s = getState();
  if (s.achievements[id]) return false;
  commit({ ...s, achievements: { ...s.achievements, [id]: Date.now() } });
  return true;
}

export function recordAdSeen(): void {
  const s = getState();
  commit({ ...s, adsSeen: s.adsSeen + 1, gamesSinceAd: 0 });
}

export function incrementGamesSinceAd(): void {
  const s = getState();
  commit({ ...s, gamesSinceAd: s.gamesSinceAd + 1 });
}

export function setPurchase(productId: string): void {
  const s = getState();
  commit({ ...s, purchases: { ...s.purchases, [productId]: true } });
}

export function hasPurchase(productId: string): boolean {
  return getState().purchases[productId] === true;
}

export function claimDailySpin(prize: { coins: number; xp: number; label: string }): boolean {
  const s = getState();
  if (s.lastSpinDay === todayKey()) return false;
  const next = {
    ...s,
    lastSpinDay: todayKey(),
    spinCount: s.spinCount + 1,
    coins: s.coins + prize.coins,
    xp: s.xp + prize.xp,
  };
  commit(next);
  return true;
}

export function canSpinToday(): boolean {
  return getState().lastSpinDay !== todayKey();
}

export function updateSettings(patch: Partial<PlayerState["settings"]>): void {
  const s = getState();
  commit({ ...s, settings: { ...s.settings, ...patch } });
}

export function resetAll(): void {
  clearState();
  state.value = loadState();
}

export function settleGame(result: GameResult): void {
  const s = getState();
  const scoreKey = result.gameId;
  const prev = s.highScores[scoreKey] ?? 0;
  commit({
    ...s,
    coins: s.coins + result.coins,
    xp: s.xp + result.xp,
    gamesPlayed: s.gamesPlayed + 1,
    gamesWon: s.gamesWon + (result.won ? 1 : 0),
    gamesSinceAd: s.gamesSinceAd + 1,
    highScores: result.score > prev ? { ...s.highScores, [scoreKey]: result.score } : s.highScores,
  });
}