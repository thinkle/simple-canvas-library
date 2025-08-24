import { GameCanvas } from "./GameCanvas";
import type { DrawingParams, EventCallbackArgs } from "./types";

export { GameCanvas } from "./GameCanvas";
export { Sprite } from "./Sprite";
export type { SpriteConfig } from "./Sprite";
export type { Size, DrawingParams } from "./types";

// UI Components
export { GameInterface } from "./GameInterface";
export type { GameInterfaceConfig } from "./GameInterface";
export { UIComponent } from "./UIComponent";
export { Button } from "./Button";
export type { ButtonConfig } from "./Button";
export { NumberInput } from "./NumberInput";
export type { NumberInputConfig } from "./NumberInput";
export { Slider } from "./Slider";
export type { SliderConfig } from "./Slider";
export { TopBar, BottomBar, UIBar } from "./UIBar";

/**
 * Test library function for demonstration purposes.
 * Creates a canvas element and demonstrates basic functionality.
 */
export function testLibrary(): void {
  const c = document.createElement("canvas");
  const body = document.getElementsByTagName("body")[0];
  body.appendChild(c);
  c.setAttribute("id", "testCanvas");
  c.setAttribute("width", "800");
  c.setAttribute("height", "800");
  const g = new GameCanvas("testCanvas");
  const id = g.addDrawing(({ ctx }: DrawingParams) => {
    ctx.fillRect(20, 20, 200, 200);
  });
  const id2 = g.addDrawing(({ ctx }: DrawingParams) => {
    ctx.fillRect(200, 200, 20, 20);
  });
  let tog = true;
  g.addClickHandler(({ x, y }: EventCallbackArgs) => {
    if (tog) {
      g.removeDrawing(id2);
    } else {
      g.restoreDrawing(id2);
    }
    tog = !tog;
    g.replaceDrawing(id, ({ ctx, elapsed }: DrawingParams) => {
      ctx.strokeRect(x, y, elapsed / 500, elapsed / 500);
    });
  });
  g.run();
}
