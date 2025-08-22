/**
 * @demo Simple Click Handler
 * @description Demonstrates basic click event handling and drawing on the canvas.
 * @tags interaction, click, events
 */

import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");

const coolColors = ['salmon', 'coral', 'navy', 'orange', 'teal', 'red', ' green', 'blue', 'indigo', 'violet', 'pink', 'purple']

gameCanvas.addClickHandler((event) => {
  const { x, y } = event;
  const color = coolColors[Math.floor(Math.random() * coolColors.length)];
  gameCanvas.addDrawing(({ ctx }) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - 25, y - 25, 50, 50);
  });
});

gameCanvas.run();