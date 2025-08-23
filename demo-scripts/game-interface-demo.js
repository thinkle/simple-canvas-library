/**
 * @demo GameInterface Example
 * @description Demonstrates the new GameInterface class with UI components, game state management, and responsive canvas.
 * @tags ui, interface, buttons, inputs, sliders, game-interface
 */

import { GameInterface } from "../src/index.ts";

// Create a new GameInterface that appends to demo container for proper layout
const demoContainer = document.getElementById('demo-container');
const gi = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: false,
  parent: demoContainer || document.body // Fallback to body if container doesn't exist
});

// Game state variables
let ballX = gi.getSize().width / 2;
let ballY = gi.getSize().height / 2;
let ballVelX = 2;
let ballVelY = 2;
let ballSpeed = 2;
let ballSize = 20;
let ballColor = '#007cba';

// Add a top bar with functional buttons
const topBar = gi.addTopBar();

// About button to demonstrate dialog functionality
topBar.addButton({
  text: "About",
  onclick: () => {
    gi.dialog("About This Demo", "This demonstrates the GameInterface.dialog() popup functionality!");
  }
});

// Start button
const startButton = topBar.addButton({
  text: "Start Game",
  onclick: () => {
    if (gi.getGameState() === 'stopped') {
      // Reset ball position when starting
      ballX = gi.getSize().width / 2;
      ballY = gi.getSize().height / 2;
      ballVelX = ballSpeed;
      ballVelY = ballSpeed;
      gi.run();
      startButton.setText("Running");
      pauseButton.setText("Pause");
      pauseButton.enable();
    }
  }
});

// Pause/Resume button
const pauseButton = topBar.addButton({
  text: "Pause",
  onclick: () => {
    if (gi.getGameState() === 'running') {
      gi.pause();
      pauseButton.setText("Resume");
      startButton.setText("Paused");
    } else if (gi.getGameState() === 'paused') {
      gi.resume();
      pauseButton.setText("Pause");
      startButton.setText("Running");
    }
  }
});

// Reset button
topBar.addButton({
  text: "Reset",
  onclick: () => {
    gi.reset();
    ballX = gi.getSize().width / 2;
    ballY = gi.getSize().height / 2;
    ballVelX = ballSpeed;
    ballVelY = ballSpeed;
    startButton.setText("Start Game");
    pauseButton.setText("Pause");
    pauseButton.disable();
  }
});

// Initially disable pause button
pauseButton.disable();

// Add a bottom bar with both sliders and number inputs
const bottomBar = gi.addBottomBar();

// Ball speed control using a slider
const speedSlider = bottomBar.addSlider({
  label: "Speed",
  min: 0.5,
  max: 8,
  value: ballSpeed,
  step: 0.5,
  oninput: (value) => {
    ballSpeed = value;
    // Update velocity direction while preserving direction
    ballVelX = ballVelX > 0 ? ballSpeed : -ballSpeed;
    ballVelY = ballVelY > 0 ? ballSpeed : -ballSpeed;
  }
});

// Ball size control using a number input
const sizeInput = bottomBar.addNumberInput({
  label: "Size",
  min: 5,
  max: 50,
  value: ballSize,
  step: 5,
  oninput: (value) => {
    ballSize = value;
  }
});

// Color controls using buttons
const redButton = bottomBar.addButton({
  text: "Red",
  onclick: () => {
    ballColor = '#ff6b6b';
  }
});

const blueButton = bottomBar.addButton({
  text: "Blue",
  onclick: () => {
    ballColor = '#007cba';
  }
});

const greenButton = bottomBar.addButton({
  text: "Green",
  onclick: () => {
    ballColor = '#4ecdc4';
  }
});

// Toggle controls demonstration
const controlsToggle = bottomBar.addButton({
  text: "Hide Controls",
  onclick: function() {
    if (speedSlider.getIsVisible()) {
      speedSlider.hide();
      sizeInput.hide();
      controlsToggle.setText("Show Controls");
    } else {
      speedSlider.show();
      sizeInput.show();
      controlsToggle.setText("Hide Controls");
    }
  }
});

// Game drawing logic - bouncing ball
gi.addDrawing(({ ctx, width, height, stepTime }) => {
  // Only update if game is running
  if (gi.getGameState() !== 'running') {
    // Just redraw the ball in current position if paused
    ctx.clearRect(0, 0, width, height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize/2, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.strokeStyle = ballColor === '#007cba' ? '#005a8a' : '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw "PAUSED" text if paused
    if (gi.getGameState() === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width/2, height/2 - 30);
    }
    return;
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Update ball position based on actual speed
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
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.strokeStyle = ballColor === '#007cba' ? '#005a8a' : '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
});

// Add click handler to show coordinates
gi.addClickHandler(({ x, y }) => {
  gi.dialog("Click Detected!", `You clicked at position (${Math.round(x)}, ${Math.round(y)})`);
});

// Don't auto-start the game - wait for user to click Start
console.log("GameInterface demo loaded. Click 'Start Game' to begin!");