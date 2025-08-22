/**
 * @demo Sprite Animation
 * @description Shows sprite creation, animation, frame sequencing, rotation, and different movement patterns.
 * @tags sprites, animation, rotation, movement
 */

import { GameCanvas, Sprite } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Create a simple "sprite sheet" using canvas (simulating what would be a PNG file)
function createSpriteSheet(colors, frameWidth, frameHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = frameWidth * colors.length;
  canvas.height = frameHeight;
  const ctx = canvas.getContext('2d');

  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(index * frameWidth, 0, frameWidth, frameHeight);

    // Add a simple pattern to show frame changes
    ctx.fillStyle = 'white';
    ctx.fillRect(index * frameWidth + 5, 5, frameWidth - 10, frameHeight - 10);
    ctx.fillStyle = color;
    ctx.fillRect(index * frameWidth + 10, 10, frameWidth - 20, frameHeight - 20);
  });

  return canvas.toDataURL();
}

// Create different sprite sheets
const redSpriteSheet = createSpriteSheet(['#ff4444', '#ff6666', '#ff8888', '#ffaaaa'], 32, 32);
const blueSpriteSheet = createSpriteSheet(['#4444ff', '#6666ff', '#8888ff', '#aaaaff'], 32, 32);
const greenSpriteSheet = createSpriteSheet(['#44ff44', '#66ff66', '#88ff88', '#aaffaa'], 24, 24);

// Create sprites with different properties
const sprites = [
  new Sprite({
    src: redSpriteSheet,
    x: 100,
    y: 100,
    frameWidth: 32,
    frameHeight: 32,
    frameRate: 8,
    animate: true,
    update: function ({ sprite, width, height, stepTime }) {
      // Move right and wrap around
      sprite.x += stepTime / 10;
      if (sprite.x > width) {
        sprite.x = -sprite.targetWidth;
      }
    }
  }),

  new Sprite({
    src: blueSpriteSheet,
    x: 200,
    y: 200,
    frameWidth: 32,
    frameHeight: 32,
    frameRate: 12,
    animate: true,
    frameSequence: [0, 1, 2, 1], // Custom animation sequence
    update: function ({ sprite, width, height, stepTime, elapsed }) {
      // Circular movement
      const time = elapsed / 1000;
      sprite.x = width / 2 + Math.cos(time) * 100;
      sprite.y = height / 2 + Math.sin(time) * 80;
      sprite.angle = time; // Rotate while moving
    }
  }),

  new Sprite({
    src: greenSpriteSheet,
    x: 50,
    y: 300,
    frameWidth: 24,
    frameHeight: 24,
    frameRate: 6,
    animate: true,
    targetWidth: 48, // Scale up 2x
    targetHeight: 48,
    update: function ({ sprite, width, height, stepTime }) {
      // Bounce up and down
      sprite.y = 300 + Math.sin(Date.now() / 500) * 50;
      sprite.x += stepTime / 20;
      if (sprite.x > width) {
        sprite.x = -sprite.targetWidth;
      }
    }
  })
];

// Add a background
game.addDrawing(function ({ ctx, width, height }) {
  // Light blue background
  ctx.fillStyle = '#f0f8ff';
  ctx.fillRect(0, 0, width, height);

  // Grid pattern
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Instructions
  ctx.fillStyle = 'black';
  ctx.font = '14px sans-serif';
  ctx.fillText('Red sprite: moves horizontally', 10, 20);
  ctx.fillText('Blue sprite: circles and rotates', 10, 40);
  ctx.fillText('Green sprite: bounces and moves', 10, 60);
});

// Add all sprites to the game
sprites.forEach(sprite => {
  game.addDrawing(sprite);
});

game.run();
