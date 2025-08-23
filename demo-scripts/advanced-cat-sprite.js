/**
 * @demo Advanced Cat Sprite (Mouse Following)
 * @description Interactive cat sprite that follows your mouse cursor with walking animation from a real spritesheet.
 * @tags sprites, animation, mouse-following, spritesheet, interactive, advanced
 */

import { GameCanvas, Sprite } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Mouse position tracking
let mouseX = 200;
let mouseY = 150;

// Create the cat sprite using the uploaded spritesheet
// Cat spritesheet is 448x420 with 5 rows and 7 columns
// Each frame is 64x84 pixels
// Row 0 (0-6): Idle/standing animation
// Row 1 (7-13): Walking animation  
// Row 2 (14-20): Running animation
// Row 3 (21-27): Fast running animation
// Row 4 (28-34): Ignore (cat getting sick)
const cat = new Sprite({
  src: "../assets/spritesheet.png",
  x: 200,
  y: 150,
  frameWidth: 64,
  frameHeight: 64,
  frameRate: 8,     // Animation speed (will be adjusted based on movement)
  animate: true,
  frames: 31,       // Only use the first 31 frames (avoid blanks)
  frameSequence: [0, 1, 2, 3, 4, 5, 6], // Start with idle animation    
  update: function (sprite, cfg) {
    // Calculate distance to mouse
    const dx = mouseX - sprite.x;
    const dy = mouseY - sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate movement speed based on distance
    let speed = 0;
    let animationState = 'idle';

    if (distance > 5) {
      // Determine speed based on distance - farther = faster
      // Slower speeds to appreciate the animations
      if (distance < 50) {
        speed = 0.02; // Very slow walking
        animationState = 'walk';
      } else if (distance < 150) {
        speed = 0.04; // Slow running  
        animationState = 'run';
      } else {
        speed = 0.08; // Medium running (reduced from 0.2)
        animationState = 'sprint';
      }

      // Move toward mouse position
      sprite.x += (dx * speed * cfg.stepTime) / 16;
      sprite.y += (dy * speed * cfg.stepTime) / 16;

      // Flip sprite based on movement direction
      // Cat faces right by default, so flip when moving left
      if (dx < 0) {
        sprite.flipHorizontal = true;  // Moving left - flip to face left
      } else if (dx > 0) {
        sprite.flipHorizontal = false; // Moving right - don't flip (default)
      }

      // Set animation based on movement state
      sprite.animate = true;
      switch (animationState) {
        case 'walk':
          sprite.frameSequence = [7, 8, 9, 10, 11, 12, 13]; // Row 1: Walking
          sprite.frameRate = 6; // Slower animation
          break;
        case 'run':
          sprite.frameSequence = [14, 15, 16, 17, 18, 19, 20]; // Row 2: Running
          sprite.frameRate = 10; // Medium speed
          break;
        case 'sprint':
          sprite.frameSequence = [21, 22, 23, 24, 25, 26, 27]; // Row 3: Fast running
          sprite.frameRate = 14; // Fast animation
          break;
      }
    } else {
      // Cat is close to mouse - idle state
      sprite.animate = true;
      sprite.frameSequence = [0, 1, 2, 3, 4, 5, 6]; // Row 0: Idle
      sprite.frameRate = 4; // Very slow idle animation
    }

    // Rotate slightly based on movement direction for extra character
    if (distance > 5) {
      sprite.angle = Math.atan2(dy, dx) * 0.05; // Subtle tilt
    } else {
      sprite.angle = 0; // Stand upright when idle
    }
  }
});

// Add background
game.addDrawing(function ({ ctx, width, height }) {
  // Grass-like background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB'); // Sky blue
  gradient.addColorStop(0.7, '#98FB98'); // Pale green
  gradient.addColorStop(1, '#228B22'); // Forest green

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some simple ground texture
  ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
  for (let i = 0; i < 20; i++) {
    const x = (i * 37) % width;
    const y = height * 0.8 + Math.sin(i) * 10;
    ctx.fillRect(x, y, 10, 3);
  }

  // Instructions
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(10, 10, 280, 75);
  ctx.fillStyle = 'black';
  ctx.font = '14px sans-serif';
  ctx.fillText('🐱 Move your mouse around!', 15, 30);
  ctx.fillText('Cat changes animation based on distance:', 15, 48);
  ctx.fillText('• Close: Idle • Near: Walk • Far: Run • Very Far: Sprint', 15, 66);
  ctx.fillText('Different frame sequences for each state!', 15, 84);

  // Mouse cursor indicator
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
});

// Add mouse move handler to track cursor position
game.addHandler('mousemove', function ({ x, y }) {
  mouseX = x;
  mouseY = y;
});

// Add the cat sprite to the game
game.addDrawing(cat);

game.run();
