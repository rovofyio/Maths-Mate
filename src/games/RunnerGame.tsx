import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { QuestionCard } from "../components/Quiz";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import type { Difficulty, Question, TopicId } from "../types";

const GAME_SECONDS = 60;
const OBSTACLE_DURATION = 2400;

type Obstacle = { id: number; hit: boolean };

export function RunnerGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [question, setQuestion] = useState<Question>(() => makeQuestion(topicId, diffId));
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [anim, setAnim] = useState<"" | "jump" | "trip">("");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const streakRef = useRef(0);
  const overRef = useRef(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const obstacleIdRef = useRef(0);

  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const score = s.correct * 10 - (s.total - s.correct) * 5;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "runner",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: Math.max(0, score),
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finish(statsRef.current.correct >= 12);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, []);

  const handleAnswer = (correct: boolean) => {
    if (overRef.current) return;
    const s = statsRef.current;
    s.total++;
    if (animTimer.current) clearTimeout(animTimer.current);
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      setAnim("jump");
    } else {
      streakRef.current = 0;
      setAnim("trip");
    }
    const obstacle = { id: obstacleIdRef.current++, hit: !correct };
    setObstacles((prev) => [...prev, obstacle]);
    setTimeout(() => {
      setObstacles((prev) => prev.filter((item) => item.id !== obstacle.id));
    }, OBSTACLE_DURATION);
    animTimer.current = setTimeout(() => setAnim(""), correct ? 2400 : 1400);
    setQuestion(makeQuestion(topicId, diffId));
  };

  return (
    <GameShell
      emoji="🏃"
      name="Math Runner"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `${timeLeft}s`]}
      onQuit={() => finish(false)}
    >
      <div className="runner-stage">
        <div className="runner-sky" />
        <div className="ground-dashes" />
        {obstacles.map((obstacle) => (
          <div key={obstacle.id} className={`obstacle ${obstacle.hit ? "obstacle-hit" : "obstacle-clear"}`} />
        ))}
        <div className="runner-facing-right">
          <div className={`runner ${anim || "running"}`}>🏃</div>
        </div>
        <div className="runner-ground" />
        {anim === "jump" && <div className="jump-word">✅ +10</div>}
        {anim === "trip" && <div className="trip-word">💥</div>}
      </div>
      <p className="runner-score">Score: {statsRef.current.correct * 10 - (statsRef.current.total - statsRef.current.correct) * 5}</p>
      <QuestionCard
        key={question.text + question.answer}
        question={question}
        streak={streakRef.current}
        onAnswer={(c) => handleAnswer(c)}
      />
    </GameShell>
  );
}