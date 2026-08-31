import { settleGame } from "../lib/store";
import { evaluateAfterGame, ACHIEVEMENTS } from "../lib/achievements";
import { DIFFICULTIES } from "../lib/questions";
import { coinsBonus } from "../lib/iap";
import type { Difficulty, GameResult } from "../types";

export function buildReward({ won, correct, diffId, bonus = 0 }: { won: boolean; correct: number; diffId: Difficulty; bonus?: number }): { coins: number; xp: number } {
  const diff = DIFFICULTIES[diffId];
  const coins = Math.max(0, Math.round((correct * 2 + (won ? 15 : 5) + bonus) * coinsBonus()));
  const xp = correct * 5 + (won ? 40 : 10) + diff.xpBonus;
  return { coins, xp };
}

export interface ResultInput {
  gameId: string;
  won: boolean;
  correct: number;
  total: number;
  bestStreak: number;
  score: number;
  coins: number;
  xp: number;
  reachedWave?: number;
}

export function computeResult(input: ResultInput): GameResult {
  return { ...input };
}

export function finishGame(input: ResultInput): { result: GameResult; newAchievements: string[] } {
  const result = computeResult(input);
  settleGame(result);
  const newly = evaluateAfterGame(result);
  return { result, newAchievements: newly.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji ?? "🏅") };
}

export function accuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}