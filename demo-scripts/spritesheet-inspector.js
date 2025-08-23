/**
 * @demo Cat Spritesheet Inspector
 * @description Shows the raw spritesheet to help determine frame dimensions and layout.
 * @tags sprites, debugging, spritesheet, analysis
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Load and display the spritesheet to inspect it
const img = new Image();
img.src = "../assets/spritesheet.png";

game.addDrawing(function ({ ctx, width, height }) {
  // Clear background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  if (img.complete && img.naturalWidth > 0) {
    // Display the spritesheet
    ctx.drawImage(img, 10, 10);

    // Show dimensions
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Spritesheet Dimensions: ${img.naturalWidth} x ${img.naturalHeight}`, 10, img.naturalHeight + 35);

    // Draw grid lines to help identify frames
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;

    // Try different frame width guesses
    const possibleWidths = [16, 24, 32, 48, 64];
    const possibleHeights = [16, 24, 32, 48, 64];


    let bestWidth = 64;
    let bestHeight = 64;

    // Use 32x32 as default, but show grid
    for (let x = 10; x <= 10 + img.naturalWidth; x += bestWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, 10 + img.naturalHeight);
      ctx.stroke();
    }

    for (let y = 10; y <= 10 + img.naturalHeight; y += bestHeight) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(10 + img.naturalWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'red';
    ctx.fillText(`Grid: ${bestWidth}x${bestHeight} frames`, 10, img.naturalHeight + 55);
    ctx.fillText(`Frames per row: ${Math.floor(img.naturalWidth / bestWidth)}`, 10, img.naturalHeight + 75);
    ctx.fillText(`Number of rows: ${Math.floor(img.naturalHeight / bestHeight)}`, 10, img.naturalHeight + 95);

  } else {
    ctx.fillStyle = 'gray';
    ctx.font = '16px sans-serif';
    ctx.fillText('Loading spritesheet...', 10, 30);
  }
});

game.run();
