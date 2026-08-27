import { getState, setHighScore } from "./store";

export interface LeaderboardEntry {
  gameId: string;
  gameName: string;
  score: number;
  achievedAt: number;
}

export const GAME_NAMES: Record<string, string> = {
  racing: "Math Racing",
  tower: "Tower Defence",
  balloon: "Balloon Pop",
  fastmath: "Fast Math",
  memory: "Memory Match",
  snake: "Math Snake",
  pvp: "Monster PvP",
  fractions: "Fraction Feast",
  runner: "Math Runner",
  truefalse: "True or False",
  maze: "Maths Maze",
};

export function submitScore(gameId: string, score: number): boolean {
  return setHighScore(gameId, score);
}

export function leaderboard(gameId: string): LeaderboardEntry | null {
  const s = getState();
  const score = s.highScores[gameId];
  if (score === undefined) return null;
  return { gameId, gameName: GAME_NAMES[gameId] ?? gameId, score, achievedAt: Date.now() };
}

export function allScores(): LeaderboardEntry[] {
  const s = getState();
  return Object.entries(s.highScores)
    .map(([gameId, score]) => ({ gameId, gameName: GAME_NAMES[gameId] ?? gameId, score, achievedAt: Date.now() }))
    .sort((a, b) => b.score - a.score);
}

export function totalScore(): number {
  const s = getState();
  return Object.values(s.highScores).reduce((a, b) => a + b, 0);
}