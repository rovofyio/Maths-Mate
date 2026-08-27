import { useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, TopicId } from "../types";

const TOTAL = 15;

export function TrueFalseGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const topic = getTopic(topicId);
  const [q, setQ] = useState(() => {
    const base = makeQuestion(topicId, diffId);
    const truthy = Math.random() < 0.5;
    return {
      statement: truthy ? `${base.text.replace("= ?", `= ${base.answer}`)}` : `${base.text.replace("= ?", `= ${base.options.find((o) => o !== base.answer)!}`)}`,
      truthy,
    };
  });
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<null | boolean>(null);
  const streakRef = useRef(0);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const overRef = useRef(false);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId, bonus: 5 });
    onFinish({
      gameId: "truefalse",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: s.correct,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const answer = (guess: boolean) => {
    if (picked !== null) return;
    setPicked(guess);
    const correct = guess === q.truthy;
    recordAnswer("mixed", correct);
    evaluateAfterAnswer(correct);
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      setScore(s.correct);
    } else {
      streakRef.current = 0;
    }
    setTimeout(() => {
      if (overRef.current) return;
      if (index + 1 >= TOTAL) {
        finish(s.correct >= 10);
        return;
      }
      setIndex((i) => i + 1);
      const base = makeQuestion(topicId, diffId);
      const truthy = Math.random() < 0.5;
      setQ({
        statement: truthy
          ? `${base.text.replace("= ?", `= ${base.answer}`)}`
          : `${base.text.replace("= ?", `= ${base.options.find((o) => o !== base.answer)!}`)}`,
        truthy,
      });
      setPicked(null);
    }, 700);
  };

  return (
    <GameShell
      emoji="⚖️"
      name="True or False"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `${index + 1}/${TOTAL}`]}
      onQuit={() => finish(false)}
    >
      <div className="tf-statement">{q.statement}</div>
      <div className="tf-buttons">
        <button className={`tf-btn true ${picked === true ? (q.truthy ? "correct" : "wrong") : ""}`} onClick={() => answer(true)}>
          ✅ True
        </button>
        <button className={`tf-btn false ${picked === false ? (!q.truthy ? "correct" : "wrong") : ""}`} onClick={() => answer(false)}>
          ❌ False
        </button>
      </div>
      <p className="balloon-hint">⚖️ Score: {score}/15 {streakRef.current > 1 ? `· 🔥 streak ${streakRef.current}` : ""}</p>
    </GameShell>
  );
}