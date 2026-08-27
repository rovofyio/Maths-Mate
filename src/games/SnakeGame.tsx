import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, Question, TopicId } from "../types";

const SIZE = 10;
const STEP_MS = 230;
const GAME_SECONDS = 75;

type Dir = "up" | "down" | "left" | "right";
interface P {
  x: number;
  y: number;
}

const DIRS: Record<Dir, P> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function SnakeGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [snake, setSnake] = useState<P[]>([{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }]);
  const [food, setFood] = useState<P>({ x: 6, y: 4 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [question, setQuestion] = useState<Question | null>(null);

  const dirRef = useRef<Dir>("right");
  const snakeRef = useRef<P[]>(snake);
  const foodRef = useRef<P>(food);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const overRef = useRef(false);
  const pausedRef = useRef(false);

  const topic = getTopic(topicId);

  const placeFood = (s: P[]) => {
    const taken = new Set(s.map((p) => `${p.x},${p.y}`));
    const empties: P[] = [];
    for (let x = 0; x < SIZE; x++)
      for (let y = 0; y < SIZE; y++) if (!taken.has(`${x},${y}`)) empties.push({ x, y });
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  };

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = { correct: scoreRef.current, total: 1, bestStreak: streakRef.current };
    const reward = buildReward({ won, correct: Math.max(0, Math.round(scoreRef.current / 10)), diffId });
    onFinish({
      gameId: "snake",
      won,
      correct: s.correct,
      total: 1,
      bestStreak: s.bestStreak,
      score: scoreRef.current,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  useEffect(() => {
    const move = setInterval(() => {
      if (overRef.current || pausedRef.current) return;
      const d = DIRS[dirRef.current];
      const head = snakeRef.current[0];
      const nh = { x: (head.x + d.x + SIZE) % SIZE, y: (head.y + d.y + SIZE) % SIZE };
      if (snakeRef.current.slice(0, -1).some((p) => p.x === nh.x && p.y === nh.y)) {
        finish(false);
        return;
      }
      const ate = nh.x === foodRef.current.x && nh.y === foodRef.current.y;
      let next = [nh, ...snakeRef.current];
      if (!ate) next = next.slice(0, -1);
      else {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        const nf = placeFood(next);
        if (!nf) {
          finish(true);
          return;
        }
        foodRef.current = nf;
        setFood(nf);
        pausedRef.current = true;
        
        setQuestion(makeQuestion(topicId, diffId));
      }
      snakeRef.current = next;
      setSnake(next);
    }, STEP_MS);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finish(scoreRef.current >= 40);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(move);
      clearInterval(timer);
    };
  }, []);

  const answerSnakeQ = (correct: boolean) => {
    if (!question || overRef.current) return;
    recordAnswer(question.topicId, correct);
    evaluateAfterAnswer(correct);
    if (correct) {
      streakRef.current += 1;
      scoreRef.current += 5;
      setScore(scoreRef.current);
    } else {
      streakRef.current = 0;
      snakeRef.current = snakeRef.current.slice(0, Math.max(1, snakeRef.current.length - 1));
      setSnake([...snakeRef.current]);
      if (snakeRef.current.length <= 1) {
        setQuestion(null);
        pausedRef.current = false;
        
        finish(false);
        return;
      }
    }
    setQuestion(null);
    pausedRef.current = false;
    
  };

  const setDir = (d: Dir) => {
    const cur = dirRef.current;
    const opposite = { up: "down", down: "up", left: "right", right: "left" }[d] as Dir;
    if (cur !== opposite) dirRef.current = d;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        setDir(d);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <GameShell
      emoji="🐍"
      name="Math Snake"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`, `Score ${score}`]}
      onQuit={() => finish(false)}
    >
      <div className="snake-top">
        <span>⏱ {timeLeft}s</span>
        <span>🪙 {score}</span>
      </div>
      <div className="snake-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const x = i % SIZE;
          const y = Math.floor(i / SIZE);
          const isSnake = snake.some((p) => p.x === x && p.y === y);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className={`cell ${isHead ? "head" : isSnake ? "snake" : ""} ${isFood ? "food" : ""}`}>
              {isFood ? "🍎" : ""}
            </div>
          );
        })}
      </div>
      <div className="snake-controls">
        <button className="dpad-btn" onClick={() => setDir("left")}>
          ◀
        </button>
        <button className="dpad-btn" onClick={() => setDir("up")}>
          ▲
        </button>
        <button className="dpad-btn" onClick={() => setDir("down")}>
          ▼
        </button>
        <button className="dpad-btn" onClick={() => setDir("right")}>
          ▶
        </button>
      </div>

      {question && (
        <div className="snake-question">
          <p className="snake-q-text">{question.text}</p>
          <div className="snake-q-options">
            {question.options.map((o) => (
              <button key={o} className="answer-btn" onClick={() => answerSnakeQ(o === question.answer)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}