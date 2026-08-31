import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { QuestionCard } from "../components/Quiz";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import type { Difficulty, TopicId } from "../types";

const GAME_SECONDS = 60;

export function FastMathGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [question, setQuestion] = useState(() => makeQuestion(topicId, diffId));
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const streakRef = useRef(0);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const overRef = useRef(false);

  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "fastmath",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: s.correct,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswer = (correct: boolean) => {
    if (overRef.current) return;
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      setStreak(streakRef.current);
    } else {
      streakRef.current = 0;
      setStreak(0);
    }
    setQuestion(makeQuestion(topicId, diffId));
  };

  const pct = (timeLeft / GAME_SECONDS) * 100;
  return (
    <GameShell
      emoji="⏱️"
      name="Fast Math"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `Score ${statsRef.current.correct}`]}
      onQuit={() => finish(false)}
    >
      <div className="fastmath-score">
        <span>Score</span>
        <span className="fs-num">{statsRef.current.correct}</span>
        <span>⚡ {streak > 1 ? streak : ""}</span>
      </div>
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
      </div>
      <QuestionCard
        key={question.text + question.answer}
        question={question}
        streak={streak}
        onAnswer={(c) => handleAnswer(c)}
      />
    </GameShell>
  );
}