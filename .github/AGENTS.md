# Development AGENTS.md — Contributing to simple-canvas-library

This file is for AI coding agents working on the **development** of simple-canvas-library itself. If you are using the library in a project, see the root `AGENTS.md`.

## Project Overview

simple-canvas-library is a beginner-friendly TypeScript library for interactive canvas graphics and simple games. It has zero runtime dependencies.

## Repository Structure

```
src/
├── index.ts              # Main exports
├── GameCanvas.ts         # Core animation loop + event handling
├── GameInterface.ts      # GameCanvas + UI bars/dialogs
├── Sprite.ts             # Sprite sheet animation
├── types.ts              # Shared TypeScript types
├── UI.ts                 # UI component re-exports
├── UIBar.ts              # Top/bottom bar containers
├── Button.ts             # Button UI component
├── Slider.ts             # Slider UI component
├── NumberInput.ts        # Number input UI component
├── types/                # Additional type declarations
demo-scripts/             # Demo source files (.js)
demos/                    # Generated demo HTML (do not edit directly)
dist/                     # Build output (UMD + ES modules)
docs/                     # Generated TypeDoc documentation
demo-config.json          # Demo ordering/categorization config
build-demos.js            # Demo HTML generator script
demo-manager.js           # CLI tool for managing demo organization
vite.config.ts            # Vite build config (library mode + demo watcher)
tsconfig.json             # TypeScript config (ES2020, strict)
```

## Build Commands

```bash
npm run dev              # Start Vite dev server with demo hot-reload
npm run build            # Build library: vite build (bundles) + tsc (declarations)
npm run build:demos      # Regenerate demo HTML from demo-scripts/
npm run docs             # Generate TypeDoc HTML documentation
npm run demo:list        # Show current demo organization
npm run demo:manage      # Manage demo ordering/categorization
```

There is **no test suite** currently. Validate changes manually by running `npm run dev` and checking the demos in the browser.

## Build Outputs

- `dist/simple-canvas-library.umd.cjs` — UMD bundle for `<script>` tags
- `dist/simple-canvas-library.es.js` — ES module bundle
- `dist/index.d.ts` — TypeScript declarations

## Architecture Notes

### GameCanvas (core)

- `GameCanvas` creates the animation loop using `requestAnimationFrame`.
- **The canvas is auto-cleared every frame** in `doDrawing()` via `ctx.clearRect(0, 0, width, height)` before iterating over registered drawings. Users do not need to clear manually.
- Drawings are stored in a flat array; `addDrawing()` returns an index used as an ID. Metadata (start times, off/on state) is tracked in a parallel array.
- Event handlers are registered on the canvas element in `setupHandlers()`. The canvas `tabIndex` is set to make it focusable for keyboard events.
- Auto-resize uses `ResizeObserver` to match canvas bitmap to CSS display size.

### GameInterface

- Extends `GameCanvas`. Creates its own `<canvas>` element and wraps it in a container `<div>` with optional top/bottom bars.
- Supports three sizing modes: auto-resize (default), fixed size, and scale-to-fit (CSS container queries).
- UI components (`Button`, `Slider`, `NumberInput`) are added to `UIBar` instances via fluent methods.

### Sprite

- Loads a sprite sheet image and draws individual frames using `drawImage` source clipping.
- Has a `draw(params: DrawingParams)` method so it can be passed directly to `addDrawing()`.
- Frame animation advances based on `stepTime` and `frameRate` each tick.

## Adding a New Demo

1. Create a `.js` file in `demo-scripts/` with the metadata comment at top:

```javascript
/**
 * @demo Demo Title
 * @description Short description of what it demonstrates.
 * @tags tag1, tag2, tag3
 */
import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");
// ... your demo code ...
game.run();
```

2. Run `npm run build:demos` to generate the HTML.
3. Optionally configure ordering in `demo-config.json` or use `npm run demo:manage`.

The demo build system reads the `@demo`, `@description`, and `@tags` JSDoc comments and generates self-contained HTML pages that display both the running demo and its source code.

## Code Conventions

- **TypeScript** with strict mode enabled.
- **ES2020** target (no need for older polyfills).
- **No runtime dependencies** — the library must remain zero-dependency.
- **DOM-only** — all UI is created with `document.createElement`, no frameworks.
- Source files use 2-space indentation.
- Public API methods have JSDoc comments with `@example` blocks where appropriate.
- Type exports are in `types.ts`; prefer using the shared types.

## Key Types

```typescript
type DrawingParams = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  elapsed: number;
  timestamp: number;
  stepTime: number;
  remove: () => void;
};

type DrawingCallback = (params: DrawingParams) => void;

type Drawer = { draw: DrawingCallback };

type Size = { width: number; height: number };
```

## Things to Watch Out For

- **`demos/` is generated** — never edit files in `demos/` directly; edit `demo-scripts/` source files and rebuild.
- **`docs/` is generated** — regenerate with `npm run docs` after API changes.
- **`dist/` is generated** — rebuild with `npm run build`.
- The `README.md` Quick Start example includes `ctx.clearRect()` which is actually unnecessary — it is kept for pedagogical clarity since beginners may read it outside the context of the library's auto-clear behavior. Keep this in mind when updating examples.
- Canvas keyboard events require the canvas to have focus (`tabIndex` is set automatically).
- `addDrawing` returns an array index, not a unique ID. Removing and re-adding creates new indices; old indices are just marked as `off`.
