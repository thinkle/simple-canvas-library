/**
 * @demo Fancy Click Handler
 * @description Advanced click handling with visual feedback and color changes.
 * @tags interactive, click, events, advanced
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");
const colors = ['red', 'green', 'purple', 'yellow', 'orange', 'blue', 'pink'];
const drawings = []; // track our drawings so we can remove them...
let colorIndex = 0;


game.addClickHandler(
  // When the canvas is clicked...
  function ({ x, y }) {
    // Set color at click time
    let color = colors[colorIndex];
    // Add the drawing to the game...
    const id = game.addDrawing(
      function ({ ctx, elapsed, height }) {
        let ypos = y + elapsed / 5; // Fall down
        while (ypos > height) {
          ypos -= height; // come around the top...
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, ypos, 20, 0, Math.PI * 2);
        ctx.fill();

        // Add a nice shadow
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.arc(x, ypos + 2, 20, 0, Math.PI * 2);
        ctx.fill();
      } // end drawing function
    );

    drawings.push(id); // Keep track of our drawing so we can remove it.

    // If we have too many drawings, remove the first one we put on...
    if (drawings.length > colors.length * 2) {
      const toRemove = drawings.shift();
      game.removeDrawing(toRemove);
    }

    // shift colors for next ball
    colorIndex += 1;
    if (colorIndex >= colors.length) { colorIndex = 0; }
    color = colors[colorIndex];
  } // end click callback
);

game.run(); // run the game!
