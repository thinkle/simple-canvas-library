/**
 * @demo Simple Mouse Move Handler
 * @description Shows how to handle mouse movement events with GameCanvas.
 * @tags interactive, mouse, events
 */
import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");

// Simple variables for the ball position
let ballX = 100;
let ballY = 100;
let ballRadius = 15;
let ballColor = 'blue';

// Draw the ball at its current position
gameCanvas.addDrawing(function ({ ctx }) {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
});

// When the mouse moves, move the ball toward the mouse
gameCanvas.addHandler('mousemove', function ({ x, y }) {
  let dx = x - ballX;
  let dy = y - ballY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) {
    // Move a fraction of the distance toward the mouse
    let speed = 0.1;
    ballX += dx * speed;
    ballY += dy * speed;
  }
});

gameCanvas.run();
