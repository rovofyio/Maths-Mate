import { useEffect, useRef, useState, useCallback } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, Question, TopicId } from "../types";
import dynaUrl from "../../Pictures/Dyna.png";

const TOTAL_QUESTIONS = 10;
const TIME_SECONDS = 180;
const EXPLOSION_DURATION_MS = 900;

const WIRE_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f"];
const WIRE_NAMES = ["Red", "Blue", "Green", "Yellow"];

export function BombDefusalGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [question, setQuestion] = useState<Question>(() => makeQuestion(topicId, diffId));
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_SECONDS);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | null; text: string }>({ type: null, text: "" });
  const [exploded, setExploded] = useState(false);
  const [shake, setShake] = useState(false);
  const overRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsRef = useRef({ correct: 0, total: 0 });
  const current = useRef(question);
  const explodedRef = useRef(false);

  const topic = getTopic(topicId);
  const diff = DIFFICULTIES[diffId];

  const finish = useCallback((won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "bomb",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.correct,
      score: s.correct,
      coins: reward.coins,
      xp: reward.xp,
    });
  }, [diffId, onFinish]);

  const loadQuestion = useCallback(() => {
    const q = makeQuestion(topicId, diffId);
    current.current = q;
    setQuestion(q);
    setFeedback({ type: null, text: "" });
  }, [topicId, diffId]);

  const handleAnswer = useCallback((correct: boolean, _optionIndex: number) => {
    if (overRef.current || explodedRef.current) return;
    if (feedback.type !== null) return;
    recordAnswer(current.current.topicId, correct);
    evaluateAfterAnswer(correct);
    const s = statsRef.current;
    s.total++;

    if (correct) {
      s.correct++;
      setFeedback({ type: "correct", text: "CORRECT! 🔥" });
      setQIndex((i) => i + 1);
      setTimeout(() => {
        if (overRef.current || explodedRef.current) return;
        if (s.correct >= TOTAL_QUESTIONS) {
          finish(true);
        } else {
          loadQuestion();
        }
      }, 800);
    } else {
      setLives((prev) => {
        const next = prev - 1;
        setFeedback({ type: "wrong", text: "WRONG! 💥" });
        if (next <= 0) {
          setTimeout(() => {
            if (!explodedRef.current) {
              explodedRef.current = true;
              setExploded(true);
              setTimeout(() => finish(false), EXPLOSION_DURATION_MS);
            }
          }, 600);
        }
        setTimeout(() => {
          if (overRef.current || explodedRef.current) return;
          loadQuestion();
        }, 800);
        return next;
      });
    }
  }, [feedback.type, finish, loadQuestion]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!explodedRef.current) {
            explodedRef.current = true;
            setExploded(true);
            finish(false);
          }
          return 0;
        }
        if (prev <= 30 && prev > 25) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
        if (prev <= 10) {
          setShake(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finish]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <GameShell
      emoji="💣"
      name="Bomb Defusal"
      pills={[`${topic.emoji} ${topic.name}`, `${diff.name}`, `${qIndex + 1}/${TOTAL_QUESTIONS}`, timeStr]}
      onQuit={() => finish(false)}
    >
      <div className={`bomb-container ${shake ? "bomb-shake" : ""} ${exploded ? "bomb-explode" : ""}`}>
        <div className={`bomb ${exploded ? "bomb-exploded" : ""}`}>
          <img className="bomb-image" src={dynaUrl} alt="Dyna bomb" draggable={false} />
        </div>
      </div>

      <div className="bomb-hud">
        <div className="bomb-lives">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={`bomb-heart ${i < lives ? "alive" : "dead"}`}>❤️</span>
          ))}
        </div>
        <div className={`bomb-timer ${timeLeft <= 30 ? "timer-danger" : ""}`}>
          {timeStr}
        </div>
      </div>

      <div className="question-text bomb-question">{question.text}</div>

      <div className="bomb-wire-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`bomb-wire-btn ${feedback.type === "correct" && opt === question.answer ? "btn-correct" : ""} ${feedback.type === "wrong" && opt === question.answer ? "btn-wrong" : ""}`}
            style={{ "--wire-color": WIRE_COLORS[i], "--wire-name": WIRE_NAMES[i] } as Record<string, string>}
            onClick={() => handleAnswer(opt === question.answer, i)}
            disabled={feedback.type !== null}
          >
            <span className="wire-color-bar" style={{ backgroundColor: WIRE_COLORS[i] }}></span>
            <span className="wire-name">{WIRE_NAMES[i]}</span>
            <span className="wire-value">{opt}</span>
          </button>
        ))}
      </div>

      {feedback.type === "correct" && <div className="bomb-feedback feedback-correct">{feedback.text}</div>}
      {feedback.type === "wrong" && <div className="bomb-feedback feedback-wrong">{feedback.text}</div>}

      {exploded && (
        <div className="explosion-overlay">
          <div className="explosion">
            <div className="explosion-ring"></div>
            <div className="explosion-ring ring-2"></div>
            <div className="explosion-ring ring-3"></div>
            <div className="explosion-fire"></div>
            <div className="explosion-fire fire-2"></div>
          </div>
          <div className="explosion-text">BOOM! 💥</div>
        </div>
      )}
    </GameShell>
  );
}