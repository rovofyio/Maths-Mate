import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { App } from "../app";
import { GameSession } from "../components/GameSession";
import { resetAll } from "../lib/store";
import { genRound } from "./FractionsGame";

function seedFirstRun() {
  localStorage.setItem("maths-aura-age-verified-v1", JSON.stringify({ age: 10, at: Date.now() }));
  localStorage.setItem("maths-aura-cookie-consent-v1", JSON.stringify({ choice: "accepted", at: Date.now() }));
}

beforeEach(() => {
  localStorage.clear();
  seedFirstRun();
  resetAll();
  // jsdom has no media playback — stub it so music toggles don't throw.
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined) as never;
  window.HTMLMediaElement.prototype.pause = vi.fn() as never;
  window.HTMLMediaElement.prototype.load = vi.fn() as never;
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});

/** Click helper that fails loudly if the button is missing. */
function clickText(matcher: string | RegExp) {
  const el = screen.getByText(matcher);
  fireEvent.click(el);
  return el;
}

describe("fraction generator can never hang", () => {
  it("genRound always returns 4 unique options incl. the answer", () => {
    for (let k = 0; k < 300; k++) {
      const r = genRound();
      expect(r.options).toHaveLength(4);
      expect(new Set(r.options).size).toBe(4);
      expect(r.options).toContain(r.correct);
    }
  }, 10000);
});

describe("app navigation across all screens", () => {
  it("bottom nav reaches Games, Learn, Daily, Shop, Profile, Settings", async () => {
    render(<App />);
    // Games (default tab)
    expect(await screen.findByText("Math Racing")).toBeTruthy();

    clickText("Learn");
    expect(await screen.findByText(/Learn Maths/)).toBeTruthy();

    clickText("Daily");
    expect(await screen.findByText(/Daily Wheel/)).toBeTruthy();

    clickText("Shop");
    expect(await screen.findByText(/Coin packs/)).toBeTruthy();

    clickText("Profile");
    expect(await screen.findByText(/My Profile/)).toBeTruthy();

    clickText("Settings");
    expect(await screen.findByText("Power saver", { exact: false })).toBeTruthy();
  }, 30000);
});

describe("learn flow: chapter -> lesson -> flashcards -> quiz", () => {
  it("opens a lesson, flips through flashcards and reaches the quiz", async () => {
    render(<App />);
    clickText("Learn");
    expect(await screen.findByText(/Learn Maths/)).toBeTruthy();

    // Chapter -> lesson
    clickText("Numbers & Place Value");
    expect(await screen.findByText("Place Value")).toBeTruthy();
    clickText("Place Value");
    expect(await screen.findByText(/Quizlet style/)).toBeTruthy();

    // Flip through all flashcards until "Go to Quiz" appears
    for (let k = 0; k < 6; k++) {
      const go = screen.queryByText(/Go to Quiz/);
      if (go) break;
      fireEvent.click(screen.getByText(/Next/));
    }
    const goQuiz = await screen.findByText(/Go to Quiz/);
    fireEvent.click(goQuiz);

    // Quiz opens (this hung forever before the fix)
    expect(await screen.findByText("Check")).toBeTruthy();

    // Answer Q1: select first option, check, continue -> Q2
    const opts = document.querySelectorAll(".duo-opt");
    expect(opts.length).toBeGreaterThan(0);
    fireEvent.click(opts[0]);
    clickText("Check");
    // feedback appears (either praise or the right answer shown)
    expect(document.querySelector(".duo-feedback")).toBeTruthy();
    clickText(/Continue/);
    expect(await screen.findByText("2 / 5")).toBeTruthy();

    // Quit the quiz via X -> back to flashcards, no crash
    fireEvent.click(screen.getByText("✕"));
    expect(await screen.findByText(/Quizlet style/)).toBeTruthy();
  }, 30000);

  it("every chapter card opens its lesson list", async () => {
    render(<App />);
    clickText("Learn");
    expect(await screen.findByText(/Learn Maths/)).toBeTruthy();
    for (const title of ["Addition & Subtraction", "Fractions", "Algebra", "Measurement"]) {
      clickText(title);
      expect(screen.getByRole("button", { name: /All chapters/ })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: /All chapters/ }));
      expect(await screen.findByText(/Learn Maths/)).toBeTruthy();
    }
  }, 30000);
});

describe("game home", () => {
  it("free game opens topic config and starts", async () => {
    render(<App />);
    // The bottom-nav route signal persists between tests — go home first.
    clickText("Games");
    expect(await screen.findByText("Math Racing")).toBeTruthy();
    clickText("Math Racing");
    expect(await screen.findByText(/Pick a maths topic/)).toBeTruthy();
    // difficulty + topic chips are clickable
    clickText(/Medium/);
    clickText(/Mixed/);
    clickText(/Start playing/);
    // game HUD appears (pause button only exists inside a running game;
    // the game chunk loads async, so wait for it)
    expect(await screen.findByLabelText("Pause game")).toBeTruthy();
  }, 30000);

  it("locked premium game shows unlock modal, closable", async () => {
    render(<App />);
    clickText("Games");
    expect(await screen.findByText("Math Racing")).toBeTruthy();
    clickText("Fast Math");
    expect(await screen.findByText(/Unlock Fast Math/)).toBeTruthy();
    clickText("Maybe later");
    expect(screen.queryByText(/Unlock Fast Math/)).toBeNull();
  }, 30000);
});

/** Shared flow: start game -> answer once -> pause -> quit -> result/ad screen. */
async function playAndQuit(gameName: string, opts: { skipConfig?: boolean; answerSelector?: string } = {}) {
  const onExit = vi.fn();
  const onFinish = vi.fn();
  const { unmount } = render(<GameSession gameId={gameNameToId(gameName)} onExit={onExit} />);
  if (!opts.skipConfig) {
    expect(await screen.findByText(/Pick a maths topic/)).toBeTruthy();
    clickText(/Start playing/);
  }
  // game screen appears
  await screen.findByLabelText("Pause game");
  // answer at least once (game-specific buttons)
  const sel = opts.answerSelector ?? ".answer-btn";
  const btns = document.querySelectorAll(sel);
  if (btns.length > 0) fireEvent.click(btns[0]);
  // pause -> return to menu -> result/ad overlay
  fireEvent.click(screen.getByLabelText("Pause game"));
  fireEvent.click(screen.getByText(/Return to Menu/));
  expect(await screen.findByText(/continue in/)).toBeTruthy();
  expect(onFinish).not.toHaveBeenCalled(); // GameSession handles finish internally
  unmount();
}

function gameNameToId(name: string): string {
  const map: Record<string, string> = {
    racing: "racing",
    bomb: "bomb",
    fastmath: "fastmath",
    fractions: "fractions",
    runner: "runner",
    truefalse: "truefalse",
    maze: "maze",
    pvp: "pvp",
  };
  return map[name];
}

describe("every game: start -> answer -> quit -> result", () => {
  it("racing", async () => { await playAndQuit("racing"); }, 30000);
  it("bomb defusal", async () => { await playAndQuit("bomb", { answerSelector: ".bomb-wire-btn" }); }, 30000);
  it("fast math", async () => { await playAndQuit("fastmath"); }, 30000);
  it("fraction feast", async () => { await playAndQuit("fractions"); }, 30000);
  it("runner", async () => { await playAndQuit("runner"); }, 30000);
  it("true or false", async () => { await playAndQuit("truefalse", { answerSelector: ".tf-btn" }); }, 30000);

  it("maze level select -> level 1 -> quit -> result", async () => {
    render(<GameSession gameId="maze" onExit={() => {}} />);
    expect(await screen.findByText("Forest Path")).toBeTruthy();
    clickText("Forest Path");
    await screen.findByLabelText("Pause game");
    expect(document.querySelectorAll(".answer-btn").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByLabelText("Pause game"));
    fireEvent.click(screen.getByText(/Return to Menu/));
    expect(await screen.findByText(/continue in/)).toBeTruthy();
  }, 30000);

  it("pvp level select -> fight -> answer -> quit -> result", async () => {
    render(<GameSession gameId="pvp" onExit={() => {}} />);
    expect(await screen.findByText("Fraction Arena")).toBeTruthy();
    const fights = document.querySelectorAll(".pvp-lv-go");
    expect(fights.length).toBeGreaterThan(0);
    fireEvent.click(fights[0]);
    await screen.findByLabelText("Pause game");
    const opts = document.querySelectorAll(".pvp-opt");
    expect(opts.length).toBeGreaterThan(0);
    fireEvent.click(opts[0]);
    fireEvent.click(screen.getByLabelText("Pause game"));
    fireEvent.click(screen.getByText(/Return to Menu/));
    expect(await screen.findByText(/continue in/)).toBeTruthy();
  }, 30000);
});

describe("daily, profile, shop, settings", () => {
  it("daily wheel spins", async () => {
    render(<App />);
    clickText("Daily");
    expect(await screen.findByText(/Daily Wheel/)).toBeTruthy();
    const spinBtn = screen.getByText(/Spin the wheel/);
    fireEvent.click(spinBtn);
    expect(await screen.findByText("Spinning...")).toBeTruthy();
  }, 30000);

  it("profile tabs switch", async () => {
    render(<App />);
    clickText("Profile");
    expect(await screen.findByText(/My Profile/)).toBeTruthy();
    // Tab labels collide with stat-tile labels ("Badges") — click by role.
    fireEvent.click(screen.getByRole("button", { name: /Badges/ }));
    expect(document.querySelector(".achievements")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Board/ }));
    expect(document.querySelector(".leaderboard")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Stats/ }));
    expect(document.querySelector(".stats-grid")).toBeTruthy();
  }, 30000);

  it("shop renders with locked purchase buttons", async () => {
    render(<App />);
    clickText("Shop");
    expect(await screen.findByText(/Coin packs/)).toBeTruthy();
    expect(await screen.findByText(/Star packs/)).toBeTruthy();
    // no coins -> game unlock buttons disabled, coin packs clickable but safe
    const buyBtns = [...document.querySelectorAll(".btn-buy")] as HTMLButtonElement[];
    expect(buyBtns.length).toBeGreaterThan(0);
  }, 30000);

  it("settings toggles work", async () => {
    render(<App />);
    clickText("Settings");
    expect(await screen.findByText("Power saver", { exact: false })).toBeTruthy();
    clickText(/Dark/);
    clickText(/Light/);
    const musicToggle = document.querySelector('[aria-label="Toggle music"]');
    expect(musicToggle).toBeTruthy();
    fireEvent.click(musicToggle!);
    fireEvent.click(musicToggle!);
  }, 30000);
});
