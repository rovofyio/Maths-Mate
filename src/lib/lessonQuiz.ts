import type { Lesson } from "../data/chapters";
import type { QuizFigure } from "../components/MathFigures";

export interface QuizQ {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
  figure?: QuizFigure;
}

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T>(a: T[]): T[] => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };

function distractorsNum(ans: number, count=3): string[] {
  const set = new Set<string>([String(ans)]);
  let g=0;
  const spread = Math.max(2, Math.abs(ans*0.2)+3);
  while(set.size<count+1 && g<200){ g++; const d = ans + ri(-Math.round(spread), Math.round(spread)); if(d!==ans) set.add(String(d)); }
  let e=ans+7; while(set.size<count+1){ set.add(String(e)); e+=3; }
  return shuffle([...set]);
}
function distractorsText(ans: string, pool: string[]): string[] {
  const set = new Set<string>([ans]);
  const shuffled = shuffle(pool.filter(p=>p!==ans));
  for(const p of shuffled){ if(set.size>=4) break; set.add(p); }
  while(set.size<4) set.add(ans+" (alt)");
  return shuffle([...set]);
}
function mkQ(prompt: string, answer: string|number, opts?: string[], exp?: string, figure?: QuizFigure): QuizQ {
  const ansStr = String(answer);
  const options = opts ?? distractorsNum(typeof answer==="number"?answer as number: parseInt(ansStr)||0,3);
  // ensure answer in opts
  if(!options.includes(ansStr)){
    const r = shuffle(options);
    r[0]=ansStr;
    return { id: Math.random().toString(36).slice(2,7), prompt, options: shuffle(r), answer: ansStr, explanation: exp, figure };
  }
  return { id: Math.random().toString(36).slice(2,7), prompt, options: shuffle(options), answer: ansStr, explanation: exp, figure };
}

// ── per-lesson generators ──
type Gen = () => QuizQ;

const gens: Record<string, Gen> = {
  "numbers-place": () => {
    const num = ri(1000,9999);
    const s=String(num);
    const idx=ri(0,s.length-1);
    const digit=parseInt(s[idx]);
    const placeVals = [1,10,100,1000];
    const placeNames=["ones","tens","hundreds","thousands"];
    const pos = s.length-1-idx;
    const val = digit*placeVals[pos];
    return mkQ(`What is the value of ${digit} in ${num}?`, val, distractorsNum(val,3), `The ${digit} is in the ${placeNames[pos]} place.`);
  },
  "numbers-compare": () => {
    const a=ri(200,1200), b=ri(200,1200);
    if(a===b) return gens["numbers-compare"]();
    const ans = a>b?String(a):String(b);
    const prompt = `Which is bigger: ${a} or ${b}?`;
    return mkQ(prompt, ans, [String(a), String(b), String(Math.max(a,b)+50), String(Math.min(a,b)-20)].slice(0,4), `${Math.max(a,b)} has larger value.`);
  },
  "numbers-round": () => {
    const n=ri(10,99), ans=Math.round(n/10)*10;
    return mkQ(`Round ${n} to the nearest 10`, ans, distractorsNum(ans,3), `Look at ones digit: ${n%10>=5?"≥5 round up":"<5 round down"}.`);
  },
  "addsub-addition": () => {
    const a=ri(20,200), b=ri(20,200);
    const ans=a+b;
    return mkQ(`${a} + ${b} = ?`, ans, distractorsNum(ans,3), `Add column by column with carrying.`);
  },
  "addsub-subtraction": () => {
    const a=ri(40,300), b=ri(10,a-1);
    const ans=a-b;
    return mkQ(`${a} − ${b} = ?`, ans, distractorsNum(ans,3), `Borrow if needed.`);
  },
  "addsub-estimate": () => {
    const a=ri(180,420), b=ri(180,420);
    const est = Math.round(a/100)*100 + Math.round(b/100)*100;
    return mkQ(`Estimate ${a} + ${b} by rounding to nearest 100`, est, distractorsNum(est,3), `Round each then add.`);
  },
  "muldiv-tables": () => {
    const a=ri(6,9), b=ri(6,9);
    const ans=a*b;
    return mkQ(`${a} × ${b} = ?`, ans, distractorsNum(ans,3));
  },
  "muldiv-grid": () => {
    const a=ri(12,30), b=ri(2,12);
    const ans=a*b;
    return mkQ(`${a} × ${b} = ?`, ans, distractorsNum(ans,3));
  },
  "muldiv-division": () => {
    const b=ri(2,12), q=ri(2,12);
    const n=b*q;
    return mkQ(`${n} ÷ ${b} = ?`, q, distractorsNum(q,3));
  },
  "fractions-intro": () => {
    const opts=["1/2","1/3","1/4","1/5","2/3","3/4"];
    const q = pick(["Which is bigger: 1/3 or 1/5?","Which is bigger: 1/2 or 1/4?","Which is bigger: 2/3 or 1/3?"]);
    if(q.includes("1/3 or 1/5")) return mkQ(q,"1/3", distractorsText("1/3",opts), "Smaller denominator = bigger piece.");
    if(q.includes("1/2 or 1/4")) return mkQ(q,"1/2", distractorsText("1/2",opts));
    return mkQ(q,"2/3", distractorsText("2/3",opts));
  },
  "fractions-equivalent": () => {
    const pairs:Record<string,string>={"8/12":"2/3","6/9":"2/3","10/15":"2/3","12/16":"3/4","9/12":"3/4"};
    const k=pick(Object.keys(pairs));
    const v=pairs[k];
    return mkQ(`Simplify ${k}`, v, distractorsText(v,["1/2","2/3","3/4","4/5","1/3"]), `Divide top & bottom by GCD.`);
  },
  "fractions-add": () => {
    const den=pick([4,6,8]);
    const a=ri(1,den-1), b=ri(1,den-1);
    if(a+b>=den*2) return gens["fractions-add"]();
    const ansNum=a+b, ans=`${ansNum}/${den}`;
    return mkQ(`${a}/${den} + ${b}/${den} = ?`, ans, distractorsText(ans,[`1/${den}`,`${a}/${den}`,`${b}/${den}`,`${ansNum}/${den+1}`,"1/2"]));
  },
  "decimals-place": () => {
    const opts=["tenths","hundredths","ones","thousandths"];
    const q=pick(["What place is 7 in 3.27?","What place is 2 in 3.27?","Write 35/100 as decimal"]);
    if(q.includes("7 in 3.27")) return mkQ(q,"hundredths", distractorsText("hundredths",opts));
    if(q.includes("2 in 3.27")) return mkQ(q,"tenths", distractorsText("tenths",opts));
    return mkQ(q,"0.35", distractorsText("0.35",["0.035","0.35","3.5","0.53"]));
  },
  "decimals-arith": () => {
    const a=pick([2.5,3.2,1.75,4.1]), b=pick([1.25,2.5,0.85,3.75]);
    const ans=parseFloat((a+b).toFixed(2));
    return mkQ(`${a} + ${b} = ?`, ans, distractorsNum(ans,3));
  },
  "decimals-convert": () => {
    const map:Record<string,string>={"3/4":"0.75","1/4":"0.25","1/2":"0.5","1/8":"0.125","3/8":"0.375"};
    const k=pick(Object.keys(map));
    return mkQ(`Write ${k} as decimal`, map[k], distractorsText(map[k],["0.5","0.25","0.75","0.33","0.125"]));
  },
  "pct-intro": () => {
    const q=pick(["Write 70% as decimal","Write 50% as fraction","What is 100%?"]);
    if(q.includes("70%")) return mkQ(q,"0.7", distractorsText("0.7",["0.07","0.7","7.0","70"]));
    if(q.includes("50%")) return mkQ(q,"1/2", distractorsText("1/2",["1/2","1/4","1/5","2/3"]));
    return mkQ(q,"Whole", distractorsText("Whole",["Whole","Half","Quarter","Nothing"]));
  },
  "pct-of": () => {
    const pct=pick([10,20,25,50]), n=pick([60,80,120,200]);
    const ans=(pct/100)*n;
    return mkQ(`${pct}% of ${n} = ?`, ans, distractorsNum(ans,3));
  },
  "pct-change": () => {
    const price=pick([40,80,60,100]), pct=pick([10,15,20,25]);
    const ans=price - (price*pct/100);
    return mkQ(`£${price} reduced by ${pct}% → new price?`, "£"+ans, distractorsText("£"+ans,[`£${price}`,`£${ans+5}`,`£${ans-5}`,`£${price+10}`]));
  },
  "ratio-intro": () => {
    const a=pick([12,8,10,15]), b=pick([8,6,5,9]);
    const gg=(x:number,y:number):number=> y===0?x:gg(y,x%y);
    const g2=gg(a,b);
    const ans=`${a/g2}:${b/g2}`;
    return mkQ(`Simplify ${a}:${b}`, ans, distractorsText(ans,["3:2","2:1","4:3","1:1",ans]));
  },
  "ratio-proportion": () => {
    const per=ri(20,40);
    const a=3, cost=per*a;
    const b=5;
    const ans=(per)*b;
    return mkQ(`${a} apples cost ${cost}p. How much for ${b} apples?`, "£"+(ans/100).toFixed(2), distractorsText("£"+(ans/100).toFixed(2),["£1.20","£1.50","£2.00","£0.90"]));
  },
  "ratio-scale": () => {
    const scale=10000, cm=ri(2,8);
    const ans=cm*scale/100;
    return mkQ(`Map 1:${scale}, ${cm}cm apart → real distance?`, ans+"m", distractorsText(ans+"m",["200m","400m","800m","100m"]));
  },
  "algebra-intro": () => {
    const x=ri(2,6), a=ri(2,5);
    const ans=a*x;
    return mkQ(`If x=${x}, find ${a}x`, ans, distractorsNum(ans,3));
  },
  "algebra-equations": () => {
    const x=ri(2,12), b=ri(3,10);
    const c=x+b;
    return mkQ(`Solve x + ${b} = ${c}`, String(x), distractorsNum(x,3));
  },
  "algebra-sequences": () => {
    const start=ri(2,10), step=ri(2,5);
    const seq=[start,start+step,start+step*2,start+step*3];
    const ans=start+step*4;
    return mkQ(`${seq.join(", ")}, … next?`, ans, distractorsNum(ans,3));
  },
  "geo-shapes": () => {
    const a=ri(30,60), b=ri(30,60);
    const c=180-a-b;
    if(c<=0) return gens["geo-shapes"]();
    return mkQ(`Triangle angles ${a}° and ${b}° → third?`, c+"°", distractorsText(c+"°",["60°","90°","80°","100°",c+"°"]));
  },
  "geo-area": () => {
    const l=ri(5,12), w=ri(3,9);
    const ans=l*w;
    return mkQ(`Area rectangle ${l}cm × ${w}cm`, ans+" cm²", distractorsText(ans+" cm²",[`${l+w} cm²`,`${(l+w)*2} cm²`, `${ans+10} cm²`, `${ans} cm²`]));
  },
  "geo-coords": () => {
    const x=ri(1,5), y=ri(1,5);
    return mkQ(`Start (0,0), move ${x} right, ${y} up → where?`, `(${x}, ${y})`, distractorsText(`(${x}, ${y})`,[`(${y}, ${x})`,`(${-x}, ${y})`,`(${x}, ${-y})`]));
  },
  "meas-units": () => {
    const km=pick([2.5,3.5,1.2,4.8]);
    const ans=km*1000;
    return mkQ(`${km} km → metres`, ans+" m", distractorsNum(ans,3).map(s=>s+" m"));
  },
  "meas-time": () => {
    const h=ri(1,2), m=ri(10,40);
    const ansH=h, ansM=m;
    return mkQ(`Film 14:15 to ${14+h}:${(15+m)%60} → duration?`, `${ansH}h ${ansM}m`, distractorsText(`${ansH}h ${ansM}m`,["1h 20m","2h 5m","1h 35m","45m"]));
  },
  "meas-money": () => {
    const costs=[6.75,4.2,3.6], paid=10;
    const c=pick(costs as number[]);
    const ans=parseFloat((paid-c).toFixed(2));
    return mkQ(`Cost £${c}, pay £${paid} → change?`, "£"+ans.toFixed(2), distractorsText("£"+ans.toFixed(2),["£3.00","£2.50","£4.00","£3.25"]));
  },
  "stats-average": () => {
    const arr=[ri(2,10),ri(2,10),ri(2,10),ri(2,10)];
    const sum=arr.reduce((a,b)=>a+b,0);
    const ans=parseFloat((sum/arr.length).toFixed(1));
    return mkQ(`Mean of ${arr.join(", ")}`, ans, distractorsNum(ans,3));
  },
  "stats-graphs": () => {
    return mkQ(`Bar chart tallest bar = ?`, "Biggest value", distractorsText("Biggest value",["Biggest value","Smallest value","Middle value","Zero"]));
  },
  "stats-probability": () => {
    return mkQ(`Roll fair die → P(4)?`, "1/6", distractorsText("1/6",["1/6","1/3","1/2","1/4"]));
  },
  // ── Geometry advanced ──
  "geo-adv-angles": () => {
    const kind = pick(["hex", "pent", "parallel"] as const);
    if (kind === "parallel") return mkQ(`Parallel lines: one angle is 55°. Its alternate angle is?`, "55°", distractorsText("55°", ["55°", "125°", "35°", "90°"]), "Alternate angles are equal.");
    const n = kind === "hex" ? 6 : 5;
    const sum = (n - 2) * 180;
    return mkQ(`Sum of interior angles of a ${kind === "hex" ? "hexagon" : "pentagon"}?`, sum + "°", distractorsText(sum + "°", ["540°", "720°", "360°", "900°", sum + "°"]), `(${n}−2) × 180° = ${sum}°.`);
  },
  "geo-adv-circles": () => {
    const c = pick([80, 100, 60, 120]);
    const kind = pick(["centre", "semi"] as const);
    if (kind === "semi") return mkQ(`Angle in a semicircle is always?`, "90°", distractorsText("90°", ["90°", "180°", "45°", "60°"]), "Thales' theorem: angle in a semicircle is a right angle.");
    return mkQ(`Centre angle ${c}°. Circumference angle on same arc?`, (c / 2) + "°", distractorsText((c / 2) + "°", [`${c}°`, `${c / 2}°`, `${c * 2}°`, "45°"]), "Circumference = centre ÷ 2.");
  },
  "geo-adv-solids": () => {
    const triples: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 12, 15]];
    const [a, b, c] = pick(triples);
    const kind = pick(["hyp", "circle"] as const);
    if (kind === "circle") {
      const r = pick([7, 14, 3]);
      const area = r === 7 ? 154 : r === 14 ? 616 : 28.26;
      const areaStr = r === 3 ? "28.26 cm²" : `${area} cm²`;
      return mkQ(`Area of circle radius ${r} cm (π ≈ 22/7)?`, areaStr, distractorsText(areaStr, ["154 cm²", "616 cm²", "44 cm²", "28.26 cm²"]), `πr² = π × ${r}².`);
    }
    return mkQ(`Right triangle legs ${a} cm, ${b} cm. Hypotenuse?`, c + " cm", distractorsText(c + " cm", [`${c} cm`, `${a + b} cm`, `${c + 2} cm`, "10 cm"]), `√(${a}² + ${b}²) = ${c}.`);
  },
  // ── Trigonometry 1 (always with triangle graphic) ──
  "trig-basics": () => {
    const triples: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 12, 15]];
    const [o, a, h] = pick(triples);
    const fn = pick(["sin", "cos", "tan"] as const);
    const fig: QuizFigure = { kind: "triangle", opp: o, adj: a, hyp: h, angleLabel: "θ" };
    if (fn === "sin") return mkQ(`Look at the triangle. opp = ${o}, hyp = ${h}. Find sin θ.`, `${o}/${h}`, distractorsText(`${o}/${h}`, [`${o}/${h}`, `${a}/${h}`, `${o}/${a}`, `${h}/${o}`]), "sin θ = opposite ÷ hypotenuse.", fig);
    if (fn === "cos") return mkQ(`Look at the triangle. adj = ${a}, hyp = ${h}. Find cos θ.`, `${a}/${h}`, distractorsText(`${a}/${h}`, [`${a}/${h}`, `${o}/${h}`, `${a}/${o}`, `${h}/${a}`]), "cos θ = adjacent ÷ hypotenuse.", fig);
    return mkQ(`Look at the triangle. opp = ${o}, adj = ${a}. Find tan θ.`, `${o}/${a}`, distractorsText(`${o}/${a}`, [`${o}/${a}`, `${a}/${o}`, `${o}/${h}`, `${a}/${h}`]), "tan θ = opposite ÷ adjacent.", fig);
  },
  "trig-solving": () => {
    const triples: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [6, 8, 10]];
    const [o, a, h] = pick(triples);
    const kind = pick(["side", "angle"] as const);
    if (kind === "side") {
      const fig: QuizFigure = { kind: "triangle", opp: o, adj: a, hyp: h, hideSide: "opp" };
      return mkQ(`The triangle shows adj = ${a}, hyp = ${h}, but opp is hidden (?). If sin θ = ${o}/${h}, find the missing side.`, String(o), distractorsNum(o, 3), `opp = ${h} × ${o}/${h} = ${o}.`, fig);
    }
    const fig: QuizFigure = { kind: "triangle", opp: 1, adj: 1, hyp: 1, angleLabel: "θ" };
    const q = pick([
      { p: "sin θ = 1/2. Find θ (0°–90°).", ans: "30°", pool: ["30°", "45°", "60°", "90°"] },
      { p: "cos θ = 1/2. Find θ (0°–90°).", ans: "60°", pool: ["30°", "45°", "60°", "90°"] },
      { p: "tan θ = 1. Find θ (0°–90°).", ans: "45°", pool: ["30°", "45°", "60°", "90°"] },
    ]);
    return mkQ(q.p + " Use the triangle / inverse trig.", q.ans, distractorsText(q.ans, q.pool), "Use sin⁻¹, cos⁻¹ or tan⁻¹.", fig);
  },
  "trig-exact": () => {
    const q = pick([
      { p: "Find sin 30°.", ans: "1/2", pool: ["1/2", "√2/2", "√3/2", "1"] },
      { p: "Find cos 60°.", ans: "1/2", pool: ["1/2", "√2/2", "√3/2", "0"] },
      { p: "Find tan 45°.", ans: "1", pool: ["1", "√3", "1/√3", "0"] },
      { p: "Find sin 60°.", ans: "√3/2", pool: ["1/2", "√2/2", "√3/2", "1"] },
      { p: "Find tan 60°.", ans: "√3", pool: ["√3", "1", "1/√3", "√2"] },
    ]);
    const fig: QuizFigure = { kind: "triangle", opp: 1, adj: 1, hyp: 2, angleDeg: 30, angleLabel: "30°" };
    return mkQ(q.p + " (see 30°–60°–90° triangle)", q.ans, distractorsText(q.ans, q.pool), "Memorise 30°/45°/60° exact values.", fig);
  },
  // ── Coordinate Geometry 1 (always with coordinate plane) ──
  "coord-distance": () => {
    const ax = ri(0, 3), ay = ri(0, 3);
    const dx = pick([3, 4, 5, 6]), dy = pick([4, 3]);
    const bx = ax + dx, by = ay + dy;
    const d = Math.sqrt(dx * dx + dy * dy);
    const dStr = Number.isInteger(d) ? String(Math.round(d)) : d.toFixed(2);
    const fig: QuizFigure = { kind: "coordinate", points: [{ x: ax, y: ay, label: `A(${ax}, ${ay})` }, { x: bx, y: by, label: `B(${bx}, ${by})` }], join: true, showRightTriangle: true, xrange: [-1, 8], yrange: [-1, 8] };
    return mkQ(`Points A(${ax}, ${ay}) and B(${bx}, ${by}) are plotted. Find AB.`, dStr, distractorsNum(Math.round(d), 3), `√(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${dStr}.`, fig);
  },
  "coord-mid-slope": () => {
    const kind = pick(["mid", "slope"] as const);
    const x1 = ri(0, 4), y1 = ri(0, 4), x2 = x1 + ri(2, 4), y2 = y1 + ri(2, 6);
    if (kind === "mid") {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const ans = `(${mx}, ${my})`;
      const fig: QuizFigure = { kind: "coordinate", points: [{ x: x1, y: y1, label: `A(${x1}, ${y1})` }, { x: x2, y: y2, label: `B(${x2}, ${y2})` }], join: true, xrange: [-1, 9], yrange: [-1, 9] };
      return mkQ(`Find the midpoint of A(${x1}, ${y1}) and B(${x2}, ${y2}) shown on the plane.`, ans, distractorsText(ans, [ans, `(${x1}, ${y1})`, `(${x2}, ${y2})`, `(${(x1 + x2)}, ${(y1 + y2)})`]), "Average the x's and the y's.", fig);
    }
    const m = (y2 - y1) / (x2 - x1);
    const mStr = Number.isInteger(m) ? String(m) : m.toFixed(1);
    const fig: QuizFigure = { kind: "coordinate", points: [{ x: x1, y: y1, label: `A(${x1}, ${y1})` }, { x: x2, y: y2, label: `B(${x2}, ${y2})` }], join: true, xrange: [-1, 9], yrange: [-1, 10] };
    return mkQ(`Find the slope between A(${x1}, ${y1}) and B(${x2}, ${y2}) on the plane.`, mStr, distractorsNum(Math.round(m * 2) / 2, 3), `(${y2}−${y1}) ÷ (${x2}−${x1}) = ${mStr}.`, fig);
  },
  "coord-line": () => {
    const m = pick([2, 3, -2, 1]);
    const c = pick([3, -5, 1, 4]);
    const kind = pick(["eq", "intercept"] as const);
    const x1 = 1, y1 = m * 1 + c, x2 = 4, y2 = m * 4 + c;
    const fig: QuizFigure = { kind: "coordinate", points: [{ x: Math.max(0, x1), y: Math.max(0, y1), label: `(${x1}, ${y1})` }, { x: x2, y: Math.max(0, y2), label: `(${x2}, ${y2})` }], join: true, xrange: [-1, 6], yrange: [-6, 10] };
    if (kind === "eq") {
      const ans = `y = ${m}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)}`;
      return mkQ(`Line through the plotted points has slope ${m} and y-intercept ${c}. Its equation?`, ans, distractorsText(ans, [ans, `y = ${m}x + 0`, `x = ${m}y + ${c}`, `y = ${c}x + ${m}`]), "y = mx + c.", fig);
    }
    return mkQ(`What is the y-intercept of y = ${m}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)}? (see plotted line)`, String(c), distractorsNum(c, 3), "c is where x = 0.", fig);
  },
  // ── Statistics advanced ──
  "stats-central": () => {
    const kind = pick(["median", "grouped"] as const);
    if (kind === "median") return mkQ(`Data: 2, 3, 3, 5, 20. Find the median.`, "3", distractorsNum(3, 3), "Sort, then take the middle.", { kind: "bars", values: [2, 3, 3, 5, 20], labels: ["a", "b", "c", "d", "e"] });
    return mkQ(`Estimate mean: value 10 occurs ×2, value 20 occurs ×3.`, "16", distractorsNum(16, 3), "(20 + 60) ÷ 5 = 16.", { kind: "bars", values: [2, 3], labels: ["10", "20"] });
  },
  "stats-spread": () => {
    const kind = pick(["range", "sd"] as const);
    if (kind === "range") {
      const a = [4, 8, 6, 10];
      return mkQ(`Find the range of ${a.join(", ")}.`, "6", distractorsNum(6, 3), "max − min = 10 − 4.", { kind: "bars", values: a, labels: ["a", "b", "c", "d"] });
    }
    return mkQ(`Variance = 4. Standard deviation = ?`, "2", distractorsNum(2, 3), "SD = √variance.", { kind: "bars", values: [2, 4, 4, 5, 7], labels: ["1", "2", "3", "4", "5"] });
  },
  "stats-charts": () => {
    const kind = pick(["iqr", "density"] as const);
    if (kind === "iqr") return mkQ(`Box plot: Q1 = 10, Q3 = 22. IQR = ?`, "12", distractorsNum(12, 3), "Q3 − Q1 = 12.", { kind: "bars", values: [10, 12, 22], labels: ["Q1", "IQR", "Q3"] });
    return mkQ(`Histogram bar 0–10 has frequency 20. Frequency density?`, "2", distractorsNum(2, 3), "20 ÷ 10 = 2.", { kind: "bars", values: [20], labels: ["0-10"] });
  },
  // ── Trigonometry 2 ──
  "trig2-compound": () => {
    const kind = pick(["sin", "cos"] as const);
    if (kind === "sin") return mkQ(`Expand sin(A + B).`, "sin A cos B + cos A sin B", distractorsText("sin A cos B + cos A sin B", ["sin A cos B + cos A sin B", "cos A cos B − sin A sin B", "sin A sin B + cos A cos B", "(tan A + tan B)/(1 − tan A tan B)"]), "Keep the + sign, mix sin and cos.", { kind: "wave", fn: "sin" });
    return mkQ(`cos 75° with 45° + 30° equals?`, "cos45°cos30° − sin45°sin30°", distractorsText("cos45°cos30° − sin45°sin30°", ["cos45°cos30° − sin45°sin30°", "cos45°cos30° + sin45°sin30°", "sin45°cos30° + cos45°sin30°", "1"]), "cos(A+B) = cosAcosB − sinAsinB.", { kind: "wave", fn: "cos" });
  },
  "trig2-double": () => {
    const kind = pick(["sin2", "pyth"] as const);
    if (kind === "pyth") return mkQ(`Simplify sin²θ + cos²θ.`, "1", distractorsText("1", ["1", "0", "2", "sin 2θ"]), "Pythagorean identity.", { kind: "wave", fn: "sin" });
    return mkQ(`sin A = 3/5, cos A = 4/5. Find sin 2A.`, "24/25", distractorsText("24/25", ["24/25", "12/25", "7/25", "1"]), "2 × 3/5 × 4/5.", { kind: "triangle", opp: 3, adj: 4, hyp: 5, angleLabel: "A" });
  },
  "trig2-inverse": () => {
    const q = pick([
      { p: "Find sin⁻¹(1/2) in [0°, 90°].", ans: "30°", pool: ["30°", "45°", "60°", "90°"] },
      { p: "Solve sin θ = 1/2 for 0° ≤ θ < 360°.", ans: "30°, 150°", pool: ["30°, 150°", "30° only", "150°, 210°", "60°, 120°"] },
      { p: "Find cos⁻¹(0) in [0°, 180°].", ans: "90°", pool: ["90°", "0°", "180°", "45°"] },
    ]);
    return mkQ(q.p, q.ans, distractorsText(q.ans, q.pool), "Use the unit circle / CAST quadrants.", { kind: "wave", fn: "sin" });
  },
  // ── Coordinate Geometry 2: circles (always with circle graphic) ──
  "circle-eq": () => {
    const kind = pick(["origin", "shifted"] as const);
    if (kind === "origin") {
      const r = pick([5, 4, 6]);
      return mkQ(`Circle centre (0, 0), radius ${r} is plotted. Its equation?`, `x² + y² = ${r * r}`, distractorsText(`x² + y² = ${r * r}`, [`x² + y² = ${r * r}`, `x² + y² = ${r}`, `(x − ${r})² + y² = 25`, `x + y = ${r}`]), "x² + y² = r².", { kind: "circle", center: { x: 0, y: 0 }, radius: r });
    }
    const h = pick([2, -1, 3]), k = pick([-1, 2, 1]), r = 3;
    const yPart = k >= 0 ? `(y − ${k})` : `(y + ${Math.abs(k)})`;
    const ans = `(x − ${h})² + ${yPart}² = 9`;
    return mkQ(`Circle centre (${h}, ${k}), radius ${r} is plotted. Its equation?`, ans, distractorsText(ans, [ans, `x² + y² = 9`, `(x + ${h})² + (y + ${k})² = 9`, `(x − ${h})² + ${yPart}² = 3`]), "(x − h)² + (y − k)² = r².", { kind: "circle", center: { x: h, y: k }, radius: r });
  },
  "circle-tangent": () => {
    const kind = pick(["eq", "slope"] as const);
    if (kind === "eq") return mkQ(`Circle x² + y² = 25. Tangent at (3, 4) is plotted. Its equation?`, "3x + 4y = 25", distractorsText("3x + 4y = 25", ["3x + 4y = 25", "4x + 3y = 25", "x + y = 5", "3x − 4y = 25"]), "xx₁ + yy₁ = r².", { kind: "circle", center: { x: 0, y: 0 }, radius: 5, point: { x: 3, y: 4, label: "P(3, 4)" } });
    return mkQ(`Radius slope to (3, 4) is 4/3 (see diagram). Tangent slope?`, "-3/4", distractorsText("-3/4", ["-3/4", "4/3", "3/4", "-4/3"]), "Perpendicular: m₁m₂ = −1.", { kind: "circle", center: { x: 0, y: 0 }, radius: 5, point: { x: 3, y: 4, label: "P(3, 4)" } });
  },
  "circle-pos": () => {
    const kind = pick(["inside", "touches"] as const);
    if (kind === "inside") return mkQ(`Point (1, 1) vs circle x² + y² = 25 (see diagram). Inside, on, or outside?`, "inside", distractorsText("inside", ["inside", "on", "outside", "tangent"]), "1 + 1 = 2 < 25.", { kind: "circle", center: { x: 0, y: 0 }, radius: 5, point: { x: 1, y: 1, label: "P(1, 1)" } });
    return mkQ(`How many times does a tangent touch its circle? (see diagram)`, "once", distractorsText("once", ["once", "twice", "never", "three times"]), "Discriminant = 0.", { kind: "circle", center: { x: 0, y: 0 }, radius: 4, point: { x: 4, y: 0, label: "T(4, 0)" } });
  },
  // ── Probability advanced ──
  "prob-rules": () => {
    const kind = pick(["complement", "both"] as const);
    if (kind === "complement") return mkQ(`P(rain) = 0.3. P(no rain)?`, "0.7", distractorsText("0.7", ["0.7", "0.3", "1.3", "0"]), "1 − 0.3.");
    return mkQ(`Two fair coins. P(both heads)?`, "1/4", distractorsText("1/4", ["1/4", "1/2", "3/4", "1/3"]), "1/2 × 1/2.");
  },
  "prob-conditional": () => {
    const kind = pick(["norep", "cond"] as const);
    if (kind === "norep") return mkQ(`Bag 3 red, 2 blue. Two picks, no replacement. P(both red)?`, "3/10", distractorsText("3/10", ["3/10", "9/25", "1/2", "3/5"]), "3/5 × 2/4 = 3/10.");
    return mkQ(`P(A and B) = 0.2, P(B) = 0.5. P(A|B)?`, "0.4", distractorsText("0.4", ["0.4", "0.1", "0.7", "2.5"]), "0.2 ÷ 0.5.");
  },
  "prob-expected": () => {
    const kind = pick(["game", "binom"] as const);
    if (kind === "game") return mkQ(`Game pays £10 with prob 0.2 else £0. Expected value?`, "£2", distractorsText("£2", ["£2", "£5", "£10", "£0.20"]), "10 × 0.2 = 2.");
    const n = pick([10, 20]), p = 0.8;
    return mkQ(`${n} free throws, p = 0.8 each. Expected makes?`, String(Math.round(n * p)), distractorsNum(Math.round(n * p), 3), "n × p.");
  },
  // ── Sequences & series ──
  "seq-arithmetic": () => {
    const a = ri(2, 6), d = ri(2, 5);
    const n = pick([10, 8, 12]);
    const ans = a + (n - 1) * d;
    const kind = pick(["nth", "sum"] as const);
    if (kind === "nth") return mkQ(`AP starts ${a}, ${a + d}, ${a + 2 * d}… Find term ${n}.`, ans, distractorsNum(ans, 3), `${a} + ${n - 1}×${d} = ${ans}.`);
    return mkQ(`Sum 1 + 2 + … + 100 = ?`, "5050", distractorsNum(5050, 3), "100/2 × 101.");
  },
  "seq-geometric": () => {
    const kind = pick(["nth", "inf"] as const);
    if (kind === "nth") return mkQ(`GP: 2, 6, 18… Find the 5th term.`, "162", distractorsNum(162, 3), "2 × 3⁴ = 162.");
    return mkQ(`1 + 1/2 + 1/4 + … to infinity = ?`, "2", distractorsText("2", ["2", "1", "3", "∞"]), "1/(1 − 1/2) = 2.");
  },
  "seq-special": () => {
    const kind = pick(["fib", "tri"] as const);
    if (kind === "fib") return mkQ(`Fibonacci: 1, 1, 2, 3, 5, 8… next?`, "13", distractorsNum(13, 3), "5 + 8 = 13.");
    const n = pick([5, 6, 7]);
    const ans = (n * (n + 1)) / 2;
    return mkQ(`Find the ${n}th triangular number.`, ans, distractorsNum(ans, 3), `${n}×${n + 1}/2 = ${ans}.`);
  },
  // ── Integration calculus ──
  "int-basics": () => {
    const kind = pick(["x2", "3x"] as const);
    if (kind === "x2") return mkQ(`Find ∫x² dx.`, "x³/3 + C", distractorsText("x³/3 + C", ["x³/3 + C", "2x + C", "x²/2 + C", "3x² + C"]), "Add 1 to power, divide.");
    return mkQ(`Find ∫3x dx.`, "3x²/2 + C", distractorsText("3x²/2 + C", ["3x²/2 + C", "3 + C", "x² + C", "6x + C"]), "3 × x²/2.");
  },
  "int-definite": () => {
    const kind = pick(["x", "const"] as const);
    if (kind === "x") return mkQ(`Evaluate ∫₀¹ x dx.`, "1/2", distractorsText("1/2", ["1/2", "1", "2", "0"]), "[x²/2]₀¹ = 1/2.");
    return mkQ(`Evaluate ∫₀² 3 dx.`, "6", distractorsNum(6, 3), "[3x]₀² = 6.");
  },
  "int-apply": () => {
    const kind = pick(["area", "motion"] as const);
    if (kind === "area") return mkQ(`Area under y = x from 0 to 4 = ∫₀⁴ x dx = ?`, "8", distractorsNum(8, 3), "[x²/2]₀⁴ = 8.");
    return mkQ(`v = 2t. Displacement t = 0 → 3 = ∫₀³ 2t dt = ?`, "9", distractorsNum(9, 3), "[t²]₀³ = 9.");
  },
};

/** Default figures so EVERY question in visual lessons shows a graphic, even example-based ones. */
function defaultFigureFor(lessonId: string): QuizFigure | undefined {
  switch (lessonId) {
    case "trig-basics":
    case "trig-solving":
      return { kind: "triangle", opp: 3, adj: 4, hyp: 5, angleLabel: "θ" };
    case "trig-exact":
      return { kind: "triangle", opp: 1, adj: 1, hyp: 2, angleDeg: 30, angleLabel: "30°" };
    case "coord-distance":
      return { kind: "coordinate", points: [{ x: 1, y: 2, label: "A(1, 2)" }, { x: 4, y: 6, label: "B(4, 6)" }], join: true, showRightTriangle: true, xrange: [-1, 7], yrange: [-1, 8] };
    case "coord-mid-slope":
      return { kind: "coordinate", points: [{ x: 2, y: 4, label: "A(2, 4)" }, { x: 6, y: 10 - 2, label: "B(6, 8)" }], join: true, xrange: [-1, 8], yrange: [-1, 10] };
    case "coord-line":
      return { kind: "coordinate", points: [{ x: 0, y: 3, label: "(0, 3)" }, { x: 3, y: 9 - 2, label: "(3, 7)" }], join: true, xrange: [-1, 6], yrange: [-2, 10] };
    case "circle-eq":
      return { kind: "circle", center: { x: 0, y: 0 }, radius: 5 };
    case "circle-tangent":
      return { kind: "circle", center: { x: 0, y: 0 }, radius: 5, point: { x: 3, y: 4, label: "P(3, 4)" } };
    case "circle-pos":
      return { kind: "circle", center: { x: 0, y: 0 }, radius: 5, point: { x: 1, y: 1, label: "P(1, 1)" } };
    case "trig2-compound":
    case "trig2-double":
    case "trig2-inverse":
      return { kind: "wave", fn: "sin" };
    default:
      return undefined;
  }
}

export function getQuizForLesson(lesson: Lesson, count=5): QuizQ[] {
  const g = gens[lesson.id];
  const qs: QuizQ[] = [];
  // first include example-based Qs
  for(const ex of lesson.examples.slice(0,2)){
    const ans = ex.a.replace("£","").replace("°","").trim();
    // try numeric distractors, else text
    const num = parseFloat(ans.replace(/[^0-9.\-]/g,""));
    let opts: string[] | undefined;
    if(!isNaN(num) && String(num)===ans.replace(/,/g,"") || !isNaN(num) && ans.match(/^[0-9.\-]+$/)){
      opts = distractorsNum(num,3).map(String);
    } else {
      // text: create options from other examples
      const pool = lesson.examples.map(e=>e.a).concat(["Unknown","None","42"]);
      opts = distractorsText(ans, pool);
    }
    qs.push({ id: Math.random().toString(36).slice(2,7), prompt: ex.q, options: shuffle(opts.includes(ans)?opts:[ans, ...opts.slice(0,3)]), answer: ans, explanation: ex.s.join(" "), figure: defaultFigureFor(lesson.id) });
  }
  while(qs.length<count){
    if(g){
      const q=g();
      // avoid duplicate prompts
      if(!qs.find(x=>x.prompt===q.prompt)) qs.push(q);
    } else {
      // fallback generic true/false from keyPoint
      const kp = pick(lesson.keyPoints);
      qs.push(mkQ(`True or False: ${kp}`, "True", distractorsText("True",["True","False"]), kp));
    }
  }
  return shuffle(qs).slice(0,count);
}

export interface Flashcard { id: string; front: string; back: string; frontHint?: string; backHint?: string; }

export function getFlashcardsForLesson(lesson: Lesson): Flashcard[] {
  const cards: Flashcard[] = [];
  lesson.keyPoints.forEach((kp, i)=>{
    cards.push({
      id: `kp-${i}`,
      front: lesson.title,
      back: kp,
      frontHint: `Key Point ${i+1}`,
      backHint: "Tap to flip back"
    });
  });
  lesson.examples.forEach((ex, i)=>{
    cards.push({
      id: `ex-${i}`,
      front: ex.q,
      back: `Answer: ${ex.a}`,
      frontHint: "Worked Example",
      backHint: ex.s.join(" • ")
    });
  });
  // if less than 5, duplicate with variation
  return cards;
}
