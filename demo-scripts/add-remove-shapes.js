/**
 * @demo Add and Remove Shapes
 * @description Interactive demo showing how to dynamically add and remove shapes using GameInterface buttons.
 * @tags game-interface, buttons, interactive, animation, shapes
 */

import { GameInterface } from "../src/index.ts";

const demoContainer = document.getElementById('demo-container');
const gi = new GameInterface({
  canvasSize: { width: 400, height: 300 },
  autoresize: true,
  parent: demoContainer || document.body
});

const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
const shapes = ['circle', 'square', 'triangle'];
const activeShapes = new Map();

// Animated shape drawing functions
const shapeDrawers = {
  circle: ({ ctx, x, y, color, size, t }) => {
    ctx.save();
    ctx.translate(x, y);
    // Pulse effect: size oscillates
    const pulse = size * (0.85 + 0.15 * Math.sin(t * 2));
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
  square: ({ ctx, x, y, color, size, t }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t);
    ctx.fillStyle = color;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size, -size, size * 2, size * 2);
    ctx.restore();
  },
  triangle: ({ ctx, x, y, color, size, t }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
};

function addRandomShape() {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = 20 + Math.random() * 20;
  const x = 60 + Math.random() * 280;
  const y = 60 + Math.random() * 180;
  let t = 0;

  // Animated drawing
  const drawingId = gi.addDrawing(({ ctx, stepTime }) => {
    t += stepTime / 400; // Animate rotation
    shapeDrawers[shape]({ ctx, x, y, color, size, t });
  });

  activeShapes.set(drawingId, { x, y, color, shape, size, t });
  return drawingId;
}

function removeRandomShape() {
  const keys = Array.from(activeShapes.keys());
  if (keys.length === 0) return;
  const id = keys[Math.floor(Math.random() * keys.length)];
  gi.removeDrawing(id);
  activeShapes.delete(id);
}

function removeLastShape() {
  const keys = Array.from(activeShapes.keys());
  if (keys.length === 0) return;
  const id = keys[keys.length - 1];
  gi.removeDrawing(id);
  activeShapes.delete(id);
}

// UI Controls
const topBar = gi.addTopBar();
topBar.addButton({
  text: "Add Shape",
  style: { color: '#22c55e', textColor: 'white', fontSize: '16px' },
  onclick: addRandomShape
});
topBar.addButton({
  text: "Remove Last Shape",
  style: { color: '#f59e42', textColor: 'white', fontSize: '16px' },
  onclick: removeLastShape
});
topBar.addButton({
  text: "Remove Random Shape",
  style: { color: '#ff6b6b', textColor: 'white', fontSize: '16px' },
  onclick: removeRandomShape
});

gi.addDrawing(({ ctx, width, height }) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Use the buttons to add/remove animated shapes.', 10, 25);
  ctx.fillText(`Active shapes: ${activeShapes.size}`, 10, height - 15);
});

gi.run();
// Add a few initial shapes
addRandomShape();
addRandomShape();
addRandomShape();
