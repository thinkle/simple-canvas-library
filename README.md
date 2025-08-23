# SimpleCanvasLibrary

A beginner-friendly TypeScript library for creating interactive canvas graphics, animations, and simple games. Perfect for learning game development concepts!

## 🚀 Quick Start

### 1. Create a canvas in your HTML:

```html
<canvas id="my-game" width="800" height="600"></canvas>
```

### 2. Import and create a game:

```javascript
import { GameCanvas } from "simple-canvas-library";

const game = new GameCanvas("my-game");
```

### 3. Add something to draw:

```javascript
// Draw a bouncing ball
game.addDrawing(({ ctx, elapsed, width, height }) => {
  const x = (elapsed / 10) % width; // Move across screen
  const y = height / 2; // Middle of screen

  ctx.clearRect(0, 0, width, height); // Clear previous frame
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2); // Draw circle
  ctx.fillStyle = "blue";
  ctx.fill();
});
```

### 4. Start the game loop:

```javascript
game.run();
```

That's it! You now have an animated blue ball moving across the screen.

## 📚 Core Concepts

### Drawing Functions

Every drawing function receives these helpful parameters:

- `ctx` - The canvas drawing context
- `width, height` - Current canvas size
- `elapsed` - Milliseconds since the game started
- `timestamp` - Current time
- `stepTime` - Time since last frame

```javascript
game.addDrawing(({ ctx, elapsed, width, height }) => {
  // Your drawing code here
});
```

### Event Handling

Add interactive features easily:

```javascript
// Handle clicks
game.addClickHandler(({ x, y, ctx, width, height }) => {
  console.log(`Clicked at ${x}, ${y}`);
  // Draw something at click position
});

// Handle mouse movement
game.addHandler("mousemove", ({ x, y }) => {
  console.log(`Mouse at ${x}, ${y}`);
});

// Handle key presses
game.addHandler("keydown", ({ key }) => {
  if (key === "Space") {
    console.log("Space pressed!");
  }
});
```

### Sprites (Images)

Load and animate sprites easily:

```javascript
import { Sprite } from "simple-canvas-library";

const playerSprite = new Sprite("player.png");

// Wait for image to load, then add to game
playerSprite.onReady(() => {
  game.addDrawing(({ ctx }) => {
    playerSprite.draw(ctx, 100, 100); // Draw at position (100, 100)
  });
});
```

## 🎮 Interactive Demos

Check out live examples at: **[https://thinkle.github.io/simple-canvas-library/demos/](https://thinkle.github.io/simple-canvas-library/demos/)**

## 📖 Full API Documentation

For complete method documentation, see: **[https://thinkle.github.io/simple-canvas-library/docs/](https://thinkle.github.io/simple-canvas-library/docs/)**

## 🎯 Perfect For

- **Learning game development** - Simple, clear API
- **Teaching programming** - Great for computer science classes
- **Rapid prototyping** - Get ideas running quickly
- **Creative coding** - Focus on creativity, not boilerplate

## 💾 Installation

### Option 1: ES Modules (Recommended)

```javascript
import { GameCanvas, Sprite } from "simple-canvas-library";
```

### Option 2: Script Tag (for CodePen/JSFiddle)

```html
<script src="https://unpkg.com/simple-canvas-library/dist/simple-canvas-library.umd.js"></script>
<script>
  const { GameCanvas, Sprite } = SimpleCanvasLibrary;
</script>
```

### Option 3: npm

```bash
npm install simple-canvas-library
```

## 🏆 What Makes This Special

- **Zero configuration** - No build step required
- **Beginner-friendly** - Clear, simple API
- **TypeScript ready** - Full type support
- **Lightweight** - Small bundle size
- **Modern** - ES modules, clean code
- **Educational** - Perfect for learning

## 🤝 Contributing

Found a bug or want to add a feature? Check out our [GitHub repository](https://github.com/thinkle/simple-canvas-library)!

---

_Made with ❤️ for students, teachers, and creative coders_
