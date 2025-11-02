/**
 * @demo Simple Mouse Move Handler
 * @description Shows how to handle mouse movement events with GameCanvas.
 * @tags interactive, mouse, events
 */
import { GameCanvas } from "../src";

const gameCanvas = new GameCanvas("demo-canvas");

const ball = {
  x: 100,
  y: 100,
  radius: 15,
  color: 'blue',
  draw: ({ ctx }) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
  },
  move: (vx, vy) => {
    ball.x += vx;
    ball.y += vy;
  }
}

gameCanvas.addDrawing(ball.draw);
gameCanvas.addHandler('mousemove', ({ x, y }) => {
  const dx = x - ball.x;
  const dy = y - ball.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) { // Avoid jitter when very close
    const speed = 100 / 1000; // Adjust speed as needed
    const vx = (dx / distance) * speed * distance;
    const vy = (dy / distance) * speed * distance;
    ball.move(vx, vy);
  }
})

gameCanvas.run();