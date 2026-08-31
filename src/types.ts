export type Difficulty = "easy" | "medium" | "hard";
export type TopicId =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "mixed";

export interface Question {
  text: string;
  answer: number;
  options: number[];
  topicId: TopicId;
  diffId: Difficulty;
}

export interface GameResult {
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

export interface TopicStat {
  played: number;
  correct: number;
  total: number;
}

export interface PlayerSettings {
  sound: boolean;
  tts: boolean;
  ttsSpeed: number;
  carColor: string;
  theme: "light" | "dark";
  music: boolean;
  googlePlay: boolean;
  facebook: boolean;
}

export interface PlayerState {
  coins: number;
  xp: number;
  totalAnswers: number;
  correctAnswers: number;
  gamesPlayed: number;
  gamesWon: number;
  lessonsCompleted: string[];
  achievements: Record<string, number>;
  topicStats: Record<string, TopicStat>;
  highScores: Record<string, number>;
  lastSpinDay: string | null;
  spinCount: number;
  purchases: Record<string, boolean>;
  adsSeen: number;
  gamesSinceAd: number;
  settings: PlayerSettings;
  createdAt: number;
}

export type Route =
  | { name: "games" }
  | { name: "learn" }
  | { name: "daily" }
  | { name: "profile" };

export interface GameMeta {
  id: string;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
  ages: [number, number];
  free: boolean;
  tag?: string;
  bestFor?: string;
}