import type { Difficulty, Question, TopicId } from "../types";

export const DIFFICULTIES: Record<Difficulty, { name: string; emoji: string; xpBonus: number; coinBonus: number }> = {
  easy: { name: "Easy", emoji: "😊", xpBonus: 0, coinBonus: 0 },
  medium: { name: "Medium", emoji: "🤔", xpBonus: 10, coinBonus: 5 },
  hard: { name: "Hard", emoji: "🧠", xpBonus: 25, coinBonus: 12 },
};

export interface Topic {
  id: TopicId;
  name: string;
  emoji: string;
  color: string;
  desc: string;
  generate: (diff: Difficulty) => { text: string; answer: number };
}

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function rangeFor(diff: Difficulty, easy: [number, number], medium: [number, number], hard: [number, number]) {
  if (diff === "easy") return easy;
  if (diff === "medium") return medium;
  return hard;
}

export const TOPICS: Topic[] = [
  {
    id: "addition",
    name: "Addition",
    emoji: "➕",
    color: "#e74c3c",
    desc: "Adding numbers together",
    generate(diff) {
      const [lo, hi] = rangeFor(diff, [1, 20], [20, 90], [100, 950]);
      const a = ri(lo, hi), b = ri(lo, hi);
      return { text: `${a} + ${b} = ?`, answer: a + b };
    },
  },
  {
    id: "subtraction",
    name: "Subtraction",
    emoji: "➖",
    color: "#0984e3",
    desc: "Taking numbers away",
    generate(diff) {
      const [lo, hi] = rangeFor(diff, [2, 30], [20, 90], [100, 950]);
      const a = ri(lo, hi);
      const b = ri(Math.min(lo, a), a);
      return { text: `${a} − ${b} = ?`, answer: a - b };
    },
  },
  {
    id: "multiplication",
    name: "Multiplication",
    emoji: "✖️",
    color: "#f39c12",
    desc: "Times tables and products",
    generate(diff) {
      const [lo, hi] = rangeFor(diff, [2, 5], [6, 9], [11, 19]);
      const a = ri(lo, hi);
      const b = ri(2, 12);
      return { text: `${a} × ${b} = ?`, answer: a * b };
    },
  },
  {
    id: "division",
    name: "Division",
    emoji: "➗",
    color: "#00b894",
    desc: "Sharing numbers equally",
    generate(diff) {
      const [lo, hi] = rangeFor(diff, [2, 5], [3, 8], [4, 12]);
      const b = ri(lo, hi);
      const q = ri(2, 12);
      return { text: `${b * q} ÷ ${b} = ?`, answer: q };
    },
  },
  {
    id: "mixed",
    name: "Mixed",
    emoji: "🎲",
    color: "#6c5ce7",
    desc: "A bit of everything",
    generate(diff) {
      const topic = pick(TOPICS.filter((t) => t.id !== "mixed"));
      return topic.generate(diff);
    },
  },
];

function distractors(answer: number, count = 3): number[] {
  if (!Number.isFinite(answer)) return shuffle([answer, 0, 1, 2]);
  const set = new Set<number>([answer]);
  let guard = 0;
  const spread = Math.max(2, Math.abs(answer * 0.18));
  while (set.size < count + 1 && guard < 300) {
    guard++;
    const d = answer + ri(-Math.round(spread), Math.round(spread));
    if (d !== answer && d >= 0 && Number.isFinite(d)) set.add(d);
  }
  let extra = 3;
  while (set.size < count + 1 && extra < 100) set.add(answer + extra++);
  const arr = [...set];
  return shuffle(arr);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function makeQuestion(topicId: TopicId, diffId: Difficulty): Question {
  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const { text, answer } = topic.generate(diffId);
  return { text, answer, options: distractors(answer), topicId: topic.id, diffId };
}

export function makeQuiz(topicId: TopicId, diffId: Difficulty, count: number): Question[] {
  return Array.from({ length: count }, () => makeQuestion(topicId, diffId));
}

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

export function topicForAge(age: number): TopicId {
  if (age <= 7) return "addition";
  if (age <= 10) return "mixed";
  return "multiplication";
}