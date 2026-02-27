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
        // Wrap around when it goes off the bottom
        while (ypos > height) {
          ypos -= height;
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

    // If we have too many drawings, remove the oldest one
    if (drawings.length > colors.length * 2) {
      let oldestId = drawings[0];
      drawings.splice(0, 1); // remove first element from the array
      game.removeDrawing(oldestId);
    }

    // Move to the next color for next ball
    colorIndex += 1;
    if (colorIndex >= colors.length) {
      colorIndex = 0;
    }
  } // end click callback
);

game.run(); // run the game!
