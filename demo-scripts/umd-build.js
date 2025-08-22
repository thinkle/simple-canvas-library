/**
 * @demo UMD Build Usage
 * @description Shows how to use the built UMD version directly in HTML without a build step - perfect for CodePen or JSFiddle.
 * @tags umd, codepen, jsfiddle, distribution
 */

// For this demo, we'll show how to use the UMD build
// Note: This demo actually uses ES modules, but shows the equivalent UMD code

// In a real UMD scenario, you would include:
// <script src="dist/simple-canvas-library.umd.js"></script>
// And then use: const { GameCanvas, Sprite } = SimpleCanvasLibrary;

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Add a colorful animated background
game.addDrawing(({ ctx, elapsed, width, height }) => {
  // Animated gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const hue = (elapsed / 50) % 360;
  gradient.addColorStop(0, `hsl(${hue}, 70%, 80%)`);
  gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 60%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
});

// Add multiple bouncing balls
const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
colors.forEach((color, index) => {
  game.addDrawing(({ ctx, elapsed, width, height }) => {
    const time = elapsed / 1000;
    const phase = index * Math.PI / 3; // Offset each ball

    const x = (Math.sin(time * 0.5 + phase) + 1) / 2 * (width - 40) + 20;
    const y = (Math.cos(time * 0.7 + phase) + 1) / 2 * (height - 40) + 20;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Add a glow effect
    ctx.beginPath();
    ctx.fillStyle = color + '40'; // Add transparency
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
  });
});

// Add click handler for fireworks effect
game.addClickHandler(({ x, y }) => {
  // Create multiple particles for firework effect
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

    game.addDrawing(({ ctx, elapsed, remove }) => {
      const time = elapsed / 1000;
      const px = x + Math.cos(angle) * speed * time;
      const py = y + Math.sin(angle) * speed * time + time * time * 50; // gravity

      const life = 2000; // 2 seconds
      const alpha = Math.max(0, 1 - elapsed / life);

      if (elapsed > life) {
        remove();
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
});

game.run();
