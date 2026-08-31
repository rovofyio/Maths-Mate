import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, Question, TopicId } from "../types";

const TOTAL_QUESTIONS = 12;
const TIME_PER_Q = 8000;

type BalloonState = "idle" | "popped" | "wrong";

export function BalloonPopGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [question, setQuestion] = useState<Question>(() => makeQuestion(topicId, diffId));
  const [qIndex, setQIndex] = useState(0);
  const [balloons, setBalloons] = useState<{ value: number; state: BalloonState }[]>([]);
  const [streak, setStreak] = useState(0);
  const streakRef = useRef(0);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const overRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef(question);

  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "balloon",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: s.correct,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const loadQuestion = () => {
    const q = makeQuestion(topicId, diffId);
    current.current = q;
    setQuestion(q);
    setBalloons(q.options.map((v) => ({ value: v, state: "idle" as BalloonState })));
  };

  useEffect(() => {
    loadQuestion();
    timerRef.current = setTimeout(() => handleAnswer(false, -1, true), TIME_PER_Q);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [qIndex]);

  const handleAnswer = (correct: boolean, value: number, timedOut = false) => {
    if (overRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    recordAnswer(current.current.topicId, correct);
    evaluateAfterAnswer(correct);
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      setStreak(streakRef.current);
      setBalloons((bs) => bs.map((b) => (b.value === value ? { ...b, state: "popped" } : b)));
    } else {
      streakRef.current = 0;
      setStreak(0);
      setBalloons((bs) => bs.map((b) => (b.value === value ? { ...b, state: "wrong" } : b)));
    }
    setTimeout(() => {
      if (overRef.current) return;
      if (qIndex + 1 >= TOTAL_QUESTIONS) finish(true);
      else setQIndex((i) => i + 1);
    }, timedOut ? 900 : 700);
  };

  return (
    <GameShell
      emoji="🎈"
      name="Balloon Pop"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `${qIndex + 1}/${TOTAL_QUESTIONS}`]}
      onQuit={() => finish(false)}
    >
      <div className="question-text balloon-question">{question.text}</div>
      <div className="balloon-field">
        {balloons.map((b, i) => (
          <button
            key={`${qIndex}-${b.value}-${i}`}
            className={`balloon ${b.state}`}
            style={{ left: `${10 + i * 22}%`, animationDelay: `${i * 0.3}s` }}
            onClick={() => b.state === "idle" && handleAnswer(b.value === question.answer, b.value)}
          >
            <span className="balloon-emoji">🎈</span>
            <span className="balloon-value">{b.value}</span>
          </button>
        ))}
      </div>
      <p className="balloon-hint">Pop the balloon with the right answer! {streak > 1 ? `🔥 streak ${streak}` : ""}</p>
    </GameShell>
  );
}