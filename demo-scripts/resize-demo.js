/**
 * @demo Resize Handling
 * @description Demonstrates automatic canvas resizing, resize event handling, and responsive drawing that adapts to canvas size.
 * @tags resize, responsive, orientation
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas", { autoresize: true });
let portraitMode = false;
let currentSize = { width: 600, height: 400 };

// Add resize handler to detect orientation changes
game.addResizeHandler(
  function ({ width, height }) {
    currentSize = { width, height };
    if (height > width) {
      portraitMode = true;
    } else {
      portraitMode = false;
    }
  }
);

// Add animated drawing that responds to canvas size
game.addDrawing(function ({ ctx, elapsed, width, height }) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Background color based on orientation
  ctx.fillStyle = portraitMode ? '#e8f4fd' : '#fdf2e8';
  ctx.fillRect(0, 0, width, height);

  // Moving circle that bounces around
  const time = elapsed / 1000;
  const radius = Math.min(width, height) * 0.05; // 5% of smaller dimension

  // Calculate position with bouncing
  let x = (Math.sin(time * 0.5) + 1) / 2 * (width - radius * 2) + radius;
  let y = (Math.cos(time * 0.7) + 1) / 2 * (height - radius * 2) + radius;

  // Draw moving circle
  ctx.beginPath();
  ctx.fillStyle = portraitMode ? '#007cba' : '#ba7c00';
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw border grid that adapts to size
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  const gridSize = Math.min(width, height) / 10;
  for (let i = 0; i <= width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let j = 0; j <= height; j += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(width, j);
    ctx.stroke();
  }

  // Draw size info
  ctx.fillStyle = 'black';
  ctx.font = `${Math.max(12, Math.min(width, height) / 30)}px sans-serif`;
  ctx.fillText(`${width} × ${height}`, 10, 30);
  ctx.fillText(portraitMode ? 'Portrait Mode' : 'Landscape Mode', 10, 55);
});

game.run();
