/**
 * @demo GameInterface with Buttons
 * @description Shows how to create interactive buttons using the GameInterface class.
 * @tags game-interface, buttons, interactive
 */

import { GameInterface } from "../src/index.ts";

// Create a new GameInterface that appends to demo container for proper layout
const demoContainer = document.getElementById('demo-container');
const gi = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: true,
  parent: demoContainer || document.body
});

// A list of colors to pick from at random
const colors = ['red', 'green', 'blue', 'orange', 'purple', 'teal', 'salmon', 'navy'];

// Add a top bar with a title
const topBar = gi.addTopBar();
topBar.addTitle("Button Demo");

// Add a bottom bar with buttons
const bottomBar = gi.addBottomBar();

bottomBar.addButton({
  text: "Add a Rectangle",
  onclick: function () {
    let rectWidth = Math.random();
    let rectHeight = Math.random();
    let xPercent = Math.random();
    let yPercent = Math.random();
    let color = colors[Math.floor(Math.random() * colors.length)];
    gi.addDrawing(function ({ ctx, width, height }) {
      let x = xPercent * width;
      let y = yPercent * height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, rectWidth * width, rectHeight * height);
    });
  }
});

bottomBar.addButton({
  text: 'Add a Circle',
  onclick: function () {
    let xPercent = Math.random();
    let yPercent = Math.random();
    let color = colors[Math.floor(Math.random() * colors.length)];
    let radius = Math.random() * 50;
    gi.addDrawing(function ({ ctx, width, height }) {
      ctx.fillStyle = color;
      let x = xPercent * width;
      let y = yPercent * height;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }
});

gi.run();
