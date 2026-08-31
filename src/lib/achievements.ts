import { getState, unlockAchievement } from "./store";
import { levelForXp } from "./storage";
import type { GameResult } from "../types";

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-answer", name: "Let's Go", emoji: "🚀", desc: "Answer your first question" },
  { id: "first-correct", name: "First Steps", emoji: "🌱", desc: "Get your first correct answer" },
  { id: "streak-5", name: "On Fire", emoji: "🔥", desc: "5 correct answers in a row" },
  { id: "streak-10", name: "Unstoppable", emoji: "⚡", desc: "10 correct answers in a row" },
  { id: "fifty-correct", name: "Number Ninja", emoji: "🥷", desc: "Get 50 correct answers" },
  { id: "hundred-correct", name: "Math Machine", emoji: "🤖", desc: "Get 100 correct answers" },
  { id: "race-win", name: "Checkered Flag", emoji: "🏁", desc: "Win a race in Math Racing" },
  { id: "tower-win", name: "Tower of Power", emoji: "🗼", desc: "Defend all 5 waves" },
  { id: "perfect-game", name: "Perfect Score", emoji: "💯", desc: "Win a game with 100% accuracy" },
  { id: "win-5", name: "Winner Winner", emoji: "🏆", desc: "Win 5 games" },
  { id: "win-25", name: "Champion", emoji: "👑", desc: "Win 25 games" },
  { id: "coins-500", name: "Penny Pincher", emoji: "🪙", desc: "Hold 500 coins" },
  { id: "coins-2000", name: "Coins King", emoji: "💰", desc: "Hold 2,000 coins" },
  { id: "spin-first", name: "Lucky Day", emoji: "🎡", desc: "Spin the daily wheel" },
  { id: "spin-7", name: "Lucky Streak", emoji: "🍀", desc: "Spin 7 days in total" },
  { id: "lessons-1", name: "Knowledge Seeker", emoji: "📚", desc: "Complete your first lesson" },
  { id: "lessons-10", name: "Bookworm", emoji: "📖", desc: "Complete 10 lessons" },
  { id: "level-5", name: "Rising Star", emoji: "⭐", desc: "Reach level 5" },
  { id: "level-10", name: "Math Legend", emoji: "🌟", desc: "Reach level 10" },
  { id: "premium", name: "Supporter", emoji: "💎", desc: "Buy Premium" },
];

const unlockedIds = () => getState().achievements;

export function evaluateAfterAnswer(_correct: boolean): string[] {
  const s = getState();
  const newly: string[] = [];
  const check = (id: string) => {
    if (!unlockedIds()[id] && unlockAchievement(id)) newly.push(id);
  };
  if (s.totalAnswers >= 1) check("first-answer");
  if (s.correctAnswers >= 1) check("first-correct");
  if (s.correctAnswers >= 50) check("fifty-correct");
  if (s.correctAnswers >= 100) check("hundred-correct");
  return newly;
}

export function evaluateAfterGame(result: GameResult): string[] {
  const s = getState();
  const newly: string[] = [];
  const check = (id: string) => {
    if (!unlockedIds()[id] && unlockAchievement(id)) newly.push(id);
  };

  if (result.gameId === "racing" && result.won) check("race-win");
  if (result.gameId === "tower" && result.won) check("tower-win");
  if (result.won && result.total > 0 && result.correct === result.total) check("perfect-game");
  if (result.bestStreak >= 5) check("streak-5");
  if (result.bestStreak >= 10) check("streak-10");
  if (s.gamesWon >= 5) check("win-5");
  if (s.gamesWon >= 25) check("win-25");
  if (s.coins >= 500) check("coins-500");
  if (s.coins >= 2000) check("coins-2000");
  if (s.lastSpinDay) check("spin-first");
  if (s.spinCount >= 7) check("spin-7");
  if (s.lessonsCompleted.length >= 1) check("lessons-1");
  if (s.lessonsCompleted.length >= 10) check("lessons-10");
  if (levelForXp(s.xp) >= 5) check("level-5");
  if (levelForXp(s.xp) >= 10) check("level-10");
  if (s.purchases.premium) check("premium");
  return newly;
}