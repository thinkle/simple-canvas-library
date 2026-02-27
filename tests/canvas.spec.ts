import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotDir = path.resolve(__dirname, "screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

/**
 * Waits for a GameCanvas to complete at least one drawing tick.
 * We poll until the canvas has non-blank pixel data.
 */
async function waitForDraw(page: any, timeout = 3000) {
  await page.waitForFunction(
    () => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      if (!canvas) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return data.data.some((v) => v !== 0);
    },
    { timeout }
  );
}

test.describe("Canvas Sizing", () => {
  test("fixed size canvas uses config.size dimensions", async ({ page }) => {
    await page.goto("/tests/fixtures/fixed-size.html");
    await waitForDraw(page);

    const canvasSize = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      };
    });

    expect(canvasSize.width).toBe(400);
    expect(canvasSize.height).toBe(300);

    await page.locator("#test-canvas").screenshot({
      path: path.join(screenshotDir, "fixed-size.png"),
    });
  });

  test("canvas sized via HTML width/height attributes", async ({ page }) => {
    await page.goto("/tests/fixtures/html-attributes.html");
    await waitForDraw(page);

    const canvasSize = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return { width: canvas.width, height: canvas.height };
    });

    expect(canvasSize.width).toBe(500);
    expect(canvasSize.height).toBe(250);

    await page.locator("#test-canvas").screenshot({
      path: path.join(screenshotDir, "html-attributes.png"),
    });
  });

  test("responsive canvas matches CSS dimensions via autoresize", async ({ page }) => {
    await page.goto("/tests/fixtures/responsive.html");
    await waitForDraw(page);

    const canvasSize = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return {
        width: canvas.width,
        height: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
      };
    });

    // Canvas pixel size should match its CSS display size
    expect(canvasSize.width).toBe(canvasSize.cssWidth);
    expect(canvasSize.height).toBe(canvasSize.cssHeight);
    // CSS sizes defined in fixture: 600x350
    expect(canvasSize.width).toBe(600);
    expect(canvasSize.height).toBe(350);

    await page.locator("#test-canvas").screenshot({
      path: path.join(screenshotDir, "responsive.png"),
    });
  });

  test("autoresize canvas updates size on resize", async ({ page }) => {
    await page.goto("/tests/fixtures/responsive.html");
    await waitForDraw(page);

    // Resize browser viewport to trigger canvas resize
    await page.setViewportSize({ width: 800, height: 500 });
    await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      // Trigger CSS layout recalculation by forcing style recalc
      canvas.style.width = "700px";
      canvas.style.height = "400px";
    });
    // Wait for ResizeObserver to fire and redraw
    await page.waitForTimeout(200);
    await waitForDraw(page);

    const updatedSize = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return { width: canvas.width, height: canvas.height };
    });

    expect(updatedSize.width).toBe(700);
    expect(updatedSize.height).toBe(400);

    await page.locator("#test-canvas").screenshot({
      path: path.join(screenshotDir, "responsive-resized.png"),
    });
  });

  test("fullscreen canvas fills the viewport", async ({ page }) => {
    const viewportWidth = 1024;
    const viewportHeight = 768;
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    await page.goto("/tests/fixtures/fullscreen.html");
    await waitForDraw(page);

    const canvasSize = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      };
    });

    // Fullscreen canvas should match the viewport dimensions
    expect(canvasSize.width).toBe(viewportWidth);
    expect(canvasSize.height).toBe(viewportHeight);

    await page.screenshot({
      path: path.join(screenshotDir, "fullscreen.png"),
    });
  });

  test("scaled canvas has correct pixel dimensions independent of CSS display size", async ({
    page,
  }) => {
    await page.goto("/tests/fixtures/scaled.html");
    await waitForDraw(page);

    const sizes = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      return {
        pixelWidth: canvas.width,
        pixelHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
      };
    });

    // Pixel dimensions should match config.size (200x100)
    expect(sizes.pixelWidth).toBe(200);
    expect(sizes.pixelHeight).toBe(100);
    // CSS display dimensions should be doubled (400x200 per the CSS)
    expect(sizes.cssWidth).toBe(400);
    expect(sizes.cssHeight).toBe(200);

    await page.locator("#test-canvas").screenshot({
      path: path.join(screenshotDir, "scaled.png"),
    });
  });
});

test.describe("Canvas Drawing", () => {
  test("fixed-size canvas renders drawing callbacks", async ({ page }) => {
    await page.goto("/tests/fixtures/fixed-size.html");
    await waitForDraw(page);

    // Sample pixel colors to verify drawing correctness
    const pixels = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width;
      const h = canvas.height;

      const sample = (x: number, y: number) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        return { r: d[0], g: d[1], b: d[2], a: d[3] };
      };

      return {
        // Top-left quadrant should be green
        topLeft: sample(w * 0.25, h * 0.25),
        // Top-right quadrant should be red (background)
        topRight: sample(w * 0.75, h * 0.25),
        // Center should be blue (circle)
        center: sample(w / 2, h / 2),
      };
    });

    // Top-left quadrant is green
    expect(pixels.topLeft.g).toBeGreaterThan(100);
    expect(pixels.topLeft.r).toBeLessThan(50);

    // Top-right quadrant is red
    expect(pixels.topRight.r).toBeGreaterThan(100);
    expect(pixels.topRight.g).toBeLessThan(50);

    // Center is blue
    expect(pixels.center.b).toBeGreaterThan(100);
    expect(pixels.center.r).toBeLessThan(50);
  });

  test("drawing receives correct width and height parameters", async ({ page }) => {
    await page.goto("/tests/fixtures/fixed-size.html");
    await waitForDraw(page);

    // The drawing draws text of the canvas size - verify by checking game state
    const gameSize = await page.evaluate(() => {
      const g = (window as any).__game;
      return g.getSize();
    });

    expect(gameSize.width).toBe(400);
    expect(gameSize.height).toBe(300);
  });

  test("scaled canvas drawing uses pixel coordinates, not CSS coordinates", async ({
    page,
  }) => {
    await page.goto("/tests/fixtures/scaled.html");
    await waitForDraw(page);

    // The checkerboard is drawn at 10px cell size in 200x100 pixel canvas.
    // Sample cells in the top-left area, away from the center cross (x=100, y=50)
    // and the bottom-right text label.
    // Cell (col, row) → dark if (col+row) is even, light if odd.
    const pixels = await page.evaluate(() => {
      const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;

      const sample = (x: number, y: number) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        return { r: d[0], g: d[1], b: d[2] };
      };

      // Sample center of each 10px cell in a 2x2 block, top-left corner:
      // cell (col=0, row=0) = dark  → sample at (5,5)
      // cell (col=1, row=0) = light → sample at (15,5)
      // cell (col=0, row=1) = light → sample at (5,15)
      // cell (col=1, row=1) = dark  → sample at (15,15)
      return {
        cell00: sample(5, 5),   // even+even = dark (#333)
        cell10: sample(15, 5),  // odd+even  = light (#ccc)
        cell01: sample(5, 15),  // even+odd  = light (#ccc)
        cell11: sample(15, 15), // odd+odd   = dark (#333)
      };
    });

    const isDark = (p: { r: number }) => p.r < 100;
    const isLight = (p: { r: number }) => p.r > 150;

    expect(isDark(pixels.cell00)).toBe(true);
    expect(isLight(pixels.cell10)).toBe(true);
    expect(isLight(pixels.cell01)).toBe(true);
    expect(isDark(pixels.cell11)).toBe(true);
  });
});

test.describe("Canvas getSize()", () => {
  test("getSize returns correct dimensions for fixed-size canvas", async ({ page }) => {
    await page.goto("/tests/fixtures/fixed-size.html");
    await waitForDraw(page);

    const size = await page.evaluate(() => (window as any).__game.getSize());
    expect(size).toEqual({ width: 400, height: 300 });
  });

  test("getSize returns correct dimensions for HTML attribute canvas", async ({ page }) => {
    await page.goto("/tests/fixtures/html-attributes.html");
    await waitForDraw(page);

    const size = await page.evaluate(() => (window as any).__game.getSize());
    expect(size).toEqual({ width: 500, height: 250 });
  });

  test("getSize returns correct dimensions for responsive canvas", async ({ page }) => {
    await page.goto("/tests/fixtures/responsive.html");
    await waitForDraw(page);

    const size = await page.evaluate(() => (window as any).__game.getSize());
    expect(size.width).toBe(600);
    expect(size.height).toBe(350);
  });
});
