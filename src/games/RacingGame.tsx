import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { QuestionCard } from "../components/Quiz";
import { buildReward, type ResultInput } from "./helpers";
import type { Difficulty, TopicId } from "../types";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import { GreenSuperCar, RedSuperCar } from "../components/CarIcons";

export function RacingGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const TRACK = 100;
  const [playerPos, setPlayerPos] = useState(4);
  const [cpuPos, setCpuPos] = useState(4);
  const [question, setQuestion] = useState(() => makeQuestion(topicId, diffId));
  const [streak, setStreak] = useState(0);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const overRef = useRef(false);
  const topic = getTopic(topicId);

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "racing",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: Math.round(won ? playerPos : playerPos),
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  useEffect(() => {
    const idle = setInterval(() => {
      if (overRef.current) return;
      setCpuPos((p) => {
        const np = Math.min(TRACK, p + 0.25 + Math.random() * 0.4);
        if (np >= TRACK) finish(false);
        return np;
      });
    }, 300);
    return () => clearInterval(idle);
  }, []);

  const handleAnswer = (correct: boolean) => {
    if (overRef.current) return;
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      s.bestStreak = Math.max(s.bestStreak, streak + 1);
      setStreak((k) => k + 1);
      setPlayerPos((p) => {
        const np = Math.min(TRACK, p + 13);
        if (np >= TRACK) finish(true);
        return np;
      });
      setCpuPos((p) => Math.min(TRACK, p + 3 + Math.random() * 6));
    } else {
      setStreak(0);
      setCpuPos((p) => Math.min(TRACK, p + 5 + Math.random() * 9));
    }
    setTimeout(() => {
      if (overRef.current) return;
      setQuestion(makeQuestion(topicId, diffId));
    }, 650);
  };

  return (
    <GameShell emoji="🏎️" name="Math Racing" pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`]} onQuit={() => finish(false)}>
      <div className="racing-track">
        <div className="road">
          <div className="finish-line-bar" />
          <div className="finish-flag">🏁 FINISH</div>
          <div className="lane lane-left">
            <div className="race-car cpu" style={{ bottom: `calc(4% + ${cpuPos * 0.72}%)` }}>
              <RedSuperCar />
            </div>
            <div className="lane-label cpu-label">Car 1 • Rival</div>
          </div>
          <div className="lane lane-right">
            <div className="race-car player" style={{ bottom: `calc(4% + ${playerPos * 0.72}%)` }}>
              <GreenSuperCar />
            </div>
            <div className="lane-label player-label">Car 2 • You</div>
          </div>
        </div>
        <div className="race-progress">
          <div className="progress-row">
            <span>Car 2 • You</span>
            <div className="mini-bar">
              <div className="player-bar" style={{ width: `${playerPos}%` }} />
            </div>
            <span>{Math.round(playerPos)}%</span>
          </div>
          <div className="progress-row">
            <span>Car 1 • Rival</span>
            <div className="mini-bar">
              <div className="cpu" style={{ width: `${cpuPos}%` }} />
            </div>
            <span>{Math.round(cpuPos)}%</span>
          </div>
        </div>
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