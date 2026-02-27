/**
 * @demo Gravity Simulation with UI Controls
 * @description Interactive gravity simulation with UI controls for adjusting parameters.
 * @tags game-interface, physics, interactive, animation
 */

import { GameInterface } from "../src/index.ts";

// Simple variables to store the ball position
let xPosition = 200;
let yPosition = 150;
let xVelocity = 50;
let yVelocity = 0;
let width = 400;
let height = 300;

// A simple function to move the ball based on x and y 
// velocity over time
function moveBall(seconds) {
  xPosition += xVelocity * seconds;
  yPosition += yVelocity * seconds;
  yVelocity += 200 * seconds; // gravity effect (pixels/second²)
}

// A simple function to handle bouncing off walls
function bounceBall(width, height) {
  if (xPosition > width - 20) {
    xPosition = width - 20;
    xVelocity = -Math.abs(xVelocity * 0.8); // bounce left with some energy loss
  } else if (xPosition < 20) {
    xPosition = 20;
    xVelocity = Math.abs(xVelocity * 0.8); // bounce right with some energy loss
  }
  if (yPosition > height - 20) {
    yPosition = height - 20;
    yVelocity = -Math.abs(yVelocity) * 0.8; // bounce up with some energy loss
  } else if (yPosition < 20) {
    yPosition = 20;
    yVelocity = Math.abs(yVelocity); // bounce down
  }
}

// Our game interface
const gameInterface = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: true,
  parent: document.getElementById('demo-container') || document.body
});

gameInterface.addDrawing(
  function ({ ctx, width, height, stepTime }) {
    // Update ball position first
    moveBall(stepTime / 1000);
    bounceBall(width, height);
    // Clear and draw
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(xPosition, yPosition, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5bdbff';
    ctx.fill();
  }
);

// Update width and height when the canvas is resized
gameInterface.addResizeHandler(function (params) {
  width = params.width;
  height = params.height;
});

// Bottom bar to "kick" the ball in various directions
const bottom = gameInterface.addBottomBar();
bottom.addButton({
  text: 'Left',
  onclick: function () {
    xVelocity -= 150;
  }
});
bottom.addButton({
  text: 'Right',
  onclick: function () {
    xVelocity += 150;
  }
});
bottom.addButton({
  text: 'Up',
  onclick: function () {
    yVelocity -= 150;
  }
});
bottom.addButton({
  text: 'Down',
  onclick: function () {
    yVelocity += 150;
  }
});

gameInterface.run();
