/**
 * @demo Simple Moving Drawing (Step Time)
 * @description Shows how to animate drawings using step time for consistent frame-based movement.
 * Compare this to elapsed-time for different animation approaches.
 * @tags drawing, animation, timing
 */
import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");

let x = gameCanvas.width / 2; // initial x position
let y = gameCanvas.height / 2; // initial y position

// Add a blue circle in the center
gameCanvas.addDrawing(({ ctx, width, height, stepTime }) => {
  // stepTime tells us how long it's been since the last frame we drew (in ms);
  // We will use it to move the ball to the right at 100 pixels per second
  let speed = 100; // pixels per second
  x += (speed * stepTime) / 1000; // update x position
  ctx.fillStyle = '#0033a0';
  ctx.fillRect(x, y, 30, 30);
  if (x > width) {
    x = -30; // reset to start when it goes off screen
    y += 30; // move down 10 pixels each time it goes off screen
  }
  if (y > height) {
    y = 0; // reset to top if it goes off screen
  }
});

gameCanvas.run();

