import { useRef, useState } from "preact/hooks";
import { GameShell } from "../components/GameShell";
import { buildReward, type ResultInput } from "./helpers";
import { recordAnswer } from "../lib/store";
import { evaluateAfterAnswer } from "../lib/achievements";
import type { Difficulty, TopicId } from "../types";

/* ── helpers ── */
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const rf = (min: number, max: number, dp = 1) => {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(dp));
};
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n)) return String(n);
  // keep up to 2dp, trim trailing zeros
  return parseFloat(n.toFixed(2)).toString();
};

/* ── question generator ── */
type PvpQ = { text: string; answer: number; options: number[]; topic: string };

function distractors(answer: number): number[] {
  if (!Number.isFinite(answer)) return shuffle([answer, 0, 1, 2]);
  const isInt = Number.isInteger(answer);
  const set = new Set<number>([answer]);
  const spread = Math.max(isInt ? 3 : 1.2, Math.abs(answer * 0.22) + (isInt ? 2 : 0.8));
  let guard = 0;
  while (set.size < 3 && guard < 200) {
    guard++;
    let cand: number;
    if (isInt) cand = answer + ri(-Math.round(spread), Math.round(spread));
    else cand = parseFloat((answer + (Math.random() - 0.5) * spread * 2).toFixed(2));
    if (cand !== answer && Number.isFinite(cand)) set.add(cand);
  }
  let extra = isInt ? Math.max(2, Math.abs(answer) + 3) : parseFloat((answer + 1.37).toFixed(2));
  while (set.size < 3) { set.add(extra); extra += isInt ? 2 : 1.11; }
  return shuffle([...set]);
}

/* ── topic generators ── */

function genFractions(): PvpQ {
  const kind = ri(0, 3);
  if (kind === 0) {
    // add fractions same denominator
    const d = pick([2, 3, 4, 6, 8, 10]);
    const a = ri(1, d - 1), b = ri(1, d - 1);
    const ans = (a + b) / d;
    return { text: `${a}/${d} + ${b}/${d} = ?`, answer: parseFloat(ans.toFixed(3)), options: [], topic: "fractions" };
  }
  if (kind === 1) {
    // add different denominators
    const d1 = pick([2, 3, 4, 5, 6, 8]), d2 = pick([2, 3, 4, 6, 8]);
    const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
    const ans = n1 / d1 + n2 / d2;
    return { text: `${n1}/${d1} + ${n2}/${d2} = ?`, answer: parseFloat(ans.toFixed(3)), options: [], topic: "fractions" };
  }
  if (kind === 2) {
    // multiply fractions
    const n1 = ri(1, 5), d1 = ri(2, 8), n2 = ri(1, 5), d2 = ri(2, 8);
    const ans = (n1 * n2) / (d1 * d2);
    // show as decimal; answer decimal
    return { text: `${n1}/${d1} × ${n2}/${d2} = ?`, answer: parseFloat(ans.toFixed(3)), options: [], topic: "fractions" };
  }
  // simplify
  const denom = pick([6, 8, 9, 10, 12, 14, 15, 18, 20, 24]);
  const numer = ri(2, denom - 2);
  // ask value as decimal to keep numeric
  const ans = numer / denom;
  return { text: `Simplify ${numer}/${denom} = ?`, answer: parseFloat(ans.toFixed(3)), options: [], topic: "fractions" };
}

function genDecimals(): PvpQ {
  const kind = ri(0, 2);
  if (kind === 0) {
    const a = rf(1, 20, 2), b = rf(1, 20, 2);
    const ans = parseFloat((a + b).toFixed(2));
    return { text: `${a} + ${b} = ?`, answer: ans, options: [], topic: "decimals" };
  }
  if (kind === 1) {
    const a = rf(5, 30, 2), b = rf(1, 10, 2);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const ans = parseFloat((hi - lo).toFixed(2));
    return { text: `${hi} − ${lo} = ?`, answer: ans, options: [], topic: "decimals" };
  }
  const a = rf(1.2, 9.9, 1), b = ri(2, 9);
  const ans = parseFloat((a * b).toFixed(2));
  return { text: `${a} × ${b} = ?`, answer: ans, options: [], topic: "decimals" };
}

function genSurds(): PvpQ {
  const kind = ri(0, 3);
  if (kind === 0) {
    // simplify sqrt(n) = a*sqrt(b), find a  (integer answer)
    const squares = [4, 9, 16, 25, 36, 49];
    const s = pick(squares);
    const b = pick([2, 3, 5, 6, 7, 10]);
    // avoid square * b being square itself
    const n = s * b;
    if (n > 200) return genSurds();
    const a = Math.sqrt(s);
    // question: sqrt(n) = a * sqrt(b) find a
    return { text: `√${n} = a√${b}, find a`, answer: a, options: [], topic: "surds" };
  }
  if (kind === 1) {
    // √a * √b
    const a = pick([2, 3, 5, 6, 7, 8, 10, 12, 18]);
    const b = pick([2, 3, 5, 8, 12]);
    const ans = parseFloat(Math.sqrt(a * b).toFixed(2));
    // but make nice: choose a*b perfect square sometimes
    if (Number.isInteger(Math.sqrt(a * b))) return { text: `√${a} × √${b} = ?`, answer: Math.sqrt(a * b), options: [], topic: "surds" };
    return { text: `√${a} × √${b} = ? (2 d.p.)`, answer: ans, options: [], topic: "surds" };
  }
  if (kind === 2) {
    // rationalise  C / sqrt(b)
    const b = pick([2, 3, 5, 7]);
    const c = pick([6, 8, 9, 10, 12, 15]);
    const ans = parseFloat((c / Math.sqrt(b)).toFixed(2));
    return { text: `${c}/√${b} = ? (2 d.p.)`, answer: ans, options: [], topic: "surds" };
  }
  // add surds numeric approx
  const b = pick([2, 3, 5]);
  const a1 = ri(1, 4), a2 = ri(1, 4);
  const ans = parseFloat(((a1 + a2) * Math.sqrt(b)).toFixed(2));
  return { text: `${a1}√${b} + ${a2}√${b} = ? (√${b}≈${Math.sqrt(b).toFixed(2)})`, answer: ans, options: [], topic: "surds" };
}

function genAlgebra(): PvpQ {
  const kind = ri(0, 2);
  if (kind === 0) {
    // solve linear: a x + b = c
    const a = ri(2, 6), x = ri(2, 12), b = ri(1, 10);
    const c = a * x + b;
    return { text: `${a}x + ${b} = ${c}, find x`, answer: x, options: [], topic: "algebra" };
  }
  if (kind === 1) {
    // evaluate polynomial
    const x = ri(2, 6);
    const a = ri(2, 5), b = ri(1, 6);
    // a x^2 + b x
    const ans = a * x * x + b * x;
    return { text: `If x=${x}, find ${a}x² + ${b}x`, answer: ans, options: [], topic: "algebra" };
  }
  // sequence next term
  const start = ri(3, 10), step = ri(2, 5);
  const seqLen = 4;
  const seq = Array.from({ length: seqLen }, (_, i) => start + i * step);
  return { text: `${seq.join(", ")}, … next term?`, answer: start + seqLen * step, options: [], topic: "algebra" };
}

function genCalculus(): PvpQ {
  const kind = ri(0, 3);
  if (kind === 0) {
    // differentiate a x^n, find f'(p)
    const a = ri(2, 6), n = ri(2, 4), p = ri(2, 5);
    // f(x)=a x^n => f'(x)=a n x^{n-1}
    const ans = a * n * Math.pow(p, n - 1);
    return { text: `f(x)=${a}x^${n}, find f'(${p})`, answer: ans, options: [], topic: "calculus" };
  }
  if (kind === 1) {
    // polynomial derivative
    const a = ri(2, 4), b = ri(2, 6), p = ri(1, 4);
    // f(x)=a x^2 + b x => f'=2a x + b
    const ans = 2 * a * p + b;
    return { text: `f(x)=${a}x²+${b}x, find f'(${p})`, answer: ans, options: [], topic: "calculus" };
  }
  if (kind === 2) {
    // derivative of a x^3 + b x^2
    const a = ri(1, 3), b = ri(2, 5), p = ri(1, 3);
    // f'=3a x^2 +2b x
    const ans = 3 * a * p * p + 2 * b * p;
    return { text: `f(x)=${a}x³+${b}x², find f'(${p})`, answer: ans, options: [], topic: "calculus" };
  }
  // definite integral
  const a = ri(1, 4), n = ri(1, 3), up = ri(2, 4);
  // integral 0->up a x^n dx = a*up^{n+1}/(n+1)
  const ansRaw = (a * Math.pow(up, n + 1)) / (n + 1);
  const ans = parseFloat(ansRaw.toFixed(2));
  // make nice integer cases more common
  if (Number.isInteger(ansRaw)) return { text: `∫₀^${up} ${a}x^${n} dx = ?`, answer: ansRaw, options: [], topic: "calculus" };
  return { text: `∫₀^${up} ${a}x^${n} dx = ? (2 d.p.)`, answer: ans, options: [], topic: "calculus" };
}

function genMixedAdvanced(): PvpQ {
  const pool = [genFractions, genDecimals, genSurds, genAlgebra, genCalculus];
  return pick(pool)();
}

function makeQsForLevel(levelId: number): PvpQ {
  let base: PvpQ;
  if (levelId === 1) base = Math.random() < 0.5 ? genFractions() : genDecimals();
  else if (levelId === 2) base = genSurds();
  else if (levelId === 3) base = genAlgebra();
  else if (levelId === 4) base = genCalculus();
  else base = genMixedAdvanced();
  const opts = distractors(base.answer);
  // ensure formatting doesn't duplicate due to rounding
  // de-duplicate by string
  const uniq = Array.from(new Set(opts.map(v => parseFloat(v.toFixed(3))))) as number[];
  // if duplicates collapsed, refill
  while (uniq.length < 3) {
    const extra = base.answer + ri(-5, 5) + (Number.isInteger(base.answer) ? 0 : 0.5);
    if (!uniq.includes(extra)) uniq.push(parseFloat(extra.toFixed(2)));
  }
  let finalOpts = shuffle(uniq.slice(0, 3));
  // ensure answer present
  if (!finalOpts.includes(base.answer)) finalOpts[ri(0, 2)] = base.answer;
  finalOpts = shuffle(finalOpts);
  return { ...base, options: finalOpts };
}

/* ── levels ── */
interface Enemy { name: string; emoji: string; hp: number; dmg: number; color: string; bg: string; }
interface LevelCfg {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  topics: string;
  diff: Difficulty;
  enemy: Enemy;
  blurb: string;
}

const LEVELS: LevelCfg[] = [
  {
    id: 1,
    title: "Fraction Arena",
    subtitle: "Fractions & Decimals · Easy",
    emoji: "🍕",
    topics: "fractions / decimals",
    diff: "easy",
    enemy: { name: "Slime King", emoji: "🟢", hp: 50, dmg: 4, color: "#27ae60", bg: "#2ecc71" },
    blurb: "Tame the slime with pizza slices and decimal hits.",
  },
  {
    id: 2,
    title: "Surd Sanctum",
    subtitle: "Surds & Indices · Medium",
    emoji: "√",
    topics: "surds / roots",
    diff: "medium",
    enemy: { name: "Stone Golem", emoji: "🗿", hp: 75, dmg: 6, color: "#7f8c8d", bg: "#95a5a6" },
    blurb: "Crack the golem's stone skin with radical roots.",
  },
  {
    id: 3,
    title: "Algebra Abyss",
    subtitle: "Algebra & Equations · Medium",
    emoji: "❎",
    topics: "algebra / sequences",
    diff: "medium",
    enemy: { name: "Shadow Demon", emoji: "👹", hp: 100, dmg: 8, color: "#8e44ad", bg: "#9b59b6" },
    blurb: "Outwit the demon by solving for x.",
  },
  {
    id: 4,
    title: "Calculus Spire",
    subtitle: "Differentiation · Hard",
    emoji: "∫",
    topics: "calculus",
    diff: "hard",
    enemy: { name: "Mecha Overlord", emoji: "🤖", hp: 120, dmg: 10, color: "#2980b9", bg: "#3498db" },
    blurb: "Differentiate to overload the mech's circuits.",
  },
  {
    id: 5,
    title: "Master Void",
    subtitle: "Mixed Calculus + Surds · Master",
    emoji: "🌌",
    topics: "all advanced",
    diff: "hard",
    enemy: { name: "Void Dragon", emoji: "🐉", hp: 150, dmg: 12, color: "#2c3e50", bg: "#34495e" },
    blurb: "Only masters survive the dragon's limitless void.",
  },
];

/* ── damage logic ── */
function getDamage(chosen: number, answer: number, options: number[]): { dmg: number; tier: "perfect" | "close" | "miss" | "weak" } {
  if (chosen === answer) return { dmg: 5, tier: "perfect" };
  const dists = options
    .filter(o => o !== answer)
    .map(o => ({ o, d: Math.abs(o - answer) }))
    .sort((a, b) => a.d - b.d);
  if (dists.length === 0) return { dmg: 0, tier: "miss" };
  const closest = dists[0].o;
  const furthest = dists[dists.length - 1].o;
  if (chosen === closest) return { dmg: 2, tier: "close" };
  if (chosen === furthest) return { dmg: 0, tier: "miss" };
  return { dmg: 1, tier: "weak" }; // middle of 4 options
}
const AGE_KEY = "pvp-age";

/* ── component ── */
export function PvpBattleGame({ onFinish }: { topicId: TopicId; diffId: Difficulty; onFinish: (i: ResultInput) => void }) {
  const [age, setAge] = useState<number | null>(() => {
    try { const v = localStorage.getItem(AGE_KEY); return v ? parseInt(v, 10) : null; } catch { return null; }
  });
  const [ageInput, setAgeInput] = useState("14");
  const [selected, setSelected] = useState<LevelCfg | null>(null);
  const [phase, setPhase] = useState<"select" | "battle" | "victory" | "defeat">("select");

  // battle state
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(50);
  const [question, setQuestion] = useState<PvpQ | null>(null);
  const [round, setRound] = useState(1);
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState<null | { tier: string; pDmg: number; eDmg: number; boat: number }>(null);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [dmgPopEnemy, setDmgPopEnemy] = useState<number | null>(null);
  const [dmgPopPlayer, setDmgPopPlayer] = useState<number | null>(null);

  const statsRef = useRef({ correct: 0, total: 0, bestStreak: 0, streak: 0 });
  const roundsRef = useRef(0);
  const overRef = useRef(false);

  const startLevel = (lv: LevelCfg) => {
    setSelected(lv);
    setPlayerHP(100);
    setEnemyHP(lv.enemy.hp);
    setRound(1);
    roundsRef.current = 1;
    statsRef.current = { correct: 0, total: 0, bestStreak: 0, streak: 0 };
    overRef.current = false;
    setPhase("battle");
    setQuestion(makeQsForLevel(lv.id));
    setLocked(false);
    setFlash(null);
  };

  const handleAgeSubmit = () => {
    const n = parseInt(ageInput, 10);
    if (Number.isNaN(n) || n < 1 || n > 99) return;
    try { localStorage.setItem(AGE_KEY, String(n)); } catch {}
    setAge(n);
  };

  const finish = (won: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    const s = statsRef.current;
    const lv = selected!;
    const reward = buildReward({ won, correct: s.correct, diffId: lv.diff, bonus: won ? 15 : 0 });
    onFinish({
      gameId: "pvp",
      won,
      correct: s.correct,
      total: s.total,
      bestStreak: s.bestStreak,
      score: won ? lv.id * 100 + s.correct * 10 : s.correct * 10,
      coins: reward.coins,
      xp: reward.xp,
    });
  };

  const handleAnswer = (opt: number) => {
    if (!selected || !question || locked || overRef.current) return;
    setLocked(true);
    const { dmg: pDmg, tier } = getDamage(opt, question.answer, question.options);
    const isCorrect = pDmg === 5;
    const isClose = pDmg === 2;
    // record
    statsRef.current.total++;
    roundsRef.current++;
    // topic for storage: map level to topicId
    const topicMap: Record<number, TopicId> = { 1: "mixed", 2: "mixed", 3: "mixed", 4: "mixed", 5: "mixed" };
    recordAnswer(topicMap[selected.id] ?? "mixed", isCorrect);
    evaluateAfterAnswer(isCorrect);
    if (isCorrect) {
      statsRef.current.correct++;
      statsRef.current.streak++;
      statsRef.current.bestStreak = Math.max(statsRef.current.bestStreak, statsRef.current.streak);
    } else if (!isClose) {
      statsRef.current.streak = 0;
    } else {
      // close counts as not correct but not streak breaker? slight streak preservation
      statsRef.current.streak = Math.max(0, statsRef.current.streak - 1);
    }

    // animate player attack
    setDmgPopEnemy(pDmg);
    setEnemyShake(pDmg > 0);
    setFlash({ tier, pDmg, eDmg: selected.enemy.dmg, boat: 0 });
    const newEnemyHP = Math.max(0, enemyHP - pDmg);
    setEnemyHP(newEnemyHP);

    // victory check before enemy counter
    if (newEnemyHP <= 0) {
      setTimeout(() => {
        setDmgPopEnemy(null);
        setEnemyShake(false);
        setPhase("victory");
      }, 700);
      return;
    }

    // enemy counter after 750ms
    setTimeout(() => {
      setDmgPopEnemy(null);
      setEnemyShake(false);
      if (overRef.current) return;
      // enemy attacks
      const eDmg = selected.enemy.dmg + ri(-1, 1); // variance
      const clamped = Math.max(2, eDmg);
      setDmgPopPlayer(clamped);
      setPlayerShake(true);
      const newPlayerHP = Math.max(0, playerHP - clamped);
      setPlayerHP(newPlayerHP);
      if (newPlayerHP <= 0) {
        setTimeout(() => {
          setDmgPopPlayer(null);
          setPlayerShake(false);
          setPhase("defeat");
        }, 700);
        return;
      }
      // next round
      setTimeout(() => {
        setDmgPopPlayer(null);
        setPlayerShake(false);
        setFlash(null);
        setRound(r => r + 1);
        if (roundsRef.current > 20) {
          // after 20 rounds compare HP
          const won = newEnemyHP < newPlayerHP;
          if (won) setPhase("victory"); else setPhase("defeat");
          return;
        }
        setQuestion(makeQsForLevel(selected.id));
        setLocked(false);
      }, 700);
    }, 750);
  };

  /* ── age gate ── */
  if (age !== null && (age < 12 || age > 18)) {
    return (
      <GameShell emoji="⚔️" name="Monster PvP" onQuit={() => finish(false)}>
        <div className="pvp-agegate">
          <div className="pvp-age-emoji">🔒</div>
          <h2>Age Restricted</h2>
          <p className="muted">This battle arena is crafted for mathematicians aged <strong>12–18</strong> with calculus, surds, fractions and decimals.</p>
          <p className="muted">Your age is <strong>{age}</strong>. You can't enter this arena.</p>
          <div className="pvp-age-row">
            <input
              className="pvp-age-input"
              type="number"
              min={1}
              max={99}
              value={ageInput}
              onInput={e => setAgeInput((e.target as HTMLInputElement).value)}
              placeholder="Enter age"
            />
            <button className="btn-primary" onClick={handleAgeSubmit}>Update age</button>
          </div>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => finish(false)}>← Back to games</button>
        </div>
      </GameShell>
    );
  }

  if (age === null) {
    return (
      <GameShell emoji="⚔️" name="Monster PvP" onQuit={() => finish(false)}>
        <div className="pvp-agegate">
          <div className="pvp-age-emoji">⚔️</div>
          <h2>Enter the Arena</h2>
          <p className="muted">Monster PvP is for ages <strong>12–18</strong>. Calculus, surds, fractions and decimals await. Each answer deals damage: <b>correct 5</b> · <b>close 2</b> · <b>furthest 0</b>.</p>
          <div className="pvp-age-row">
            <input
              className="pvp-age-input"
              type="number"
              min={1}
              max={99}
              value={ageInput}
              onInput={e => setAgeInput((e.target as HTMLInputElement).value)}
              placeholder="Your age"
            />
            <button className="btn-primary" onClick={handleAgeSubmit}>Enter Battle</button>
          </div>
          <p className="muted small">Your age is stored locally to enforce the arena restriction.</p>
        </div>
      </GameShell>
    );
  }

  /* ── level select ── */
  if (phase === "select" || !selected) {
    return (
      <GameShell emoji="⚔️" name="Monster PvP" pills={[`Age ${age}`, "12-18 only"]} onQuit={() => finish(false)}>
        <div className="pvp-select">
          <p className="pvp-select-sub">Pokémon-style PvP: you vs monster. Answer maths to attack. <b>5 DMG = correct</b> · <b>2 DMG = close</b> · <b>0 DMG = furthest</b>. Beat the monster before it beats you!</p>
          <div className="pvp-level-grid">
            {LEVELS.map(lv => (
              <button key={lv.id} className="pvp-level-card" onClick={() => startLevel(lv)} style={{ ["--acc" as string]: lv.enemy.color }}>
                <span className="pvp-lv-emoji" style={{ background: `${lv.enemy.color}18`, borderColor: `${lv.enemy.color}35`, color: lv.enemy.color }}>{lv.emoji}</span>
                <div className="pvp-lv-main">
                  <div className="pvp-lv-title">{lv.title}</div>
                  <div className="pvp-lv-sub">{lv.subtitle}</div>
                  <div className="pvp-lv-blurb">{lv.blurb}</div>
                  <div className="pvp-lv-meta">
                    <span className="pvp-lv-tag" style={{ color: lv.enemy.color, background: `${lv.enemy.color}14`, borderColor: `${lv.enemy.color}33` }}>Lv {lv.id}</span>
                    <span className="pvp-lv-vs">{lv.enemy.emoji} {lv.enemy.name} · {lv.enemy.hp} HP · {lv.enemy.dmg} DMG</span>
                  </div>
                </div>
                <span className="pvp-lv-go">⚔️ Fight</span>
              </button>
            ))}
          </div>
          <div className="pvp-legend">
            <div className="pvp-legend-item"><span className="pvp-dot perfect" /> 5 DMG — exact answer</div>
            <div className="pvp-legend-item"><span className="pvp-dot close" /> 2 DMG — closest distractor</div>
            <div className="pvp-legend-item"><span className="pvp-dot miss" /> 0 DMG — furthest distractor</div>
          </div>
        </div>
      </GameShell>
    );
  }

  /* ── victory / defeat ── */
  if (phase === "victory") {
    const s = statsRef.current;
    return (
      <GameShell emoji="⚔️" name="Monster PvP" onQuit={() => finish(true)}>
        <div className="pvp-result">
          <div className="pvp-res-emoji">🏆</div>
          <h2 className="pvp-res-title">Victory!</h2>
          <p className="muted">You defeated {selected.enemy.emoji} {selected.enemy.name} in {round} rounds!</p>
          <div className="pvp-res-stats">
            <div className="pvp-res-stat"><span className="pvp-rs-num">{s.correct}/{s.total}</span><span className="pvp-rs-lab">hits</span></div>
            <div className="pvp-res-stat"><span className="pvp-rs-num">×{s.bestStreak}</span><span className="pvp-rs-lab">best streak</span></div>
            <div className="pvp-res-stat"><span className="pvp-rs-num">{100 - playerHP} dmg taken</span><span className="pvp-rs-lab">damage</span></div>
          </div>
          <button className="btn-primary big" onClick={() => finish(true)}>Claim Reward →</button>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => { setPhase("select"); setSelected(null); }}>← Choose another level</button>
        </div>
      </GameShell>
    );
  }
  if (phase === "defeat") {
    const s = statsRef.current;
    return (
      <GameShell emoji="⚔️" name="Monster PvP" onQuit={() => finish(false)}>
        <div className="pvp-result">
          <div className="pvp-res-emoji">💀</div>
          <h2 className="pvp-res-title">Defeated</h2>
          <p className="muted">{selected.enemy.emoji} {selected.enemy.name} was too strong. Train and return!</p>
          <div className="pvp-res-stats">
            <div className="pvp-res-stat"><span className="pvp-rs-num">{s.correct}/{s.total}</span><span className="pvp-rs-lab">hits</span></div>
            <div className="pvp-res-stat"><span className="pvp-rs-num">{enemyHP} HP</span><span className="pvp-rs-lab">enemy left</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setPhase("select"); setSelected(null); }}>← Levels</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => startLevel(selected)}>🔄 Retry</button>
          </div>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => finish(false)}>Leave arena</button>
        </div>
      </GameShell>
    );
  }

  /* ── battle ── */
  const enemyPct = Math.max(0, (enemyHP / selected.enemy.hp) * 100);
  const playerPct = Math.max(0, (playerHP / 100) * 100);

  return (
    <GameShell emoji="⚔️" name="Monster PvP" pills={[`${selected.emoji} ${selected.title}`, `Round ${round}`]} onQuit={() => finish(false)}>
      <div className="pvp-arena">
        {/* Enemy */}
        <div className={`pvp-combatant enemy ${enemyShake ? "shake" : ""}`}>
          <div className="pvp-combatant-head">
            <span className="pvp-combatant-name">{selected.enemy.emoji} {selected.enemy.name}</span>
            <span className="pvp-lv-badge">Lv {selected.id}</span>
          </div>
          <div className="pvp-hp-row">
            <span className="pvp-hp-label">HP</span>
            <div className="pvp-hp-bar"><div className="pvp-hp-fill enemy" style={{ width: `${enemyPct}%` }} /></div>
            <span className="pvp-hp-num">{enemyHP}/{selected.enemy.hp}</span>
          </div>
          <div className="pvp-sprite enemy" style={{ background: `${selected.enemy.color}14`, borderColor: `${selected.enemy.color}30` }}>
            <span className="pvp-sprite-emoji">{selected.enemy.emoji}</span>
            {dmgPopEnemy !== null && <span className={`pvp-dmg-pop ${dmgPopEnemy === 5 ? "perfect" : dmgPopEnemy===2 ? "close" : "miss"}`}>-{dmgPopEnemy}</span>}
            {flash && flash.pDmg === 5 && <span className="pvp-crit">CRITICAL!</span>}
          </div>
        </div>

        <div className="pvp-vs">⚔️ VS ⚔️</div>

        {/* Player */}
        <div className={`pvp-combatant player ${playerShake ? "shake" : ""}`}>
          <div className="pvp-sprite player" style={{ background: "var(--primary-light)", borderColor: "var(--border-strong)" }}>
            <span className="pvp-sprite-emoji">🧙</span>
            {dmgPopPlayer !== null && <span className="pvp-dmg-pop player">-{dmgPopPlayer}</span>}
          </div>
          <div className="pvp-combatant-head">
            <span className="pvp-combatant-name">🧙 You</span>
            <span className="pvp-hp-num">{playerHP}/100</span>
          </div>
          <div className="pvp-hp-row">
            <div className="pvp-hp-bar"><div className="pvp-hp-fill player" style={{ width: `${playerPct}%` }} /></div>
          </div>
        </div>

        {/* Flash bar */}
        {flash && (
          <div className={`pvp-flash ${flash.tier}`}>
            {flash.tier === "perfect" ? "⚔️ 5 DMG — Perfect hit!" : flash.tier === "close" ? "💫 2 DMG — Close!" : flash.tier === "weak" ? "💨 1 DMG — Glancing" : "💨 0 DMG — Miss! Furthest answer"}
          </div>
        )}

        {/* Question */}
        {question && (
          <div className={`pvp-question-panel ${locked ? "locked" : ""}`}>
            <div className="pvp-q-topic">{question.topic} · Round {round}</div>
            <div className="pvp-q-text">{question.text}</div>
            <div className="pvp-options">
              {question.options.map(o => {
                let cls = "pvp-opt";
                // highlight tiers when locked? keep neutral until next q
                return (
                  <button key={`${o}-${question.text}`} className={cls} disabled={locked} onClick={() => handleAnswer(o)}>
                    {fmt(o)}
                  </button>
                );
              })}
            </div>
            <div className="pvp-dmg-legend">Correct = <b>5 DMG</b> · Close = <b>2 DMG</b> · Furthest = <b>0 DMG</b></div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
