import { describe, expect, it } from "vitest";
import { CHAPTERS } from "../data/chapters";
import { getFlashcardsForLesson, getQuizForLesson } from "./lessonQuiz";
import { DIFFICULTIES, TOPICS, makeQuestion } from "./questions";

// Regression test for the "quiz button hangs / stops responding" crash.
// Root cause: getQuizForLesson required every generated prompt to be unique,
// but several lessons only have 1-3 distinct prompts (e.g. stats-graphs,
// stats-probability), so the `while (qs.length < count)` loop never
// terminated and blocked the UI thread. Each test below has a timeout so a
// hang fails fast instead of freezing the suite.
describe("lesson quizzes open without hanging", () => {
  for (const chapter of CHAPTERS) {
    for (const lesson of chapter.lessons) {
      it(
        `${chapter.id}/${lesson.id} returns 5 valid questions`,
        () => {
          const qs = getQuizForLesson(lesson, 5);
          expect(qs).toHaveLength(5);
          for (const q of qs) {
            expect(q.prompt.length).toBeGreaterThan(0);
            expect(q.answer.length).toBeGreaterThan(0);
            expect(q.options).toContain(q.answer);
            expect(new Set(q.options).size).toBe(q.options.length);
          }
        },
        5000,
      );

      it(
        `${chapter.id}/${lesson.id} has flashcards`,
        () => {
          const cards = getFlashcardsForLesson(lesson);
          expect(cards.length).toBeGreaterThan(0);
        },
        5000,
      );
    }
  }

  it("unknown lesson id falls back instead of hanging", () => {
    const qs = getQuizForLesson(
      { id: "no-such-lesson", title: "Missing", keyPoints: ["x"], examples: [] } as never,
      5,
    );
    expect(qs).toHaveLength(5);
  }, 5000);
});

describe("arcade question generator", () => {
  for (const topic of TOPICS) {
    for (const diff of Object.keys(DIFFICULTIES)) {
      it(`${topic.id}/${diff} makes a valid question`, () => {
        const q = makeQuestion(topic.id, diff as never);
        expect(q.text.length).toBeGreaterThan(0);
        expect(Number.isFinite(q.answer)).toBe(true);
        expect(q.options).toContain(q.answer);
      });
    }
  }
});
