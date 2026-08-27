import type { Lesson } from "../data/chapters";

export interface QuizQ {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
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
function mkQ(prompt: string, answer: string|number, opts?: string[], exp?: string): QuizQ {
  const ansStr = String(answer);
  const options = opts ?? distractorsNum(typeof answer==="number"?answer as number: parseInt(ansStr)||0,3);
  // ensure answer in opts
  if(!options.includes(ansStr)){
    const r = shuffle(options);
    r[0]=ansStr;
    return { id: Math.random().toString(36).slice(2,7), prompt, options: shuffle(r), answer: ansStr, explanation: exp };
  }
  return { id: Math.random().toString(36).slice(2,7), prompt, options: shuffle(options), answer: ansStr, explanation: exp };
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
};

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
    qs.push({ id: Math.random().toString(36).slice(2,7), prompt: ex.q, options: shuffle(opts.includes(ans)?opts:[ans, ...opts.slice(0,3)]), answer: ans, explanation: ex.s.join(" ") });
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
      frontHint: `Key Point ${i+1} — tap to reveal`,
      backHint: "Tap to flip back"
    });
  });
  lesson.examples.forEach((ex, i)=>{
    cards.push({
      id: `ex-${i}`,
      front: ex.q,
      back: `Answer: ${ex.a}`,
      frontHint: "Worked Example — tap to reveal",
      backHint: ex.s.join(" • ")
    });
  });
  // if less than 5, duplicate with variation
  return cards;
}
