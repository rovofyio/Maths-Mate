export interface SpinPrize {
  coins: number;
  xp: number;
  label: string;
  weight: number;
}

export const SPIN_PRIZES: SpinPrize[] = [
  { coins: 100, xp: 20, label: "100 coins", weight: 30 },
  { coins: 50, xp: 30, label: "50 coins + XP", weight: 25 },
  { coins: 200, xp: 10, label: "200 coins", weight: 15 },
  { coins: 500, xp: 0, label: "500 coins", weight: 8 },
  { coins: 25, xp: 15, label: "25 coins + XP", weight: 15 },
  { coins: 1000, xp: 100, label: "JACKPOT!", weight: 2 },
  { coins: 0, xp: 80, label: "80 XP", weight: 5 },
];

export function spinWheel(): SpinPrize {
  const total = SPIN_PRIZES.reduce((a, p) => a + p.weight, 0);
  let roll = Math.random() * total;
  for (const prize of SPIN_PRIZES) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return SPIN_PRIZES[0];
}

export function weightedIndex(): number {
  const total = SPIN_PRIZES.reduce((a, p) => a + p.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < SPIN_PRIZES.length; i++) {
    roll -= SPIN_PRIZES[i].weight;
    if (roll <= 0) return i;
  }
  return 0;
}