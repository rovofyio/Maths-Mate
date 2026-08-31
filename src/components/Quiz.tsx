import { useState } from "preact/hooks";
import type { CSSProperties } from "preact";
import { TOPICS, DIFFICULTIES } from "../lib/questions";
import type { Difficulty, Question, TopicId } from "../types";
import { speak } from "../lib/tts";

export function TopicChip({ active, onClick, topic }: { active: boolean; onClick: () => void; topic: (typeof TOPICS)[number] }) {
  return (
    <button className={`chip ${active ? "active" : ""}`} style={{ "--acc": topic.color } as CSSProperties} onClick={onClick}>
      {topic.emoji} {topic.name}
    </button>
  );
}

export function GameConfig({
  gameName,
  gameEmoji,
  onStart,
  onExit,
}: {
  gameName: string;
  gameEmoji: string;
  onStart: (topicId: TopicId, diffId: Difficulty) => void;
  onExit: () => void;
}) {
  const [topicId, setTopicId] = useState<TopicId>("addition");
  const [diffId, setDiffId] = useState<Difficulty>("easy");

  return (
    <div className="page">
      <button className="back-btn" onClick={onExit}>
        ← Back to games
      </button>
      <h1 className="page-title">
        {gameEmoji} {gameName}
      </h1>
      <p className="page-sub">Pick a maths topic and difficulty, then press start!</p>

      <div className="config-section">
        <h3>Choose a topic</h3>
        <div className="chip-row">
          {TOPICS.map((t) => (
            <TopicChip key={t.id} topic={t} active={t.id === topicId} onClick={() => setTopicId(t.id)} />
          ))}
        </div>
      </div>

      <div className="config-section">
        <h3>Choose difficulty</h3>
        <div className="chip-row">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
            <button key={d} className={`chip ${d === diffId ? "active diff" : ""}`} onClick={() => setDiffId(d)}>
              {DIFFICULTIES[d].emoji} {DIFFICULTIES[d].name}
            </button>
          ))}
        </div>
      </div>

      <div className="config-actions">
        <button className="btn-primary big" onClick={() => onStart(topicId, diffId)}>
          🚀 Start playing
        </button>
      </div>
    </div>
  );
}

export function QuestionCard({
  question,
  streak,
  onAnswer,
}: {
  question: Question;
  streak: number;
  onAnswer: (correct: boolean, chosen: number) => void;
}) {
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  const handle = (opt: number) => {
    if (answered !== null) return;
    const correct = opt === question.answer;
    setAnswered(correct);
    setChosen(opt);
    onAnswer(correct, opt);
  };

  return (
    <div className={`question-panel ${answered !== null ? "locked" : ""}`}>
      <div className="question-head">
        <span className="question-streak">{streak > 1 ? `🔥 ${streak}` : ""}</span>
        <button
          className="tts-btn"
          aria-label="Read question aloud"
          onClick={() => speak(question.text)}
        >
          🔊
        </button>
      </div>
      <div className="question-text">{question.text}</div>
      <div className="answer-grid">
        {question.options.map((o) => {
          let cls = "answer-btn";
          if (answered !== null) {
            if (o === question.answer) cls += " correct";
            else if (o === chosen) cls += " wrong";
          }
          return (
            <button key={o} className={cls} onClick={() => handle(o)}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}