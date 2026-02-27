# AGENTS.md — Using simple-canvas-library

This file is for AI coding agents that are **using** simple-canvas-library to build canvas apps, games, or animations. If you are contributing to the library itself, see `.github/AGENTS.md`.

## Key Concept: The Animation Loop

`GameCanvas` runs an animation loop via `requestAnimationFrame`. You register drawing functions with `addDrawing()`, and they are called **every frame** automatically.

**You do NOT need to call `ctx.clearRect()` — the library clears the entire canvas automatically before each frame.** This is the most common mistake agents make.

```javascript
import { GameCanvas } from "simple-canvas-library";

const game = new GameCanvas("my-canvas");

// ✅ CORRECT — just draw, the canvas is already cleared for you
game.addDrawing(({ ctx, elapsed, width, height }) => {
  const x = (elapsed / 10) % width;
  ctx.beginPath();
  ctx.arc(x, height / 2, 20, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
});

game.run();
```

```javascript
// ❌ WRONG — do NOT manually clear, it's already done
game.addDrawing(({ ctx, width, height }) => {
  ctx.clearRect(0, 0, width, height); // UNNECESSARY — remove this line
  ctx.fillRect(50, 50, 100, 100);
});
```

## Drawing Function Parameters

Every function passed to `addDrawing()` receives a single object with these properties:

| Parameter   | Type                       | Description                                      |
|-------------|----------------------------|--------------------------------------------------|
| `ctx`       | `CanvasRenderingContext2D`  | The canvas 2D drawing context                    |
| `width`     | `number`                   | Current canvas width in pixels                   |
| `height`    | `number`                   | Current canvas height in pixels                  |
| `elapsed`   | `number`                   | Milliseconds since the first frame               |
| `timestamp` | `number`                   | Current `requestAnimationFrame` timestamp        |
| `stepTime`  | `number`                   | Milliseconds since the previous frame (~16ms)    |
| `remove`    | `() => void`               | Call this to remove this drawing from the loop    |

### Using `elapsed` vs `stepTime`

- Use **`elapsed`** for position-from-time calculations (e.g., `x = elapsed / 10`). The position is always deterministic regardless of frame rate.
- Use **`stepTime`** for velocity-based updates (e.g., `x += speed * stepTime / 1000`). This is better for physics simulations where you accumulate changes each frame.

## Adding and Removing Drawings

```javascript
// addDrawing returns a numeric ID
const id = game.addDrawing(({ ctx }) => {
  ctx.fillRect(10, 10, 50, 50);
});

// Remove it later
game.removeDrawing(id);

// Restore it (start drawing again)
game.restoreDrawing(id);

// Replace it with a new function
game.replaceDrawing(id, ({ ctx }) => {
  ctx.fillRect(20, 20, 80, 80);
});
```

You can also use the `remove` callback parameter from inside a drawing to remove itself:

```javascript
game.addDrawing(({ ctx, elapsed, width, remove }) => {
  const x = elapsed / 20;
  ctx.fillRect(x, 20, 20, 20);
  if (x > width) {
    remove(); // Stop drawing when off-screen
  }
});
```

## Drawing Objects (Alternative to Functions)

Instead of a function, you can pass an object with a `draw` method. This is useful for encapsulating state:

```javascript
game.addDrawing({
  x: 0,
  y: 0,
  draw({ ctx, stepTime, width, height }) {
    this.x += stepTime / 20;
    this.y += stepTime / 20;
    if (this.x > width) this.x = 0;
    if (this.y > height) this.y = 0;
    ctx.fillRect(this.x, this.y, 50, 50);
  },
});
```

## Event Handling

```javascript
// Click handler (convenience method)
game.addClickHandler(({ x, y }) => {
  console.log(`Clicked at ${x}, ${y}`);
});

// Generic event handler
game.addHandler("mousemove", ({ x, y }) => {
  console.log(`Mouse at ${x}, ${y}`);
});

// Keyboard events (canvas must have focus)
game.addHandler("keydown", ({ event }) => {
  console.log(`Key pressed: ${event.key}`);
});

// Supported event types:
// click, dblclick, mousedown, mousemove, mouseup, keyup, keydown, keypress, resize
```

Event handlers receive `{ x, y, type, event }` for mouse events and `{ type, event }` for keyboard events. Return `true` from a handler to stop other handlers from firing.

## Sprites

```javascript
import { Sprite } from "simple-canvas-library";

const sprite = new Sprite({
  src: "spritesheet.png",   // URL to sprite sheet image
  frameWidth: 32,            // Width of one frame (required)
  frameHeight: 32,           // Height of one frame (required)
  x: 100,                   // Position on canvas
  y: 100,
  animate: true,             // Auto-advance frames (default: true)
  frameRate: 12,             // Frames per second (default: 24)
  repeat: true,              // Loop animation (default: true)
});

// Sprites have a draw() method, so pass them directly to addDrawing
game.addDrawing(sprite);
```

### Sprite Update Callback

Use the `update` callback to move or modify the sprite each frame:

```javascript
const sprite = new Sprite({
  src: "player.png",
  frameWidth: 64,
  frameHeight: 64,
  update(sprite, { stepTime, width }) {
    sprite.x += stepTime / 10;
    if (sprite.x > width) sprite.x = 0;
  },
});
```

### Sprite Options

| Option           | Default     | Description                                      |
|------------------|-------------|--------------------------------------------------|
| `src`            | (required)  | URL of the sprite sheet image                    |
| `frameWidth`     | (required)  | Pixel width of each frame                        |
| `frameHeight`    | (required)  | Pixel height of each frame                       |
| `x`, `y`         | `0`         | Position on canvas                               |
| `animate`        | `true`      | Whether to auto-advance frames                   |
| `frameRate`      | `24`        | Frames per second for animation                  |
| `repeat`         | `true`      | Loop animation or play once                      |
| `frameSequence`  | all frames  | Custom frame order, e.g., `[0, 1, 2, 1]`        |
| `frames`         | auto        | Total frame count (overrides auto-calculation)   |
| `targetWidth`    | frameWidth  | Drawn width on canvas                            |
| `targetHeight`   | frameHeight | Drawn height on canvas                           |
| `angle`          | `undefined` | Rotation angle in radians                        |
| `flipHorizontal` | `false`     | Mirror the sprite horizontally                   |
| `update`         | `undefined` | Callback `(sprite, drawingParams) => void`       |

## GameInterface (Canvas + UI Controls)

`GameInterface` extends `GameCanvas` with built-in UI bars, buttons, sliders, and dialogs:

```javascript
import { GameInterface } from "simple-canvas-library";

const gi = new GameInterface({
  canvasSize: { width: 800, height: 600 },
  parent: document.getElementById("app"), // optional, defaults to document.body
});

// Add a top bar with buttons
const topBar = gi.addTopBar();
topBar.addButton({ text: "Start", onclick: () => gi.run() });
topBar.addButton({ text: "Pause", onclick: () => gi.pause() });

// Add a bottom bar with controls
const bottomBar = gi.addBottomBar();
bottomBar.addSlider({
  label: "Speed",
  min: 1, max: 10, value: 5,
  oninput: (val) => console.log("Speed:", val),
});
bottomBar.addNumberInput({
  label: "Count",
  min: 1, max: 100, value: 10,
  oninput: (val) => console.log("Count:", val),
});

// Drawing works the same as GameCanvas
gi.addDrawing(({ ctx, elapsed, width, height }) => {
  // draw your game here
});

gi.run();
```

### GameInterface Configuration

| Option           | Default        | Description                                      |
|------------------|----------------|--------------------------------------------------|
| `canvasSize`     | auto           | Fixed logical canvas size `{ width, height }`    |
| `autoresize`     | `true`         | Resize canvas bitmap to match display size       |
| `scaleToFit`     | `false`        | Scale display while keeping fixed logical size   |
| `parent`         | `document.body`| Container element to append to                   |
| `fullscreen`     | `false`        | Fill the entire viewport                         |
| `cssVars`        | `{}`           | CSS variable overrides for theming               |

### GameInterface Methods

- `gi.run()` / `gi.stop()` / `gi.pause()` / `gi.resume()` / `gi.reset()` — game lifecycle
- `gi.addTopBar()` / `gi.addBottomBar()` — returns a `UIBar` for adding controls
- `gi.dialog(title, message?, onClose?)` — show a modal dialog
- `gi.getGameState()` — returns `"stopped"`, `"running"`, or `"paused"`

## Common Mistakes to Avoid

1. **Calling `clearRect` manually** — The library clears the canvas every frame automatically.
2. **Forgetting to call `game.run()`** — Nothing will render until you start the animation loop.
3. **Using `setInterval` or `setTimeout` for animation** — Use `addDrawing` instead; it's already running in a `requestAnimationFrame` loop.
4. **Creating a new `GameCanvas` each frame** — Create it once and use `addDrawing`/`removeDrawing` to manage what's drawn.
5. **Assuming keyboard events work without focus** — The canvas element needs focus to receive keyboard events. Users must click the canvas first.
6. **Ignoring `stepTime` for physics** — Use `stepTime` (not a fixed constant) for frame-rate-independent movement.

## Installation

```bash
npm install simple-canvas-library
```

Or via CDN with a script tag:

```html
<script src="https://unpkg.com/simple-canvas-library/dist/simple-canvas-library.umd.cjs"></script>
<script>
  const { GameCanvas, Sprite } = SimpleCanvasLibrary;
</script>
```

## HTML Setup

You need a `<canvas>` element in your HTML:

```html
<canvas id="my-canvas" width="800" height="600"></canvas>
```

Then pass its ID (or the element itself) to `GameCanvas` or `GameInterface`.
