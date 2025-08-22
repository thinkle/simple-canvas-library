/**
 * @demo Add and Remove Shapes
 * @description Interactive demo showing how to add and remove individual drawings. Click empty space to add random shapes (circle, square, triangle) with random colors. Click on any shape to remove it specifically.
 * @tags interaction, click, events, add, remove, shapes
 */

import { GameCanvas } from "../src/index.ts";

const game = new GameCanvas("demo-canvas");

// Different shapes and colors for variety
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
const shapes = ['circle', 'square', 'triangle'];

// Track all active drawings with their metadata
const activeShapes = new Map();

// Shape drawing functions
const shapeDrawers = {
  circle: (ctx, x, y, color, size) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  },
  
  square: (ctx, x, y, color, size) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size, y - size, size * 2, size * 2);
  },
  
  triangle: (ctx, x, y, color, size) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

// Check if a point is inside a shape
function isPointInShape(px, py, shape) {
  const dx = px - shape.x;
  const dy = py - shape.y;
  
  switch (shape.shape) {
    case 'circle':
      return dx * dx + dy * dy <= shape.size * shape.size;
    
    case 'square':
      return Math.abs(dx) <= shape.size && Math.abs(dy) <= shape.size;
    
    case 'triangle':
      // Simple triangle hit detection using barycentric coordinates
      // For simplicity, we'll use a circular approximation
      return dx * dx + dy * dy <= shape.size * shape.size;
    
    default:
      return false;
  }
}

// Find which shape (if any) was clicked
function findClickedShape(x, y) {
  for (const [id, shape] of activeShapes) {
    if (isPointInShape(x, y, shape)) {
      return id;
    }
  }
  return null;
}

// Add a new random shape at the given position
function addRandomShape(x, y) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = 20 + Math.random() * 20; // Random size between 20-40
  
  const shapeData = { x, y, color, shape, size };
  
  // Create the drawing function
  const drawingId = game.addDrawing(function({ ctx }) {
    shapeDrawers[shape](ctx, x, y, color, size);
  });
  
  // Store the shape data with its drawing ID
  activeShapes.set(drawingId, shapeData);
  
  return drawingId;
}

// Remove a shape by its ID
function removeShape(id) {
  if (activeShapes.has(id)) {
    game.removeDrawing(id);
    activeShapes.delete(id);
  }
}

// Add click handler
game.addClickHandler(function({ x, y }) {
  // Check if we clicked on an existing shape
  const clickedShapeId = findClickedShape(x, y);
  
  if (clickedShapeId !== null) {
    // Remove the clicked shape
    removeShape(clickedShapeId);
  } else {
    // Add a new shape at the click position
    addRandomShape(x, y);
  }
});

// Add some initial shapes to demonstrate
addRandomShape(100, 100);
addRandomShape(200, 150);
addRandomShape(300, 200);

// Add instructions
game.addDrawing(function({ ctx, width, height }) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Click empty space to add random shapes', 10, 25);
  ctx.fillText('Click on shapes to remove them', 10, 45);
  ctx.fillText(`Active shapes: ${activeShapes.size}`, 10, height - 15);
});

game.run();