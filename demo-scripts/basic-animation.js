/**
 * @demo Basic Animation Example
 * @description Demonstrates simple animation with moving shapes using GameCanvas.
 * @tags animation, basics, getting-started
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

game.addDrawing(({ ctx, elapsed, width, height }) => {
  // Let's build a spinner using elapsed...
  // We will move one rotation per second... so...
  let angle = (elapsed / 1000) * 2 * Math.PI;
  let centerx = width / 2;
  let centery = height / 2;
  let radius = height / 3;

  // Clear canvas first
  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.moveTo(centerx, centery);
  ctx.lineTo(Math.cos(angle) * radius + centerx, Math.sin(angle) * radius + centery);
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 3;
  ctx.stroke();
});

game.run();
