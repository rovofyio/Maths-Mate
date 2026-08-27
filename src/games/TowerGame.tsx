import { useEffect, useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { QuestionCard } from "../components/Quiz";
import { buildReward, type ResultInput } from "./helpers";
import { getTopic, DIFFICULTIES, makeQuestion } from "../lib/questions";
import type { Difficulty, Question, TopicId } from "../types";

const WAVES = [
  { count: 5, hp: 1, speed: 52 },
  { count: 6, hp: 1, speed: 60 },
  { count: 7, hp: 2, speed: 66 },
  { count: 9, hp: 2, speed: 74 },
  { count: 11, hp: 3, speed: 84 },
];
const LANES = [26, 50, 74];
const TOWER_X = 62;

interface Enemy {
  el: HTMLElement;
  x: number;
  hp: number;
  speed: number;
}

export function TowerGame({ topicId, diffId, onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const towerRef = useRef<HTMLDivElement>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTime = useRef(0);
  const streakRef = useRef(0);
  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0 });
  const flagsRef = useRef({ over: false, running: true, hearts: 5, power: 1, wave: 1 });

  const [hearts, setHearts] = useState(5);
  const [power, setPower] = useState(1);
  const [wave, setWave] = useState(1);
  const [question, setQuestion] = useState<Question>(() => makeQuestion(topicId, diffId));
  const [streak, setStreak] = useState(0);

  const topic = getTopic(topicId);
  const flags = flagsRef.current;

  const finish = (won: boolean) => {
    if (flags.over) return;
    flags.over = true;
    flags.running = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (spawnTimer.current) clearTimeout(spawnTimer.current);
    const s = statsRef.current;
    const reward = buildReward({ won, correct: s.correct, diffId });
    onFinish({
      gameId: "tower",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: flags.wave,
      coins: reward.coins,
      xp: reward.xp,
      reachedWave: flags.wave,
    });
  };

  const killEnemy = (e: Enemy) => {
    e.el.remove();
    enemiesRef.current = enemiesRef.current.filter((x) => x !== e);
  };

  const towerHit = () => {
    flags.hearts -= 1;
    setHearts(flags.hearts);
    towerRef.current?.classList.add("flash");
    setTimeout(() => towerRef.current?.classList.remove("flash"), 300);
    if (flags.hearts <= 0) finish(false);
  };

  const boltTo = (target: Enemy) => {
    const field = fieldRef.current;
    const towerEl = towerRef.current;
    if (!field || !towerEl) return;
    const fRect = field.getBoundingClientRect();
    const tRect = towerEl.getBoundingClientRect();
    const eRect = target.el.getBoundingClientRect();
    const tx = tRect.left - fRect.left + tRect.width / 2;
    const ty = tRect.top - fRect.top + tRect.height / 2;
    const ex = eRect.left - fRect.left + eRect.width / 2;
    const ey = eRect.top - fRect.top + eRect.height / 2;
    const bolt = document.createElement("div");
    bolt.className = "bolt";
    bolt.style.left = `${tx}px`;
    bolt.style.top = `${ty}px`;
    field.appendChild(bolt);
    const dist = Math.hypot(ex - tx, ey - ty);
    const duration = Math.max(120, dist / 1.4);
    bolt.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    requestAnimationFrame(() => {
      bolt.style.left = `${ex}px`;
      bolt.style.top = `${ey}px`;
    });
    setTimeout(() => {
      bolt.remove();
      if (!target.el.isConnected) return;
      target.hp -= flags.power;
      const hpEl = target.el.querySelector(".enemy-hp");
      if (hpEl) hpEl.textContent = String(Math.max(0, target.hp));
      if (target.hp <= 0) killEnemy(target);
    }, duration);
  };

  const spawnEnemy = (hp: number, speed: number) => {
    const field = fieldRef.current;
    if (!field) return;
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const el = document.createElement("div");
    el.className = "enemy";
    el.innerHTML = `<span class="enemy-emoji">👾</span><span class="enemy-hp">${hp}</span>`;
    el.style.top = `${lane}%`;
    const enemy: Enemy = { el, x: field.clientWidth + 10, hp, speed };
    el.style.left = `${enemy.x}px`;
    field.appendChild(el);
    enemiesRef.current.push(enemy);
  };

  const spawnWave = (n: number) => {
    flags.wave = n;
    setWave(n);
    const cfg = WAVES[n - 1];
    let toSpawn = cfg.count;
    const interval = Math.max(800, 1800 - n * 150);
    const step = () => {
      if (!flags.running) return;
      spawnEnemy(cfg.hp, cfg.speed + Math.random() * 20);
      toSpawn--;
      if (toSpawn > 0) spawnTimer.current = setTimeout(step, interval);
      else spawnTimer.current = null;
    };
    spawnTimer.current = setTimeout(step, 800);
  };

  useEffect(() => {
    spawnWave(1);
    const loop = (time: number) => {
      if (!flags.running) return;
      const dt = lastTime.current ? Math.min(0.05, (time - lastTime.current) / 1000) : 0.016;
      lastTime.current = time;
      for (const e of [...enemiesRef.current]) {
        e.x -= e.speed * dt;
        e.el.style.left = `${e.x}px`;
        if (e.x <= TOWER_X) {
          killEnemy(e);
          towerHit();
          if (!flags.running) return;
        }
      }
      if (flags.wave > 0 && !spawnTimer.current && enemiesRef.current.length === 0) {
        if (flags.wave >= WAVES.length) {
          finish(true);
          return;
        }
        spawnWave(flags.wave + 1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      flags.running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
    };
  }, []);

  const handleAnswer = (correct: boolean) => {
    if (flags.over) return;
    const s = statsRef.current;
    s.total++;
    if (correct) {
      s.correct++;
      streakRef.current += 1;
      s.bestStreak = Math.max(s.bestStreak, streakRef.current);
      setStreak(streakRef.current);
      flags.power = Math.min(10, flags.power + 1);
      setPower(flags.power);
      const target = [...enemiesRef.current].filter((e) => e.el.isConnected).sort((a, b) => a.x - b.x)[0];
      if (target) boltTo(target);
    } else {
      streakRef.current = 0;
      setStreak(0);
      flags.power = Math.max(1, flags.power - 1);
      setPower(flags.power);
      towerHit();
    }
    setTimeout(() => {
      if (flags.over) return;
      setQuestion(makeQuestion(topicId, diffId));
    }, 700);
  };

  return (
    <GameShell
      emoji="🏰"
      name="Tower Defence"
      pills={[`${topic.emoji} ${topic.name}`, `${DIFFICULTIES[diffId].name}`]}
      onQuit={() => finish(false)}
    >
      <div className="tower-top">
        <div className="tower-hearts">{"❤️".repeat(hearts) + "🖤".repeat(5 - hearts)}</div>
        <div className="tower-power">⚡ Power {power}</div>
        <div className="tower-wave">🌊 {wave}/5</div>
      </div>
      <div className="tower-field" ref={fieldRef}>
        <div className="tower-base" ref={towerRef}>
          🏰
        </div>
      </div>
      <QuestionCard
        key={question.text + question.answer}
        question={question}
        streak={streak}
        onAnswer={(c) => handleAnswer(c)}
      />
    </GameShell>
  );
}