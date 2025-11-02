/**
 * @demo Simple Drawing Example
 * @description Shows how to create a drawing using the GameCanvas class.
 * @tags drawing, basics
 */
import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");
// Add a simple drawing that fills the canvas...
gameCanvas.addDrawing(({ ctx, width, height }) => {
  // Let's draw a red square the full width of the canvas
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, width, height);
});

// Add a blue circle in the center
gameCanvas.addDrawing(({ ctx, width, height }) => {
  ctx.beginPath();
  ctx.fillStyle = 'blue';
  ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
});


gameCanvas.run();

