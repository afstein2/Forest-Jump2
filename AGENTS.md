# FaceClicker — AGENTS.md

## Project Overview

Simple Phaser 3.80 game.

## Running

Serve the project root with any static HTTP server such as the Visual Studio Code Live Server plugin.

Open `index.html` in a browser. No build step.

## Architecture

- **`index.html`** — Loads Phaser 3.80 via jsDelivr CDN, then `main.js` and `src/GameScene.js` via `<script>` tags (order matters: `main.js` references `GameScene` global, so `GameScene.js` must load first in the HTML).
- **`main.js`** — Creates the `Phaser.Game` instance with the standard config object (800×600 canvas, `Phaser.AUTO` renderer, white background). References `GameScene` as a global class.
- **`src/GameScene.js`** — Single scene class (`GameScene`). 

## Asset Naming Convention

Assets in `assets/` follow the pattern `{color}_body_{shape}.png` and `face_{expression}_{eye_state}.png`.

## Key Conventions

- No module bundler — plain `<script>` tags, classes as globals.
- `GameScene` is declared as a global class; `main.js` references it by name in the config.
- Scene uses Phaser 3 image keys (string identifiers) to reference loaded textures, not file paths.
- `setInteractive()` + `on('pointerdown', ...)` is the click-handling pattern.

## Gotchas

- **Script order in `index.html`**: `src/GameScene.js` must be loaded before `main.js`, because `main.js` references the `GameScene` global in the config object. If order is reversed, `GameScene` will be `undefined` at game creation time.
- **Static server required**: Phaser's `this.load.image()` fetches via HTTP. Opening `index.html` directly as `file://` will cause asset loading to fail silently or with CORS errors.
- **No TypeScript, no bundler**: All JS is plain ES5+/ES6 class syntax loaded directly in the browser.
