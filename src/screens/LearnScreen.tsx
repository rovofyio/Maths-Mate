import { useState } from "preact/hooks";
import { CHAPTERS, totalLessons, getChapter, getLesson } from "../data/chapters";
import { state, completeLesson, addXp } from "../lib/store";
import { evaluateAfterGame } from "../lib/achievements";
import { showToast } from "../lib/toast";
import type { CSSProperties } from "preact";

type View =
  | { kind: "home" }
  | { kind: "chapter"; chapterId: string }
  | { kind: "lesson"; chapterId: string; lessonId: string };

export function LearnScreen() {
  const [view, setView] = useState<View>({ kind: "home" });
  const s = state.value;

  if (view.kind === "lesson") {
    const chapter = getChapter(view.chapterId);
    const lesson = getLesson(view.chapterId, view.lessonId);
    if (!chapter || !lesson) {
      setView({ kind: "home" });
      return null;
    }
    const done = s.lessonsCompleted.includes(lesson.id);
    return (
      <div className="page">
        <button className="back-btn" onClick={() => setView({ kind: "chapter", chapterId: chapter.id })}>
          ← Back to {chapter.title}
        </button>
        <h1 className="page-title">{lesson.title}</h1>
        <div className="lesson-box">
          <h3>💡 Key points</h3>
          <ul className="keypoints">
            {lesson.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
        <div className="lesson-box">
          <h3>✏️ Worked examples</h3>
          {lesson.examples.map((e, i) => (
            <div key={i} className="example">
              <div className="example-q">{e.q}</div>
              <ol className="example-steps">
                {e.s.map((st, j) => (
                  <li key={j}>{st}</li>
                ))}
              </ol>
              <div className="example-a">
                Answer: <strong>{e.a}</strong>
              </div>
            </div>
          ))}
        </div>
        <button
          className={`btn-primary ${done ? "btn-done" : ""}`}
          onClick={() => {
            if (done) return;
            completeLesson(lesson.id);
            addXp(40);
            evaluateAfterGame({ gameId: "lesson", won: true, correct: 1, total: 1, bestStreak: 0, score: 0, coins: 0, xp: 40 });
            showToast("🎉 Lesson complete! +40 XP");
          }}
        >
          {done ? "✅ Completed — great job!" : "Mark as complete · +40 XP"}
        </button>
      </div>
    );
  }

  if (view.kind === "chapter") {
    const chapter = getChapter(view.chapterId);
    if (!chapter) {
      setView({ kind: "home" });
      return null;
    }
    return (
      <div className="page">
        <button className="back-btn" onClick={() => setView({ kind: "home" })}>
          ← All chapters
        </button>
        <h1 className="page-title">
          {chapter.emoji} {chapter.title}
        </h1>
        <p className="page-sub">{chapter.blurb}</p>
        <div className="lesson-list">
          {chapter.lessons.map((l) => {
            const done = s.lessonsCompleted.includes(l.id);
            return (
              <button key={l.id} className={`lesson-card ${done ? "done" : ""}`} onClick={() => setView({ kind: "lesson", chapterId: chapter.id, lessonId: l.id })}>
                <span className="lesson-check">{done ? "✅" : "📖"}</span>
                <span className="lesson-title">{l.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">📚 Learn Maths</h1>
      <p className="page-sub">
        Pick a chapter and work through the lessons. {s.lessonsCompleted.length}/{totalLessons()} completed.
      </p>
      <div className="chapter-grid">
        {CHAPTERS.map((c) => {
          const done = c.lessons.filter((l) => s.lessonsCompleted.includes(l.id)).length;
          const total = c.lessons.length;
          return (
            <button key={c.id} className="chapter-card" style={{ "--acc": c.color } as CSSProperties} onClick={() => setView({ kind: "chapter", chapterId: c.id })}>
              <div className="chapter-emoji">{c.emoji}</div>
              <div className="chapter-body">
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className="chapter-meta">
                  {done}/{total} lessons
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}