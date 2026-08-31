# 🧮 Math Aura

Learn maths through play! A mobile-first Progressive Web App (PWA) with maths mini games, structured lessons, and a progress-tracking profile. Installable on phones and runs in any browser.

## Features

### 🎮 Mini Games
- **Math Racing** — Answer questions correctly to speed your car past the rival to the finish line. Wrong answers let the rival catch up, and the clock is always ticking.
- **Tower Defence** — Correct answers fire bolts at incoming monsters and power up your tower. Wrong answers weaken it. Survive 5 waves to win.

### 📚 Learn
11 chapters covering the core maths curriculum, each with lessons of key points and worked examples:

Numbers & Place Value · Addition & Subtraction · Multiplication & Division · Fractions · Decimals · Percentages · Ratio & Proportion · Algebra · Geometry · Measurement · Statistics & Probability

### 👤 Profile
- XP and leveling (level up as you earn XP from games and lessons)
- Per-topic accuracy tracking
- 9 unlockable achievements (streaks, wins, milestones)
- Complete game, lesson, and accuracy statistics

### PWA
- Installable on iOS/Android/desktop via the manifest + icons
- Full offline support via a caching service worker
- Mobile-first layout with a bottom navigation bar (adapts to desktop)

## Tech

Vanilla HTML/CSS/JavaScript ES modules — no build step, no dependencies. Everything is cached locally in your browser (localStorage).

## Run it

Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

For the service worker to register, serve over `http://localhost` (or HTTPS) — `file://` won't work.

## Project structure

```
index.html               app shell + bottom nav
manifest.webmanifest     PWA manifest
sw.js                    service worker (offline cache)
css/styles.css           mobile-first styles
js/app.js                routing + view switching
js/storage.js            state, XP, achievements, stats
js/questions.js          question/topic generator
js/learn.js              chapters, lessons, worked examples
js/profile.js            profile screen
js/games/common.js       shared quiz/config/result helpers
js/games/racing.js       Math Racing game
js/games/tower.js        Tower Defence game
icons/                   generated app icons
```

## How games award progress

- Every answer updates your per-topic accuracy.
- Correct answers build streaks; streaks power up Tower Defence bolts.
- Winning a race or defending all 5 waves grants bonus XP + difficulty bonuses.
- Completing lessons grants XP and counts toward achievements.