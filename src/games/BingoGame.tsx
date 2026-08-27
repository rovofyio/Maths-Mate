import { useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, TopicId } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function genCard(): number[] {
  return shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 25);
}

function genQ(v: number): { text: string; answer: number; options: number[] } {
  const useAdd = Math.random() < 0.6;
  let text: string;
  let answer: number;
  if (useAdd) {
    const a = ri(1, v - 1);
    text = `${a} + ${v - a} = ?`;
    answer = v;
  } else {
    const a = ri(1, v - 1);
    text = `${v} − ${a} = ?`;
    answer = v - a;
  }
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(ri(Math.max(1, answer - 6), answer + 6));
  const options = shuffle([...set]);
  return { text, answer, options };
}

function bingoLines(): number[][] {
  const lines: number[][] = [];
  for (let i = 0; i < 5; i++) lines.push([...Array.from({ length: 5 }, (_, j) => i * 5 + j)]);
  for (let j = 0; j < 5; j++) lines.push([...Array.from({ length: 5 }, (_, i) => i * 5 + j)]);
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
}

export function BingoGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [card] = useState(genCard);
  const [stamped, setStamped] = useState<number[]>([]);
  const [q, setQ] = useState(() => genQ(ri(3, 25)));
  const [qIndex, setQIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const streakRef = useRef(0);
  const overRef = useRef(false);

  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId, bonus: 10 });
    onFinish({
      gameId: "bingo",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: stamped.length,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const checkBingo = (s: number[]): boolean => {
    return bingoLines().some((line) => line.every((i) => s.includes(card[i])));
  };

  const answer = (opt: number) => {
    if (locked || overRef.current) return;
    setLocked(true);
    const correct = opt === q.answer;
    recordAnswer("mixed", correct);
    evaluateAfterAnswer(correct);
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      const ns = card.includes(q.answer) && !stamped.includes(q.answer) ? [...stamped, q.answer] : stamped;
      setStamped(ns);
      if (checkBingo(ns)) {
        setTimeout(() => finish(true), 600);
        return;
      }
    } else {
      streakRef.current = 0;
    }
    setTimeout(() => {
      if (overRef.current) return;
      setQIndex((i) => {
        if (i + 1 >= 25) {
          finish(false);
          return i;
        }
        return i + 1;
      });
      setQ(genQ(ri(3, 25)));
      setLocked(false);
    }, 650);
  };

  return (
    <GameShell
      emoji="🎯"
      name="Number Bingo"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `Q${qIndex + 1}/25`]}
      onQuit={() => finish(false)}
    >
      <div className="question-text">{q.text}</div>
      <div className="answer-grid bingo-options">
        {q.options.map((o) => (
          <button key={o} className="answer-btn" onClick={() => answer(o)}>
            {o}
          </button>
        ))}
      </div>
      <div className="bingo-card" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {card.map((v) => (
          <div key={v} className={`bingo-cell ${stamped.includes(v) ? "stamped" : ""}`}>
            {stamped.includes(v) ? "⭐" : v}
          </div>
        ))}
      </div>
      <p className="bingo-hint">Make a line of 5 ⭐ to win!</p>
    </GameShell>
  );
}