/**
 * @demo Simple Animation Using Elapsed Time
 * @description Shows how to update a drawing over time using total elapsed time.
 * @tags drawing, animation, timing
 */
import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");

// Add a blue circle in the center
gameCanvas.addDrawing(({ ctx, width, height, elapsed }) => {

  // We will use a sin function to move the ball back and forth
  // sin returns a value from -1 to 1
  let sinValue = Math.sin(elapsed / 1000);
  // Now we use that to set the ballX position from 0 to width
  // so... (half the width) + (sinValue * half the width)
  let ballX = (sinValue * width / 2) + (width / 2);
  // Now draw the ball
  ctx.beginPath();
  ctx.fillStyle = 'blue';
  ctx.arc(ballX, height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
});

// We will use sin and cosin to add a red ball moving in a circle
gameCanvas.addDrawing(({ ctx, width, height, elapsed }) => {

  // sin and cos return values from -1 to 1
  let sinValue = Math.sin(elapsed / 1000);
  let cosValue = Math.cos(elapsed / 1000);
  // Now we use that to set the ballX and ballY position in a circle
  // so... (half the width) + (sinValue * quarter the width)
  let ballX = (sinValue * width / 4) + (width / 2);
  let ballY = (cosValue * height / 4) + (height / 2);
  // Now draw the ball
  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.arc(ballX, ballY, 30, 0, Math.PI * 2);
  ctx.fill();
});


gameCanvas.run();

