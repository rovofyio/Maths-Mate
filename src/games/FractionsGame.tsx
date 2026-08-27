import { useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty } from "../types";

const DENOMS = [2, 3, 4, 5, 6, 8, 10];
const TOTAL = 10;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simpleFrac(n: number, d: number): string {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

function genRound() {
  const d = DENOMS[Math.floor(Math.random() * DENOMS.length)];
  const n = 1 + Math.floor(Math.random() * (d - 1));
  const correct = simpleFrac(n, d);
  const options = new Set<string>([correct]);
  while (options.size < 4) {
    const cand = simpleFrac(1 + Math.floor(Math.random() * (d - 1)), d);
    options.add(cand);
  }
  return { n, d, correct, options: [...options] };
}

export function FractionsGame({ diffId, onFinish }: { diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [round, setRound] = useState(genRound);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const overRef = useRef(false);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const reward = buildReward({ won, correct: score, diffId, bonus: 5 });
    onFinish({
      gameId: "fractions",
      won,
      correct: score,
      total: TOTAL,
      bestStreak: 0,
      score,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const answer = (frac: string) => {
    if (picked) return;
    setPicked(frac);
    const correct = frac === round.correct;
    recordAnswer("mixed", correct);
    evaluateAfterAnswer(correct);
    if (correct) {
      setScore((s) => {
        const ns = s + 1;
        if (index + 1 >= TOTAL) finish(true);
        return ns;
      });
    }
    setTimeout(() => {
      if (overRef.current) return;
      if (index + 1 < TOTAL) {
        setIndex((i) => i + 1);
        setRound(genRound());
        setPicked(null);
      }
    }, 800);
  };

  const angle = 360 / round.d;
  return (
    <GameShell
      emoji="🍕"
      name="Fraction Feast"
      pills={[`🍕 Fractions`, `${index + 1}/${TOTAL}`]}
      onQuit={() => finish(false)}
    >
      <p className="memory-hint">Which fraction of the pizza is eaten?</p>
      <div className="pizza-wrap">
        <div
          className="pizza"
          style={{
            background: `conic-gradient(#fdcb6e 0 ${round.n * angle}deg, #ffeaa7 ${round.n * angle}deg 360deg)`,
          }}
        />
      </div>
      <div className="answer-grid">
        {round.options.map((f) => (
          <button
            key={f}
            className={`answer-btn ${picked ? (f === round.correct ? "correct" : f === picked ? "wrong" : "") : ""}`}
            onClick={() => answer(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <p className="balloon-hint">🍕 Score: {score}/10</p>
    </GameShell>
  );
}