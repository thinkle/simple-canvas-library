# SimpleCanvas Library

A simple library for handling basic canvas drawings, callbacks, and animations. Created as a teaching library to give students a close-to-the-browser-API experience in game development.

## Features

- **GameCanvas Class**: A central class for setting up a canvas and managing drawings and events
- **Drawing Management**: Easily add, remove, restore, and replace drawings on the canvas
- **Event Handling**: Built-in methods for handling mouse events (click, move, etc.) and keyboard events
- **Canvas Resizing**: Automatically adjusts the canvas size based on the DOM element's size with resize callbacks
- **Animation Support**: Simple methods for creating animations with elapsed time tracking
- **Sprite Support**: Built-in sprite class with animation, rotation, and frame sequencing
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- **Zero Dependencies**: Lightweight and self-contained

## Installation & Usage

### For Modern Projects (ES Modules)

```bash
npm install simple-canvas-library
```

```typescript
import { GameCanvas, Sprite } from "simple-canvas-library";

const game = new GameCanvas("myCanvasId");
game.addDrawing(({ ctx, elapsed, width, height }) => {
  const x = (elapsed / 20) % width;
  ctx.clearRect(0, 0, width, height);
  ctx.fillRect(x, height / 2, 20, 20);
});
game.run();
```

### For CodePen/JSFiddle (UMD Build)

You can use SimpleCanvasLibrary directly in CodePen or JSFiddle by including the UMD build:

```html
<script src="https://unpkg.com/simple-canvas-library/dist/simple-canvas-library.umd.js"></script>
<script>
  const { GameCanvas, Sprite } = SimpleCanvasLibrary;

  const game = new GameCanvas("game");
  game.addDrawing(({ ctx, elapsed, width, height }) => {
    const x = (elapsed / 20) % width;
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(x, height / 2, 20, 20);
  });
  game.run();
</script>
```

## Quick Examples

### Basic Animation

```typescript
const game = new GameCanvas("game");
game.addDrawing(({ ctx, elapsed, width, height }) => {
  let x = ((100 * elapsed) / 1000) % width;
  let y = height / 2;
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.stroke();
});
game.run();
```

### Click Handler

```typescript
game.addClickHandler(({ x, y }) => {
  game.addDrawing(({ ctx, elapsed }) => {
    const size = elapsed / 100;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  });
});
```

### Sprite Animation

```typescript
const sprite = new Sprite({
  src: "character.png",
  x: 100,
  y: 100,
  frameWidth: 32,
  frameHeight: 32,
  frameRate: 12,
  animate: true,
});

game.addDrawing(sprite);
```

## Documentation

- **[API Documentation](./docs/index.html)** - Complete TypeScript API documentation
- **[Live Demos](./demos/index.html)** - Interactive examples and tutorials

## Demos

The library includes several demos showcasing different features:

- **Basic Animation** - Simple moving elements
- **Click Handler** - Interactive drawing with mouse events
- **Resize Handling** - Responsive canvas behavior
- **Sprite Animation** - Sprite sheets and frame animation
- **Test Library** - Built-in testing functionality

Visit the [demos directory](./demos/) for runnable examples.

## API Overview

### GameCanvas

The main class for canvas management:

- `addDrawing(drawFunction)` - Add a drawing to the animation loop
- `removeDrawing(id)` - Remove a drawing by ID
- `restoreDrawing(id)` - Restore a previously removed drawing
- `replaceDrawing(id, newDrawFunction)` - Replace an existing drawing
- `addClickHandler(handler)` - Handle click events
- `addResizeHandler(handler)` - Handle canvas resize events
- `run()` - Start the animation loop

### Sprite

For managing animated sprites:

- `copy(newParams)` - Create a copy with modified parameters
- `draw()` - Called automatically when added to GameCanvas

## Development

```bash
# Install dependencies
npm install

# Start development server with demos
npm run dev

# Build library
npm run build

# Generate documentation
npm run docs

# Generate demo HTML files from JavaScript sources
npm run build:demos
```

### Demo System

The demo system automatically generates HTML files from JavaScript source files:

- **Demo Scripts**: Write demos as JavaScript files in `demo-scripts/`
- **Metadata**: Add JSDoc-style comments for title, description, and tags
- **Auto-generation**: Run `npm run build:demos` to generate HTML files
- **Hot Reloading**: When running `npm run dev`, demo files automatically rebuild when you modify the source scripts
- **Source Display**: Generated HTML shows the exact source code that's running

Example demo script format:

```javascript
/**
 * @demo Your Demo Title
 * @description A description of what this demo shows
 * @tags tag1, tag2, tag3
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");
// Your demo code here...
game.run();
```

## Browser Support

SimpleCanvasLibrary works in all modern browsers that support:

- Canvas API
- ES6 classes
- ResizeObserver (for auto-resize functionality)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.
