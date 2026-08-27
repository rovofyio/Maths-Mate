import { useRef, useState } from "preact/hooks";
import { makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, Question, TopicId } from "../types";

export interface QuizStats {
  correct: number;
  total: number;
  bestStreak: number;
}

export function useQuiz(topicId: TopicId, diffId: Difficulty) {
  const [question, setQuestion] = useState<Question>(() => makeQuestion(topicId, diffId));
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const overRef = useRef(false);

  const answer = (isCorrect: boolean): void => {
    if (overRef.current) return;
    recordAnswer(question.topicId, isCorrect);
    evaluateAfterAnswer(isCorrect);
    setTotal((t) => t + 1);
    if (isCorrect) {
      streakRef.current += 1;
      bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
      setStreak(streakRef.current);
      setCorrect((c) => c + 1);
    } else {
      streakRef.current = 0;
      setStreak(0);
    }
  };

  const next = (delay = 650): void => {
    setTimeout(() => {
      if (overRef.current) return;
      setQuestion(makeQuestion(topicId, diffId));
    }, delay);
  };

  const setOver = () => {
    overRef.current = true;
  };

  return {
    question,
    streak,
    total,
    correct,
    stats: { correct, total, bestStreak: bestStreakRef.current },
    answer,
    next,
    setOver,
  };
}