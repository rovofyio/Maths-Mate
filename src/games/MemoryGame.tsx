import { useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { makeQuiz, getTopic, DIFFICULTIES } from "../lib/questions";
import type { Difficulty, TopicId } from "../types";

interface Card {
  id: number;
  pairId: number;
  face: string;
  kind: "text" | "number";
  revealed: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const quiz = useRef(makeQuiz(topicId, diffId, 6)).current;
  const [cards, setCards] = useState<Card[]>(() =>
    shuffle(
      quiz.flatMap((q, i) => [
        { id: i * 2, pairId: i, face: q.text, kind: "text" as const, revealed: false, matched: false },
        { id: i * 2 + 1, pairId: i, face: String(q.answer), kind: "number" as const, revealed: false, matched: false },
      ])
    )
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const lockRef = useRef(false);
  const overRef = useRef(false);

  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const reward = buildReward({ won, correct: matched, diffId, bonus: 10 });
    onFinish({
      gameId: "memory",
      won,
      correct: matched,
      total: 6,
      bestStreak: 0,
      score: Math.max(0, 100 - moves),
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const flip = (id: number) => {
    if (lockRef.current || overRef.current) return;
    const card = cards.find((c) => c.id === id)!;
    if (card.revealed || card.matched) return;
    if (flipped.length === 2) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, revealed: true } : c));
    const nextFlipped = [...flipped, id];
    setCards(newCards);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped.map((cid) => newCards.find((c) => c.id === cid)!);
      const isMatch = a.pairId === b.pairId && a.kind !== b.kind;
      setTimeout(() => {
        if (isMatch) {
          setCards((cs) => cs.map((c) => (c.pairId === a.pairId ? { ...c, matched: true, revealed: true } : c)));
          setMatched((m) => {
            const nm = m + 1;
            if (nm >= quiz.length) finish(true);
            return nm;
          });
        } else {
          setCards((cs) => cs.map((c) => (nextFlipped.includes(c.id) ? { ...c, revealed: false } : c)));
        }
        setFlipped([]);
        lockRef.current = false;
      }, 800);
    }
  };

  return (
    <GameShell
      emoji="🃏"
      name="Memory Match"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `Moves ${moves}`]}
      onQuit={() => finish(false)}
    >
      <p className="memory-hint">Match each equation to its answer. {matched}/6 pairs found.</p>
      <div className="memory-grid">
        {cards.map((c) => (
          <button
            key={c.id}
            className={`memory-card ${c.revealed ? "revealed" : ""} ${c.matched ? "matched" : ""}`}
            onClick={() => flip(c.id)}
          >
            {c.revealed || c.matched ? c.face : "❓"}
          </button>
        ))}
      </div>
    </GameShell>
  );
}