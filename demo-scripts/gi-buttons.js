/**
 * @demo GameInterface Buttons
 * @description Demonstrates the GameInterface class with Buttons
 * @tags ui, interface, buttons
 */

import { GameInterface } from "../src/index.ts";

// Create a new GameInterface that appends to demo container for proper layout
const demoContainer = document.getElementById('demo-container');
const gi = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: true,
  parent: demoContainer || document.body // Fallback to body if container doesn't exist
});

// Add a top bar with functional buttons
const topBar = gi.addTopBar();
topBar.addTitle("Button Demo");
const bottomBar = gi.addBottomBar();
bottomBar.addButton({
  text: "Add a Rectangle",
  onclick: () => {
    const rectWidth = Math.random()
    const rectHeight = Math.random()
    const xperc = Math.random();
    const yperc = Math.random();
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    gi.addDrawing(({ ctx, width, height }) => {
      const x = xperc * width;
      const y = yperc * height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, rectWidth * width, rectHeight * height);
    });
  }
})
bottomBar.addButton({
  text: 'Add a Circle',
  onclick: () => {
    const xperc = Math.random();
    const yperc = Math.random();
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const radius = Math.random() * 50;
    gi.addDrawing(({ ctx, width, height }) => {
      ctx.fillStyle = color;
      const x = xperc * width;
      const y = yperc * height;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }
});

gi.run();