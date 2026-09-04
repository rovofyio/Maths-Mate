import { useState } from "preact/hooks";
import { GameConfig } from "./Quiz";
import { finishGame, type ResultInput } from "../games/helpers";
import { GameResult } from "./GameResult";
import { getGame } from "../games";
import { RacingGame } from "../games/RacingGame";
import { TowerGame } from "../games/TowerGame";
import { BombDefusalGame } from "../games/BombDefusalGame";
import { FastMathGame } from "../games/FastMathGame";
import { MazeGame } from "../games/MazeGame";

import { PvpBattleGame } from "../games/PvpBattleGame";
import { FractionsGame } from "../games/FractionsGame";
import { RunnerGame } from "../games/RunnerGame";
import { TrueFalseGame } from "../games/TrueFalseGame";
import type { ComponentChildren } from "preact";
import type { Difficulty, TopicId } from "../types";

const COMPONENTS: Record<string, (props: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) => ComponentChildren> = {
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

  if (!config) {
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
    <Game
      key={`${gameId}-${replayKey}`}
      topicId={config.topicId}
      diffId={config.diffId}
      onFinish={(input) => {
        const r = finishGame(input);
        setResult({ result: r.result, newAchievements: r.newAchievements });
      }}
    />
  );
}