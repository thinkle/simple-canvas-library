/**
 * @demo Simple Cat Sprite (Static Position)
 * @description Basic sprite animation example using a cat spritesheet with stationary display.
 * @tags sprites, animation, basics, spritesheet
 */

import { GameCanvas, Sprite } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Create a simple cat sprite that cycles through all frames
// Cat spritesheet is 448x420 with 5 rows and 7 columns (35 total grid spots, 31 actual frames)
const cat = new Sprite({
  src: "../assets/spritesheet.png",
  x: 200,
  y: 150,
  frameWidth: 64,
  frameHeight: 64,
  frameRate: 12,     // Slow animation to see each frame clearly
  animate: true,
  frames: 31,
  targetWidth: 128,  // Scale up a bit for better visibility
  targetHeight: 128,
});

// Simple background
game.addDrawing(function ({ ctx, width, height }) {
  // Light blue background
  ctx.fillStyle = '#E6F3FF';
  ctx.fillRect(0, 0, width, height);

  // Instructions
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(10, 10, 280, 60);
  ctx.fillStyle = 'black';
  ctx.font = '14px sans-serif';
  ctx.fillText('🐱 Simple Cat Sprite Animation', 15, 30);
  ctx.fillText('Cycling through all 31 frames slowly', 15, 48);
  ctx.fillText(`Current frame: ${cat.frame}`, 15, 65);
});

// Add the cat sprite to the game
game.addDrawing(cat);

game.run();
