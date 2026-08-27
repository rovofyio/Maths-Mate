import type { GameMeta } from "../types";

export const GAMES: GameMeta[] = [
  { id: "racing", name: "Math Racing", emoji: "🏎️", color: "#e74c3c", blurb: "Answer fast to zoom your car past the rival.", ages: [6, 18], free: true, tag: "Fast · 8 answers" },
  { id: "tower", name: "Tower Defence", emoji: "🏰", color: "#6c5ce7", blurb: "Correct answers fire bolts and power up your tower.", ages: [6, 18], free: true, tag: "Strategic · 5 waves" },
  { id: "balloon", name: "Balloon Pop", emoji: "🎈", color: "#e84393", blurb: "Pop the balloon with the right answer before it floats away.", ages: [5, 10], free: true, tag: "Fun · 12 questions" },
  { id: "fastmath", name: "Fast Math", emoji: "⏱️", color: "#f39c12", blurb: "How many questions can you solve in 60 seconds?", ages: [7, 18], free: true, tag: "Race the clock" },
  { id: "maze", name: "Maths Maze", emoji: "🧩", color: "#1abc9c", blurb: "Navigate the maze by answering maths questions.", ages: [6, 15], free: true, tag: "Puzzle · 5 levels" },

  { id: "pvp", name: "Monster PvP", emoji: "⚔️", color: "#8e44ad", blurb: "Pokémon-style PvP: maths hits deal 5/2/0 DMG. Calculus, surds & fractions.", ages: [12, 18], free: false, tag: "Premium · PvP" },
  { id: "fractions", name: "Fraction Feast", emoji: "🍕", color: "#e17055", blurb: "Serve the pizza slice that matches the fraction.", ages: [8, 14], free: false, tag: "Premium" },
  { id: "runner", name: "Math Runner", emoji: "🏃", color: "#00cec9", blurb: "Dodge wrong answers on an endless run.", ages: [6, 18], free: false, tag: "Premium" },
  { id: "truefalse", name: "True or False", emoji: "⚖️", color: "#a29bfe", blurb: "Race the clock judging true or false statements.", ages: [7, 18], free: false, tag: "Premium" },
];

export function getGame(id: string): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

export const FREE_GAMES = GAMES.filter((g) => g.free).length;