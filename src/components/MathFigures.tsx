/* Actual SVG graphics for Learn quizzes: coordinate planes, trig triangles, circles, waves, bars. */

export type QuizFigure =
  | {
      kind: "coordinate";
      points: Array<{ x: number; y: number; label?: string; color?: string }>;
      join?: boolean;
      xrange?: [number, number];
      yrange?: [number, number];
      showRightTriangle?: boolean;
    }
  | {
      kind: "triangle";
      /** side lengths used for labels (not to scale note handled by fixed shape) */
      opp: number;
      adj: number;
      hyp: number;
      angleDeg?: number;
      angleLabel?: string;
      hideSide?: "opp" | "adj" | "hyp" | null;
    }
  | {
      kind: "circle";
      center: { x: number; y: number };
      radius: number;
      point?: { x: number; y: number; label?: string };
      xrange?: [number, number];
      yrange?: [number, number];
    }
  | { kind: "wave"; fn: "sin" | "cos"; phaseDeg?: number }
  | { kind: "bars"; values: number[]; labels: string[] };

const ACCENT = "#7b1fa2";
const GRID = "#e5e7eb";
const AXIS = "#8a7aa6";

function CoordFrame({
  xrange,
  yrange,
  children,
}: {
  xrange: [number, number];
  yrange: [number, number];
  children: preact.ComponentChildren;
}) {
  const W = 280;
  const H = 240;
  const pad = 22;
  const [x0, x1] = xrange;
  const [y0, y1] = yrange;
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - pad * 2);
  const sy = (y: number) => H - pad - ((y - y0) / (y1 - y0)) * (H - pad * 2);
  const gridLines = [];
  for (let x = Math.ceil(x0); x <= x1; x++) {
    gridLines.push(
      <line key={`v${x}`} x1={sx(x)} y1={pad} x2={sx(x)} y2={H - pad} stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 2 : 1} />
    );
  }
  for (let y = Math.ceil(y0); y <= y1; y++) {
    gridLines.push(
      <line key={`h${y}`} x1={pad} y1={sy(y)} x2={W - pad} y2={sy(y)} stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 2 : 1} />
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="math-fig-svg" role="img" aria-label="Coordinate plane">
      {gridLines}
      {/* axis labels */}
      <text x={W - 10} y={sy(0) - 6} fontSize="11" fontWeight="800" fill={AXIS}>x</text>
      <text x={sx(0) + 6} y={14} fontSize="11" fontWeight="800" fill={AXIS}>y</text>
      <text x={sx(0) - 14} y={sy(0) + 14} fontSize="10" fontWeight="800" fill={AXIS}>0</text>
      {/* pass-through children get helpers via data attrs; we render them in pixel space using nested svg trick:
          instead, children are expected to be already-positioned elements from caller via render props.
          To keep it simple, we expose sx/sy by cloning: caller uses <CoordPlot> below. */}
      {children}
    </svg>
  );
}

/** Helper that maps math coords to pixels — used inside MathFigure for coordinate/circle kinds. */
function useMapper(xrange: [number, number], yrange: [number, number], W = 280, H = 240, pad = 22) {
  const [x0, x1] = xrange;
  const [y0, y1] = yrange;
  return {
    sx: (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - pad * 2),
    sy: (y: number) => H - pad - ((y - y0) / (y1 - y0)) * (H - pad * 2),
  };
}

function CoordinateFig({
  points,
  join,
  xrange = [-1, 7],
  yrange = [-1, 7],
  showRightTriangle,
}: Extract<QuizFigure, { kind: "coordinate" }>) {
  const W = 280;
  const H = 240;
  const { sx, sy } = useMapper(xrange, yrange, W, H);
  const colors = ["#7b1fa2", "#0984e3", "#e17055", "#27ae60"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="math-fig-svg" role="img" aria-label="Coordinate plane with points">
      {Array.from({ length: xrange[1] - xrange[0] + 1 }, (_, i) => {
        const x = xrange[0] + i;
        return <line key={`v${x}`} x1={sx(x)} y1={22} x2={sx(x)} y2={H - 22} stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 2 : 1} />;
      })}
      {Array.from({ length: yrange[1] - yrange[0] + 1 }, (_, i) => {
        const y = yrange[0] + i;
        return <line key={`h${y}`} x1={22} y1={sy(y)} x2={W - 22} y2={sy(y)} stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 2 : 1} />;
      })}
      <text x={W - 12} y={sy(0) - 6} fontSize="11" fontWeight="800" fill={AXIS}>x</text>
      <text x={sx(0) + 6} y={16} fontSize="11" fontWeight="800" fill={AXIS}>y</text>
      {showRightTriangle && points.length >= 2 && (
        <g stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" fill="none">
          <line x1={sx(points[0].x)} y1={sy(points[0].y)} x2={sx(points[1].x)} y2={sy(points[0].y)} />
          <line x1={sx(points[1].x)} y1={sy(points[0].y)} x2={sx(points[1].x)} y2={sy(points[1].y)} />
        </g>
      )}
      {join && points.length >= 2 && (
        <g stroke={ACCENT} strokeWidth="2.5">
          {points.slice(0, -1).map((p, i) => (
            <line key={i} x1={sx(p.x)} y1={sy(p.y)} x2={sx(points[i + 1].x)} y2={sy(points[i + 1].y)} />
          ))}
        </g>
      )}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r="6" fill={p.color ?? colors[i % colors.length]} stroke="#fff" strokeWidth="2" />
          <text x={sx(p.x) + 9} y={sy(p.y) - 8} fontSize="12" fontWeight="900" fill="#3b2e58">
            {p.label ?? `${i === 0 ? "A" : "B"}(${p.x}, ${p.y})`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TriangleFig({ opp, adj, hyp, angleDeg, angleLabel, hideSide }: Extract<QuizFigure, { kind: "triangle" }>) {
  // Fixed right-triangle shape: right angle bottom-right.
  const Ax = 30, Ay = 190; // angle vertex (bottom-left)
  const Bx = 240, By = 190; // right-angle vertex (bottom-right)
  const Cx = 240, Cy = 50; // top vertex
  const lbl = (v: number, hidden: boolean) => (hidden ? "?" : String(v));
  return (
    <svg viewBox="0 0 280 220" className="math-fig-svg" role="img" aria-label="Right-angled triangle">
      <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="#f3e5f5" stroke={ACCENT} strokeWidth="3" strokeLinejoin="round" />
      {/* right-angle square */}
      <path d={`M ${Bx - 16} ${By} L ${Bx - 16} ${By - 16} L ${Bx} ${By - 16}`} fill="none" stroke={ACCENT} strokeWidth="2" />
      {/* angle arc at A */}
      <path d="M 62 190 A 32 32 0 0 0 56 168" fill="none" stroke="#e17055" strokeWidth="2.5" />
      <text x="66" y="178" fontSize="14" fontWeight="900" fill="#e17055">{angleLabel ?? "θ"}</text>
      {angleDeg !== undefined && (
        <text x="30" y="212" fontSize="11" fontWeight="800" fill="#8a7aa6">θ = {angleDeg}° shown</text>
      )}
      {/* hypotenuse label (slanted) */}
      <text x="118" y="100" fontSize="14" fontWeight="900" fill="#3b2e58" transform="rotate(-33 118 100)">
        hyp {lbl(hyp, hideSide === "hyp")}
      </text>
      {/* adjacent (bottom) */}
      <text x="120" y="210" fontSize="14" fontWeight="900" fill="#3b2e58">
        adj {lbl(adj, hideSide === "adj")}
      </text>
      {/* opposite (right side) */}
      <text x="248" y="125" fontSize="14" fontWeight="900" fill="#3b2e58">
        opp {lbl(opp, hideSide === "opp")}
      </text>
    </svg>
  );
}

function CircleFig({ center, radius, point, xrange, yrange }: Extract<QuizFigure, { kind: "circle" }>) {
  const W = 280;
  const H = 240;
  const xr: [number, number] = xrange ?? [center.x - radius - 3, center.x + radius + 3];
  const yr: [number, number] = yrange ?? [center.y - radius - 3, center.y + radius + 3];
  const { sx, sy } = useMapper(xr, yr, W, H);
  const pxPerUnitX = (W - 44) / (xr[1] - xr[0]);
  const pxPerUnitY = (H - 44) / (yr[1] - yr[0]);
  const rPx = Math.min(pxPerUnitX, pxPerUnitY) * radius;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="math-fig-svg" role="img" aria-label="Circle on coordinate plane">
      {Array.from({ length: Math.min(15, xr[1] - xr[0] + 1) }, (_, i) => {
        const x = Math.ceil(xr[0]) + i;
        if (x > xr[1]) return null;
        return <line key={`v${x}`} x1={sx(x)} y1={22} x2={sx(x)} y2={H - 22} stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 2 : 1} />;
      })}
      {Array.from({ length: Math.min(15, yr[1] - yr[0] + 1) }, (_, i) => {
        const y = Math.ceil(yr[0]) + i;
        if (y > yr[1]) return null;
        return <line key={`h${y}`} x1={22} y1={sy(y)} x2={W - 22} y2={sy(y)} stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 2 : 1} />;
      })}
      <ellipse cx={sx(center.x)} cy={sy(center.y)} rx={rPx} ry={rPx} fill="rgba(123,31,162,0.08)" stroke={ACCENT} strokeWidth="3" />
      <circle cx={sx(center.x)} cy={sy(center.y)} r="5" fill={ACCENT} />
      <text x={sx(center.x) + 8} y={sy(center.y) - 8} fontSize="12" fontWeight="900" fill="#3b2e58">
        C({center.x}, {center.y})
      </text>
      <text x={sx(center.x) + 8} y={sy(center.y) + 16} fontSize="11" fontWeight="800" fill={AXIS}>r = {radius}</text>
      {point && (
        <g>
          <line x1={sx(center.x)} y1={sy(center.y)} x2={sx(point.x)} y2={sy(point.y)} stroke="#e17055" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx={sx(point.x)} cy={sy(point.y)} r="6" fill="#e17055" stroke="#fff" strokeWidth="2" />
          <text x={sx(point.x) + 9} y={sy(point.y) - 8} fontSize="12" fontWeight="900" fill="#3b2e58">
            {point.label ?? `P(${point.x}, ${point.y})`}
          </text>
        </g>
      )}
    </svg>
  );
}

function WaveFig({ fn, phaseDeg = 0 }: Extract<QuizFigure, { kind: "wave" }>) {
  const W = 280;
  const H = 160;
  const mid = H / 2;
  const amp = 50;
  const pts: string[] = [];
  for (let px = 0; px <= W; px += 4) {
    const x = (px / W) * Math.PI * 4 + (phaseDeg * Math.PI) / 180;
    const v = fn === "sin" ? Math.sin(x) : Math.cos(x);
    pts.push(`${px},${mid - v * amp}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="math-fig-svg" role="img" aria-label={`${fn} wave`}>
      <line x1="0" y1={mid} x2={W} y2={mid} stroke={AXIS} strokeWidth="2" />
      <line x1="20" y1="0" x2="20" y2={H} stroke={AXIS} strokeWidth="2" />
      <polyline points={pts.join(" ")} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinejoin="round" />
      <text x={W - 60} y={mid - amp - 8} fontSize="12" fontWeight="900" fill={ACCENT}>
        y = {fn} θ{phaseDeg ? ` (${phaseDeg}° shift)` : ""}
      </text>
    </svg>
  );
}

function BarsFig({ values, labels }: Extract<QuizFigure, { kind: "bars" }>) {
  const W = 280;
  const H = 170;
  const max = Math.max(...values, 1);
  const bw = Math.min(50, (W - 40) / values.length - 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="math-fig-svg" role="img" aria-label="Bar chart">
      <line x1="30" y1="10" x2="30" y2={H - 30} stroke={AXIS} strokeWidth="2" />
      <line x1="30" y1={H - 30} x2={W - 10} y2={H - 30} stroke={AXIS} strokeWidth="2" />
      {values.map((v, i) => {
        const h = ((H - 60) * v) / max;
        const x = 44 + i * ((W - 60) / values.length);
        return (
          <g key={i}>
            <rect x={x} y={H - 30 - h} width={bw} height={h} rx="5" fill={i % 2 ? "#0984e3" : ACCENT} opacity="0.85" />
            <text x={x + bw / 2} y={H - 30 - h - 6} fontSize="11" fontWeight="900" fill="#3b2e58" textAnchor="middle">{v}</text>
            <text x={x + bw / 2} y={H - 14} fontSize="10" fontWeight="800" fill={AXIS} textAnchor="middle">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function MathFigure({ figure }: { figure: QuizFigure }) {
  return (
    <div className="math-fig-wrap">
      {figure.kind === "coordinate" && <CoordinateFig {...figure} />}
      {figure.kind === "triangle" && <TriangleFig {...figure} />}
      {figure.kind === "circle" && <CircleFig {...figure} />}
      {figure.kind === "wave" && <WaveFig {...figure} />}
      {figure.kind === "bars" && <BarsFig {...figure} />}
    </div>
  );
}

// Re-export to avoid circular import type issues in lessonQuiz
export type { QuizFigure as MathQuizFigure };
export { CoordFrame };
