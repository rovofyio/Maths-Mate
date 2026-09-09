import { useState } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { GameConfig } from "./Quiz";
import { finishGame, type ResultInput } from "../games/helpers";
import { GameResult } from "./GameResult";
import { getGame } from "../games";
import type { ComponentChildren } from "preact";
import type { Difficulty, TopicId } from "../types";

// Each game is code-split so low-RAM devices only download/parse the game
// actually being played instead of all 9 games up front.
const RacingGame = lazy(() => import("../games/RacingGame").then((m) => ({ default: m.RacingGame })));
const TowerGame = lazy(() => import("../games/TowerGame").then((m) => ({ default: m.TowerGame })));
const BombDefusalGame = lazy(() => import("../games/BombDefusalGame").then((m) => ({ default: m.BombDefusalGame })));
const FastMathGame = lazy(() => import("../games/FastMathGame").then((m) => ({ default: m.FastMathGame })));
const MazeGame = lazy(() => import("../games/MazeGame").then((m) => ({ default: m.MazeGame })));
const PvpBattleGame = lazy(() => import("../games/PvpBattleGame").then((m) => ({ default: m.PvpBattleGame })));
const FractionsGame = lazy(() => import("../games/FractionsGame").then((m) => ({ default: m.FractionsGame })));
const RunnerGame = lazy(() => import("../games/RunnerGame").then((m) => ({ default: m.RunnerGame })));
const TrueFalseGame = lazy(() => import("../games/TrueFalseGame").then((m) => ({ default: m.TrueFalseGame })));

const COMPONENTS: Record<string, (props: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void; onExit?: () => void }) => ComponentChildren> = {
  racing: RacingGame,
  tower: TowerGame,
  bomb: BombDefusalGame,
  fastmath: FastMathGame,
  maze: MazeGame,

  pvp: PvpBattleGame,
  fractions: FractionsGame,
  runner: RunnerGame,
  truefalse: TrueFalseGame,
};

export function GameSession({ gameId, onExit }: { gameId: string; onExit: () => void }) {
  const meta = getGame(gameId);
  const [config, setConfig] = useState<{ topicId: TopicId; diffId: Difficulty } | null>(null);
  const [result, setResult] = useState<{ result: Awaited<ReturnType<typeof finishGame>>["result"]; newAchievements: string[] } | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const Game = COMPONENTS[gameId];

  // Maze and Monster PvP have their own level selection with built-in
  // topics, so skip the shared topic/difficulty picker for them.
  const SKIP_CONFIG = ["maze", "pvp"];

  if (!config && !SKIP_CONFIG.includes(gameId)) {
    return (
      <GameConfig
        gameName={meta.name}
        gameEmoji={meta.emoji}
        onExit={onExit}
        onStart={(topicId, diffId) => setConfig({ topicId, diffId })}
      />
    );
  }

  if (result) {
    return (
      <GameResult
        result={result.result}
        newAchievements={result.newAchievements}
        onReplay={() => {
          setResult(null);
          setReplayKey((k) => k + 1);
        }}
        onExit={onExit}
      />
    );
  }

  return (
    <Suspense fallback={<div className="page"><p className="muted">Loading game…</p></div>}>
      <Game
        key={`${gameId}-${replayKey}`}
        topicId={config?.topicId ?? "mixed"}
        diffId={config?.diffId ?? "easy"}
        onExit={onExit}
        onFinish={(input) => {
          const r = finishGame(input);
          setResult({ result: r.result, newAchievements: r.newAchievements });
        }}
      />
    </Suspense>
  );
}