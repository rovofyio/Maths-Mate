import { useState, useRef } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { QuestionCard } from "../components/Quiz";
import { buildReward, type ResultInput } from "./helpers";
import { makeQuestion } from "../lib/questions";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, Question, TopicId } from "../types";

type CellKind = "wall" | "path" | "dead" | "start" | "exit";

interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  topicId: TopicId;
  diffId: Difficulty;
  rows: number;
  cols: number;
  path: [number, number][];
  /** pathIdx → dead-end cell coordinate the player moves to on wrong answer */
  deadMap: Record<number, [number, number]>;
}

/**
 * 5 hand-crafted levels.
 * Each path is an ordered list of [row, col] coords from START to EXIT.
 * deadMap entries pair a path-step index with an adjacent dead-end cell.
 */
const LEVELS: LevelConfig[] = [
  // ─── Level 1 ─────────────────────────────────────────────────────────────
  // 4×4 grid  ·  path goes right along row-0 then down col-3
  // S  P  P  P
  // W  D  D  P
  // W  W  D  P
  // W  W  W  E
  {
    id: 1,
    title: "Forest Path",
    subtitle: "Addition · Easy",
    emoji: "🌲",
    topicId: "addition",
    diffId: "easy",
    rows: 4, cols: 4,
    path: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3]],
    deadMap: { 1: [1,1], 2: [1,2], 5: [2,2] },
  },

  // ─── Level 2 ─────────────────────────────────────────────────────────────
  // 5×5 grid  ·  down col-0, right along row-2, down col-4
  // S  D  W  W  W
  // P  D  D  D  D
  // P  P  P  P  P
  // D  D  W  D  P
  // W  W  W  W  E
  {
    id: 2,
    title: "River Crossing",
    subtitle: "Subtraction · Easy",
    emoji: "🌊",
    topicId: "subtraction",
    diffId: "easy",
    rows: 5, cols: 5,
    path: [[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[3,4],[4,4]],
    deadMap: { 0:[0,1], 1:[1,1], 2:[3,0], 3:[3,1], 4:[1,2], 5:[1,3], 6:[1,4], 7:[3,3] },
  },

  // ─── Level 3 ─────────────────────────────────────────────────────────────
  // 5×5 grid  ·  S-curve: right along row-0, down col-4, left along row-2
  // S  P  P  P  P
  // W  D  D  D  P
  // E  P  P  P  P
  // W  D  D  D  D
  // W  W  W  W  W
  {
    id: 3,
    title: "Mountain Pass",
    subtitle: "Multiplication · Medium",
    emoji: "⛰️",
    topicId: "multiplication",
    diffId: "medium",
    rows: 5, cols: 5,
    path: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[2,3],[2,2],[2,1],[2,0]],
    deadMap: { 1:[1,1], 2:[1,2], 3:[1,3], 6:[3,4], 7:[3,3], 8:[3,2], 9:[3,1] },
  },

  // ─── Level 4 ─────────────────────────────────────────────────────────────
  // 6×6 grid  ·  right along row-0, down col-2, right along row-3, down col-5
  // S  P  P  D  W  W
  // D  D  P  D  W  W
  // W  D  P  W  D  D
  // W  W  P  P  P  P
  // W  W  D  D  D  P
  // W  W  W  W  W  E
  {
    id: 4,
    title: "Ancient Ruins",
    subtitle: "Mixed · Medium",
    emoji: "🏛️",
    topicId: "mixed",
    diffId: "medium",
    rows: 6, cols: 6,
    path: [[0,0],[0,1],[0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[3,5],[4,5],[5,5]],
    deadMap: { 0:[1,0], 1:[1,1], 2:[0,3], 3:[1,3], 4:[2,1], 5:[4,2], 6:[4,3], 7:[2,4], 8:[2,5], 9:[4,4] },
  },

  // ─── Level 5 ─────────────────────────────────────────────────────────────
  // 6×6 grid  ·  U-shape: right along row-0, down col-5, left along row-5
  // S  P  P  P  P  P
  // D  D  D  D  D  P
  // W  W  W  W  D  P
  // W  W  W  W  D  P
  // W  W  W  W  D  P
  // W  W  W  E  P  P
  {
    id: 5,
    title: "Dragon's Lair",
    subtitle: "Mixed · Hard",
    emoji: "🐉",
    topicId: "mixed",
    diffId: "hard",
    rows: 6, cols: 6,
    path: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3]],
    deadMap: { 0:[1,0], 1:[1,1], 2:[1,2], 3:[1,3], 4:[1,4], 6:[1,4], 7:[2,4], 8:[3,4], 9:[4,4], 11:[4,4] },
  },
];

function buildGrid(level: LevelConfig): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: level.rows }, () =>
    Array.from({ length: level.cols }, (): CellKind => "wall")
  );
  level.path.forEach(([r, c], i) => {
    g[r][c] =
      i === 0 ? "start" :
      i === level.path.length - 1 ? "exit" :
      "path";
  });
  // Mark dead-end cells (may be referenced by multiple path steps)
  Object.values(level.deadMap).forEach(([r, c]) => {
    if (g[r][c] === "wall") g[r][c] = "dead";
  });
  return g;
}

const MAX_LIVES = 3;
const GRID_W = 316; // target grid pixel width
const CELL_GAP = 4;

// ────────────────────────────────────────────────────────────────────────────

export function MazeGame({
  topicId: _topicId,
  diffId: _diffId,
  onFinish,
}: {
  topicId: TopicId;
  diffId: Difficulty;
  onFinish: (i: ResultInput) => void;
}) {
  // Level-select state
  const [activeLevel, setActiveLevel] = useState<LevelConfig | null>(null);
  const doneLevelsRef = useRef(new Set<number>());

  // In-game render state
  const [step, setStep]         = useState(0);
  const [inBranch, setInBranch] = useState(false);
  const [branchCell, setBranchCell] = useState<[number, number] | null>(null);
  const [lives, setLives]       = useState(MAX_LIVES);
  const [gamePhase, setGamePhase] = useState<"playing" | "complete" | "failed">("playing");
  const [question, setQuestion]  = useState<Question | null>(null);
  const [streak, setStreak]      = useState(0);
  const [flash, setFlash]        = useState<"correct" | "wrong" | null>(null);
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());

  // Mutable game-state refs (stable across async timeouts)
  const gRef = useRef({
    step: 0, inBranch: false,
    branchCell: null as [number, number] | null,
    lives: MAX_LIVES, correct: 0, total: 0,
    bestStreak: 0, streak: 0, over: false,
  });
  // Accumulated totals across all levels
  const totalRef = useRef({ correct: 0, total: 0, bestStreak: 0 });

  // ── Start a level ─────────────────────────────────────────────────────────
  function startLevel(level: LevelConfig) {
    const g = gRef.current;
    Object.assign(g, {
      step: 0, inBranch: false, branchCell: null,
      lives: MAX_LIVES, correct: 0, total: 0,
      bestStreak: 0, streak: 0, over: false,
    });
    const [sr, sc] = level.path[0];
    setActiveLevel(level);
    setStep(0);
    setInBranch(false);
    setBranchCell(null);
    setLives(MAX_LIVES);
    setGamePhase("playing");
    setStreak(0);
    setFlash(null);
    setVisitedSet(new Set([`${sr},${sc}`]));
    setQuestion(makeQuestion(level.topicId, level.diffId));
  }

  // ── Answer handler ────────────────────────────────────────────────────────
  function handleAnswer(correct: boolean) {
    const level = activeLevel;
    if (!level || gRef.current.over || flash !== null) return;
    const g = gRef.current;
    g.total++;
    totalRef.current.total++;
    recordAnswer(level.topicId, correct);
    evaluateAfterAnswer(correct);

    if (correct) {
      g.correct++;
      g.streak++;
      g.bestStreak = Math.max(g.bestStreak, g.streak);
      totalRef.current.correct++;
      totalRef.current.bestStreak = Math.max(totalRef.current.bestStreak, g.streak);
      setStreak(g.streak);
      setFlash("correct");

      setTimeout(() => {
        setFlash(null);
        if (g.inBranch) {
          // Return from dead-end to the junction
          g.inBranch = false; g.branchCell = null;
          setInBranch(false); setBranchCell(null);
          setQuestion(makeQuestion(level.topicId, level.diffId));
        } else {
          // Advance along correct path
          const nxt = g.step + 1;
          g.step = nxt;
          const [nr, nc] = level.path[nxt];
          setStep(nxt);
          setVisitedSet(prev => { const s = new Set(prev); s.add(`${nr},${nc}`); return s; });
          if (nxt >= level.path.length - 1) {
            g.over = true;
            setGamePhase("complete");
          } else {
            setQuestion(makeQuestion(level.topicId, level.diffId));
          }
        }
      }, 520);

    } else {
      g.streak = 0;
      g.lives--;
      setStreak(0);
      setLives(g.lives);
      setFlash("wrong");

      setTimeout(() => {
        setFlash(null);
        if (g.lives <= 0) {
          g.over = true;
          setGamePhase("failed");
          return;
        }
        // Move to dead-end branch (if one is defined for this step)
        if (!g.inBranch) {
          const dc = level.deadMap[g.step] as [number, number] | undefined;
          if (dc) {
            g.inBranch = true; g.branchCell = dc;
            setInBranch(true); setBranchCell(dc);
            setVisitedSet(prev => { const s = new Set(prev); s.add(`${dc[0]},${dc[1]}`); return s; });
          }
        }
        setQuestion(makeQuestion(level.topicId, level.diffId));
      }, 620);
    }
  }

  // ── Level complete ────────────────────────────────────────────────────────
  function handleLevelDone() {
    doneLevelsRef.current.add(activeLevel!.id);
    if (doneLevelsRef.current.size >= LEVELS.length) {
      const t = totalRef.current;
      const reward = buildReward({ won: true, correct: t.correct, diffId: "hard" });
      onFinish({
        gameId: "maze", won: true, correct: t.correct,
        total: t.total, bestStreak: t.bestStreak,
        score: t.correct, coins: reward.coins, xp: reward.xp,
      });
    } else {
      setActiveLevel(null);
    }
  }

  // ── Quit / forfeit ────────────────────────────────────────────────────────
  function handleQuit() {
    const t = totalRef.current;
    const won = doneLevelsRef.current.size > 0;
    const reward = buildReward({ won, correct: t.correct, diffId: "easy" });
    onFinish({
      gameId: "maze", won, correct: t.correct,
      total: t.total, bestStreak: t.bestStreak,
      score: doneLevelsRef.current.size, coins: reward.coins, xp: reward.xp,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LEVEL SELECT
  // ════════════════════════════════════════════════════════════════════════
  if (!activeLevel) {
    const doneCount = doneLevelsRef.current.size;
    return (
      <GameShell emoji="🧩" name="Maths Maze" onQuit={handleQuit}>
        <div className="maze-select">
          <p className="maze-select-sub">
            {doneCount >= LEVELS.length
              ? "🎉 All 5 levels cleared! You're a Maths Maze master!"
              : `Navigate each maze by answering questions correctly. Wrong answers send you down a dead end! (${doneCount}/5 done)`}
          </p>
          <div className="maze-level-grid">
            {LEVELS.map(lv => {
              const isDone = doneLevelsRef.current.has(lv.id);
              return (
                <button
                  key={lv.id}
                  id={`maze-level-${lv.id}`}
                  className={`maze-level-card${isDone ? " done" : ""}`}
                  onClick={() => startLevel(lv)}
                >
                  <span className="mlc-emoji">{isDone ? "✅" : lv.emoji}</span>
                  <span className="mlc-name">{lv.title}</span>
                  <span className="mlc-sub">{lv.subtitle}</span>
                  <span className={`mlc-badge${isDone ? " done" : ""}`}>
                    {isDone ? "Completed!" : `Level ${lv.id}`}
                  </span>
                </button>
              );
            })}
          </div>
          {doneCount >= LEVELS.length && (
            <button className="btn-primary big" onClick={handleQuit}>
              🏆 Claim Reward!
            </button>
          )}
        </div>
      </GameShell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LEVEL COMPLETE
  // ════════════════════════════════════════════════════════════════════════
  if (gamePhase === "complete") {
    const allNowDone = doneLevelsRef.current.size + 1 >= LEVELS.length;
    const g = gRef.current;
    return (
      <GameShell emoji="🧩" name="Maths Maze" onQuit={handleQuit}>
        <div className="maze-result">
          <div className="maze-res-emoji">🎉</div>
          <h2 className="maze-res-title">{activeLevel.title} Complete!</h2>
          <p className="maze-res-sub">
            {g.correct} correct out of {g.total} questions
          </p>
          <div className="maze-res-lives">
            {Array.from({ length: MAX_LIVES }, (_, i) => i < lives ? "❤️" : "🖤").join("")}
            &nbsp;lives remaining
          </div>
          <button id="maze-next-btn" className="btn-primary big" onClick={handleLevelDone}>
            {allNowDone ? "🏆 Finish & Claim Reward!" : "Next Level →"}
          </button>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => setActiveLevel(null)}>
            ← Back to Levels
          </button>
        </div>
      </GameShell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LEVEL FAILED
  // ════════════════════════════════════════════════════════════════════════
  if (gamePhase === "failed") {
    return (
      <GameShell emoji="🧩" name="Maths Maze" onQuit={handleQuit}>
        <div className="maze-result">
          <div className="maze-res-emoji">😵</div>
          <h2 className="maze-res-title">No Lives Left!</h2>
          <p className="maze-res-sub">You got lost in the maze — don't give up!</p>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setActiveLevel(null)}>
              ← Levels
            </button>
            <button id="maze-retry-btn" className="btn-primary" style={{ flex: 1 }} onClick={() => startLevel(activeLevel)}>
              🔄 Retry
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PLAYING
  // ════════════════════════════════════════════════════════════════════════
  const grid = buildGrid(activeLevel);
  const playerPos: [number, number] =
    inBranch && branchCell ? branchCell : activeLevel.path[step];
  const cellSize = Math.max(40, Math.min(70,
    Math.floor((GRID_W - CELL_GAP * (activeLevel.cols - 1)) / activeLevel.cols)
  ));
  const totalMoves = activeLevel.path.length - 1;

  let hintText: string;
  if (flash === "correct") {
    hintText = inBranch ? "✅ Finding the way back…" : "✅ Moving forward!";
  } else if (flash === "wrong") {
    hintText = inBranch ? "❌ Still lost! Answer to escape." : "❌ Wrong path! Find your way back.";
  } else if (inBranch) {
    hintText = "⚠️ Dead end! Solve correctly to return to the maze.";
  } else {
    hintText = "Answer correctly to move through the maze!";
  }

  return (
    <GameShell
      emoji="🧩"
      name="Maths Maze"
      pills={[`${activeLevel.emoji} ${activeLevel.title}`, activeLevel.subtitle]}
      onQuit={handleQuit}
    >
      <div className="maze-play">

        {/* ── HUD ── */}
        <div className="maze-hud">
          <div className="maze-lives-row">
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span key={i} className="maze-heart">{i < lives ? "❤️" : "🖤"}</span>
            ))}
          </div>
          <div className="maze-step-badge">
            {inBranch ? "⚠️ Off track" : `Step ${step + 1} / ${totalMoves + 1}`}
          </div>
          {streak > 1 && (
            <div className="maze-streak-badge">🔥 ×{streak}</div>
          )}
        </div>

        {/* ── Maze Grid ── */}
        <div
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${activeLevel.cols}, ${cellSize}px)`,
            gap: `${CELL_GAP}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((kind, c) => {
              const isPlayer  = playerPos[0] === r && playerPos[1] === c;
              const wasVisited = visitedSet.has(`${r},${c}`);
              let cls = `maze-cell ${kind}`;
              if (isPlayer) {
                cls += " player";
                if (flash) cls += ` flash-${flash}`;
              } else if (wasVisited && kind !== "start" && kind !== "exit") {
                cls += " visited";
              }
              const emojiSz = Math.floor(cellSize * 0.46);
              return (
                <div
                  key={`${r}-${c}`}
                  className={cls}
                  style={{ width: cellSize, height: cellSize, fontSize: emojiSz }}
                >
                  {isPlayer     ? "🧙" :
                   kind === "exit"  ? "🚪" :
                   kind === "start" ? "🌟" : ""}
                </div>
              );
            })
          )}
        </div>

        {/* ── Hint bar ── */}
        <div className={`maze-hint-bar${inBranch ? " wrong-branch" : ""}${flash === "correct" ? " correct-branch" : ""}`}>
          {hintText}
        </div>

        {/* ── Question / Flash feedback ── */}
        {flash ? (
          <div className={`maze-flash-msg ${flash}`}>
            {flash === "correct" ? "✅ Correct!" : "❌ Wrong!"}
          </div>
        ) : question ? (
          <QuestionCard
            key={`${question.text}-${question.answer}-${step}-${String(inBranch)}`}
            question={question}
            streak={streak}
            onAnswer={handleAnswer}
          />
        ) : null}

      </div>
    </GameShell>
  );
}
