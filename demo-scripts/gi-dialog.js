/**
 * @demo GameInterface with Dialog
 * @description Shows how to create a dialog box using the GameInterface class.
 * @tags game-interface, dialog, interactive
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
topBar.addTitle("Dialog Demo");
topBar.addButton({
  text: "Show Dialog",
  onclick: () => {
    gi.pause();
    gi.dialog(
      "About this Game",
      `There is a simple method called \`gi.dialog(title, message)\` that can be used to show modal dialog boxes like this one.
      You can customize the title and message as needed.`,
      onclose => {
        gi.resume();
      }
    );
  }
});


gi.addDrawing(({ ctx, width, height, elapsed }) => {
  // Let's just show a pulsing box for kicks
  const boxWidth = 100 + 20 * Math.sin(elapsed / 500);
  const boxHeight = 100 + 20 * Math.sin(elapsed / 500);
  const redAmount = Math.floor(128 + 127 * Math.sin(elapsed / 500));
  ctx.fillStyle = `rgb(${redAmount}, 32,${128 - redAmount})`;
  ctx.fillRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);
});

gi.run();

