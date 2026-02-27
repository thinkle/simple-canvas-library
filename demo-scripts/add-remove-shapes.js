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
const shapeTypes = ['circle', 'square', 'triangle'];

// Keep track of all active shapes using simple arrays
let shapeIds = [];      // drawing IDs from addDrawing
let shapeDetails = [];  // info about each shape

// Functions to draw each shape type
function drawCircle(ctx, x, y, size, t) {
  ctx.save();
  ctx.translate(x, y);
  // Pulse effect: size oscillates over time
  let pulse = size * (0.85 + 0.15 * Math.sin(t * 2));
  ctx.beginPath();
  ctx.arc(0, 0, pulse, 0, Math.PI * 2);
  ctx.fillStyle = ctx._shapeColor; // we'll set this before calling
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawSquare(ctx, x, y, size, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t);
  ctx.fillStyle = ctx._shapeColor;
  ctx.fillRect(-size, -size, size * 2, size * 2);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(-size, -size, size * 2, size * 2);
  ctx.restore();
}

function drawTriangle(ctx, x, y, size, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size, size);
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fillStyle = ctx._shapeColor;
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function addRandomShape() {
  let color = colors[Math.floor(Math.random() * colors.length)];
  let shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
  let size = 20 + Math.random() * 20;
  let x = 60 + Math.random() * 280;
  let y = 60 + Math.random() * 180;
  let t = 0;

  // Add an animated drawing for this shape
  let drawingId = gi.addDrawing(function ({ ctx, stepTime }) {
    t += stepTime / 400; // animate rotation over time
    // Store the color so our draw functions can access it
    ctx._shapeColor = color;
    if (shapeType === 'circle') {
      drawCircle(ctx, x, y, size, t);
    } else if (shapeType === 'square') {
      drawSquare(ctx, x, y, size, t);
    } else {
      drawTriangle(ctx, x, y, size, t);
    }
  });

  shapeIds.push(drawingId);
  shapeDetails.push({ x: x, y: y, color: color, shapeType: shapeType, size: size });
}

function removeLastShape() {
  if (shapeIds.length === 0) {
    return;
  }
  let lastId = shapeIds[shapeIds.length - 1];
  gi.removeDrawing(lastId);
  shapeIds.pop();
  shapeDetails.pop();
}

function removeRandomShape() {
  if (shapeIds.length === 0) {
    return;
  }
  let index = Math.floor(Math.random() * shapeIds.length);
  let id = shapeIds[index];
  gi.removeDrawing(id);
  // Remove from both arrays at the same index
  shapeIds.splice(index, 1);
  shapeDetails.splice(index, 1);
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

gi.addDrawing(function ({ ctx, width, height }) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Use the buttons to add/remove animated shapes.', 10, 25);
  ctx.fillText('Active shapes: ' + shapeIds.length, 10, height - 15);
});

gi.run();
// Add a few initial shapes
addRandomShape();
addRandomShape();
addRandomShape();
