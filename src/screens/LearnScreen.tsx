import { useState, useMemo } from "preact/hooks";
import { CHAPTERS, totalLessons, getChapter, getLesson } from "../data/chapters";
import { state, completeLesson, addXp } from "../lib/store";
import { evaluateAfterGame } from "../lib/achievements";
import { showToast } from "../lib/toast";
import type { CSSProperties } from "preact";
import { getFlashcardsForLesson, getQuizForLesson, type QuizQ } from "../lib/lessonQuiz";

type View =
  | { kind: "home" }
  | { kind: "chapter"; chapterId: string }
  | { kind: "lesson"; chapterId: string; lessonId: string };

type LessonPhase = "overview" | "flashcards" | "quiz" | "done";

/* ── Flashcards ── */
function FlashcardDeck({ lessonId, chapterId, onDone }: { lessonId: string; chapterId: string; onDone: () => void }) {
  const lesson = getLesson(chapterId, lessonId)!;
  const cards = useMemo(() => getFlashcardsForLesson(lesson), [lessonId]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const total = cards.length;
  const cur = cards[idx];
  const progress = ((idx + 1) / total) * 100;
  const allSeen = known.size === total;

  const next = () => {
    if (idx < total - 1) { setIdx(i => i + 1); setFlipped(false); }
  };
  const prev = () => {
    if (idx > 0) { setIdx(i => i - 1); setFlipped(false); }
  };

  return (
    <div className="fc-wrap">
      <div className="fc-top">
        <div className="fc-progress">
          <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="fc-counter">{idx + 1} / {total}</span>
      </div>

      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)} role="button" aria-label="Flip card">
        <div className="flashcard-inner">
          <div className="flashcard-face front">
            <span className="fc-hint">{cur.frontHint}</span>
            <div className="fc-front-text">{cur.front}</div>
            <span className="fc-tap">Tap to flip ↻</span>
          </div>
          <div className="flashcard-face back">
            <div className="fc-back-text">{cur.back}</div>
            {cur.backHint && <span className="fc-back-hint">{cur.backHint}</span>}
            <span className="fc-tap">Tap to flip ↻</span>
          </div>
        </div>
      </div>

      <div className="fc-actions">
        <button className="btn-ghost" onClick={prev} disabled={idx === 0}>← Prev</button>
        <button
          className={`fc-know ${known.has(idx) ? "known" : ""}`}
          onClick={() => {
            const n = new Set(known);
            if (n.has(idx)) n.delete(idx); else n.add(idx);
            setKnown(n);
          }}
        >
          {known.has(idx) ? "★ Known" : "☆ Mark known"}
        </button>
        <button className="btn-ghost" onClick={next} disabled={idx === total - 1}>Next →</button>
      </div>

      <div className="fc-dots">
        {cards.map((_, i) => (
          <button key={i} className={`fc-dot ${i === idx ? "active" : ""} ${known.has(i) ? "known" : ""}`} onClick={() => { setIdx(i); setFlipped(false); }} aria-label={`Go to card ${i + 1}`} />
        ))}
      </div>

      <div className="fc-foot">
        <span className="muted small">{known.size}/{total} marked known • Quizlet style — tap card to flip</span>
        <button className="btn-primary big" disabled={!flipped && known.size < total && idx !== total - 1} onClick={onDone}>
          {allSeen || idx === total - 1 ? "Start Duolingo Quiz →" : "Continue flashcards"}
        </button>
        {!allSeen && <span className="muted small">Tip: flip each card and mark known to unlock quiz faster</span>}
      </div>
    </div>
  );
}

/* ── Duolingo quiz ── */
function DuolingoQuiz({ lessonId, chapterId, onFinish }: { lessonId: string; chapterId: string; onFinish: (correct: number, total: number) => void }) {
  const lesson = getLesson(chapterId, lessonId)!;
  const questions = useMemo(() => getQuizForLesson(lesson, 5), [lessonId]);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const total = questions.length;
  const q: QuizQ = questions[i];
  const progress = ((i) / total) * 100;
  const isCorrect = selected === q.answer;

  const check = () => {
    if (!selected) return;
    setChecked(true);
    if (isCorrect) { setCorrect(c => c + 1); setStreak(s => s + 1); }
    else { setHearts(h => Math.max(0, h - 1)); setStreak(0); }
  };

  // fix onFinish counting: use ref effect
  const handleNext = () => {
    if (checked) {
      if (i + 1 >= total) {
        const finalCorrect = correct; // correct already includes current if isCorrect (set in check)
        onFinish(finalCorrect, total);
      } else {
        setI(v => v + 1);
        setSelected(null);
        setChecked(false);
      }
    } else {
      check();
    }
  };

  if (hearts === 0) {
    return (
      <div className="duo-wrap">
        <div className="duo-hearts">💔 No hearts left</div>
        <div className="duo-result">
          <div className="duo-res-emoji">😢</div>
          <h3>Out of hearts!</h3>
          <p className="muted">You need 3 correct to pass. Try the flashcards again.</p>
          <button className="btn-primary big" onClick={() => onFinish(correct, total)}>See result</button>
        </div>
      </div>
    );
  }

  return (
    <div className="duo-wrap">
      <div className="duo-top">
        <button className="duo-close" onClick={() => onFinish(correct, total)}>✕</button>
        <div className="duo-progress"><div className="duo-progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="duo-hearts" aria-label="Hearts">{Array.from({ length: 3 }, (_, idx) => <span key={idx} className={idx < hearts ? "heart alive" : "heart dead"}>{idx < hearts ? "❤️" : "🖤"}</span>)}</div>
      </div>

      <div className="duo-question">
        <div className="duo-character">🦉</div>
        <div className="duo-bubble">
          <div className="duo-prompt">{q.prompt}</div>
          {q.explanation && checked && <div className="duo-explain">{q.explanation}</div>}
        </div>
      </div>

      <div className="duo-options">
        {q.options.map(opt => {
          let cls = "duo-opt";
          if (checked) {
            if (opt === q.answer) cls += " correct";
            else if (opt === selected) cls += " wrong";
          } else if (opt === selected) cls += " selected";
          return (
            <button key={opt} className={cls} disabled={checked} onClick={() => setSelected(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {checked && (
        <div className={`duo-feedback ${isCorrect ? "ok" : "bad"}`}>
          <span className="duo-feedback-icon">{isCorrect ? "✅" : "❌"}</span>
          <div>
            <div className="duo-feedback-title">{isCorrect ? "Nice job!" : `Answer: ${q.answer}`}</div>
            <div className="duo-feedback-sub">{isCorrect ? `Streak ×${streak + (isCorrect ? 1 : 0)}` : "Keep going — you’ll get the next one"}</div>
          </div>
        </div>
      )}

      <button className={`btn-primary big duo-continue ${checked ? (isCorrect ? "ok" : "bad") : ""}`} disabled={!selected} onClick={handleNext}>
        {checked ? (i + 1 >= total ? "Finish →" : "Continue →") : "Check"}
      </button>

      <div className="duo-foot muted small">{i + 1} / {total} • Duolingo style — earn hearts by getting correct</div>
    </div>
  );
}

export function LearnScreen() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [phase, setPhase] = useState<LessonPhase>("overview");
  const s = state.value;

  if (view.kind === "lesson") {
    const chapter = getChapter(view.chapterId);
    const lesson = getLesson(view.chapterId, view.lessonId);
    if (!chapter || !lesson) {
      setView({ kind: "home" });
      return null;
    }
    const done = s.lessonsCompleted.includes(lesson.id);
    const flashcards = getFlashcardsForLesson(lesson);

    // phases inside lesson
    if (phase === "flashcards") {
      return (
        <div className="page">
          <button className="back-btn" onClick={() => setPhase("overview")}>← Back to lesson</button>
          <h1 className="page-title">🃏 Flashcards — {lesson.title}</h1>
          <p className="page-sub">Quizlet style: tap to flip, mark known, swipe through {flashcards.length} cards.</p>
          <FlashcardDeck lessonId={lesson.id} chapterId={chapter.id} onDone={() => setPhase("quiz")} />
        </div>
      );
    }
    if (phase === "quiz") {
      return (
        <div className="page">
          <h1 className="page-title">✏️ Quiz — {lesson.title}</h1>
          <DuolingoQuiz
            lessonId={lesson.id}
            chapterId={chapter.id}
            onFinish={(correct, total) => {
              const passed = correct >= 3;
              if (passed && !done) {
                completeLesson(lesson.id);
                addXp(40);
                evaluateAfterGame({ gameId: "lesson", won: true, correct, total, bestStreak: 0, score: 0, coins: 0, xp: 40 });
                showToast(`🎉 Quiz passed ${correct}/${total}! +40 XP`);
              } else if (passed) {
                showToast(`✅ ${correct}/${total} — already completed`);
              } else {
                showToast(`📚 ${correct}/${total} — need 3/5 to pass, try again`);
              }
              setPhase(passed ? "done" : "overview");
            }}
          />
        </div>
      );
    }
    if (phase === "done") {
      return (
        <div className="page">
          <div className="lesson-done-card">
            <div className="lesson-done-emoji">🏆</div>
            <h2>Lesson complete!</h2>
            <p className="muted">{lesson.title} — {chapter.title}</p>
            <div className="lesson-done-actions">
              <button className="btn-primary big" onClick={() => { setPhase("overview"); setView({ kind: "chapter", chapterId: chapter.id }); }}>Continue →</button>
              <button className="btn-ghost" style={{ width: "100%" }} onClick={() => setPhase("overview")}>Review again</button>
            </div>
          </div>
        </div>
      );
    }

    // overview
    return (
      <div className="page">
        <button className="back-btn" onClick={() => setView({ kind: "chapter", chapterId: chapter.id })}>← Back to {chapter.title}</button>
        <h1 className="page-title">{lesson.title}</h1>
        <div className="lesson-overview">
          <div className="lesson-box">
            <h3>💡 Key points</h3>
            <ul className="keypoints">
              {lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
          <div className="lesson-box">
            <h3>✏️ Worked examples</h3>
            {lesson.examples.map((e, i) => (
              <div key={i} className="example">
                <div className="example-q">{e.q}</div>
                <ol className="example-steps">{e.s.map((st, j) => <li key={j}>{st}</li>)}</ol>
                <div className="example-a">Answer: <strong>{e.a}</strong></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lesson-start-card">
          <h3>🎯 Interactive lesson</h3>
          <p className="muted">Study {flashcards.length} Quizlet-style flashcards, then pass the 5-question Duolingo quiz (need 3/5). Works for all topics!</p>
          <div className="lesson-start-stats">
            <span className="lss">🃏 {flashcards.length} flashcards</span>
            <span className="lss">✏️ 5 quiz questions</span>
            <span className="lss">❤️ 3 hearts</span>
          </div>
          {done && <div className="lesson-done-badge">✅ Completed — revising gives extra practice</div>}
          <button className="btn-primary big" onClick={() => setPhase("flashcards")}>
            {done ? "🔁 Review flashcards" : "Start flashcards →"}
          </button>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => setPhase("quiz")}>Skip to quiz →</button>
        </div>

        {done ? (
          <div className="btn-primary btn-done" style={{ textAlign: "center", padding: "12px" }}>✅ Completed — great job!</div>
        ) : (
          <button
            className="btn-ghost"
            style={{ width: "100%" }}
            onClick={() => {
              completeLesson(lesson.id);
              addXp(20);
              showToast("Marked complete (without quiz) +20 XP");
            }}
          >
            Mark as complete without quiz · +20 XP
          </button>
        )}
      </div>
    );
  }

  if (view.kind === "chapter") {
    const chapter = getChapter(view.chapterId);
    if (!chapter) { setView({ kind: "home" }); return null; }
    return (
      <div className="page">
        <button className="back-btn" onClick={() => setView({ kind: "home" })}>← All chapters</button>
        <h1 className="page-title">{chapter.emoji} {chapter.title}</h1>
        <p className="page-sub">{chapter.blurb}</p>
        <div className="lesson-list">
          {chapter.lessons.map(l => {
            const done = s.lessonsCompleted.includes(l.id);
            return (
              <button key={l.id} className={`lesson-card ${done ? "done" : ""}`} onClick={() => { setView({ kind: "lesson", chapterId: chapter.id, lessonId: l.id }); setPhase("overview"); }}>
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
      <p className="page-sub">Pick a chapter and work through the lessons. {s.lessonsCompleted.length}/{totalLessons()} completed.</p>
      <div className="chapter-grid">
        {CHAPTERS.map(c => {
          const done = c.lessons.filter(l => s.lessonsCompleted.includes(l.id)).length;
          const total = c.lessons.length;
          return (
            <button key={c.id} className="chapter-card" style={{ "--acc": c.color } as CSSProperties} onClick={() => setView({ kind: "chapter", chapterId: c.id })}>
              <div className="chapter-emoji">{c.emoji}</div>
              <div className="chapter-body">
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(done / total) * 100}%` }} /></div>
                <span className="chapter-meta">{done}/{total} lessons</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
