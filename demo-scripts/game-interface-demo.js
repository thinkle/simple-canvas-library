/**
 * @demo GameInterface Example
 * @description Demonstrates the new GameInterface class with UI components.
 * @tags ui, interface, buttons, inputs, game-interface
 */

import { GameInterface } from "../src/index.ts";

// Create a new GameInterface (creates its own DOM structure)
const gi = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: false
});

// Add a top bar with buttons
const topBar = gi.addTopBar();
topBar.addButton({
  text: "Start Game",
  onclick: () => {
    gi.dialog("Game Started!", "The game has been started successfully.");
    console.log("Game started!");
  }
});

topBar.addButton({
  text: "Pause",
  onclick: () => {
    gi.dialog("Game Paused", "Click OK to continue.");
    console.log("Game paused!");
  }
});

topBar.addButton({
  text: "Reset",
  onclick: () => {
    ballX = gi.getSize().width / 2;
    ballY = gi.getSize().height / 2;
    ballVelX = 2;
    ballVelY = 2;
    console.log("Game reset!");
  }
});

// Add a bottom bar with controls
const bottomBar = gi.addBottomBar();

let ballSpeed = 2;
const speedInput = bottomBar.addNumberInput({
  label: "Ball Speed",
  min: 1,
  max: 10,
  value: ballSpeed,
  step: 1,
  oninput: (value) => {
    ballSpeed = value;
    console.log("Ball speed changed to:", value);
  }
});

let ballSize = 20;
const sizeInput = bottomBar.addNumberInput({
  label: "Ball Size",
  min: 5,
  max: 50,
  value: ballSize,
  step: 5,
  oninput: (value) => {
    ballSize = value;
    console.log("Ball size changed to:", value);
  }
});

// Toggle controls
const hideButton = bottomBar.addButton({
  text: "Hide Speed Control",
  onclick: function() {
    if (speedInput.getElement().style.display === 'none') {
      speedInput.show();
      hideButton.setText("Hide Speed Control");
    } else {
      speedInput.hide();
      hideButton.setText("Show Speed Control");
    }
  }
});

const toggleButton = bottomBar.addButton({
  text: "Toggle Size Control",
  onclick: function() {
    if (sizeInput.getIsEnabled()) {
      sizeInput.disable();
      toggleButton.setText("Enable Size Control");
    } else {
      sizeInput.enable();
      toggleButton.setText("Disable Size Control");
    }
  }
});

// Game logic - bouncing ball
let ballX = gi.getSize().width / 2;
let ballY = gi.getSize().height / 2;
let ballVelX = ballSpeed;
let ballVelY = ballSpeed;

gi.addDrawing(({ ctx, width, height, stepTime }) => {
  // Update ball position
  ballVelX = ballVelX > 0 ? ballSpeed : -ballSpeed;
  ballVelY = ballVelY > 0 ? ballSpeed : -ballSpeed;
  
  ballX += ballVelX * (stepTime / 16); // Normalize for 60fps
  ballY += ballVelY * (stepTime / 16);

  // Bounce off walls
  if (ballX <= ballSize/2 || ballX >= width - ballSize/2) {
    ballVelX = -ballVelX;
    ballX = Math.max(ballSize/2, Math.min(width - ballSize/2, ballX));
  }
  if (ballY <= ballSize/2 || ballY >= height - ballSize/2) {
    ballVelY = -ballVelY;
    ballY = Math.max(ballSize/2, Math.min(height - ballSize/2, ballY));
  }

  // Draw ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize/2, 0, Math.PI * 2);
  ctx.fillStyle = '#007cba';
  ctx.fill();
  ctx.strokeStyle = '#005a8a';
  ctx.lineWidth = 2;
  ctx.stroke();
});

// Add click handler to demonstrate dialog
gi.addClickHandler(({ x, y }) => {
  gi.dialog("Click Detected!", `You clicked at position (${Math.round(x)}, ${Math.round(y)})`);
});

// Start the game
gi.run();