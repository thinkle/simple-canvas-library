// This file contains the main implementation of the SimpleCanvas library.

export type Size = {
  width: number;
  height: number;
};

export class GameCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private drawings: Array<Function>;
  private drawingMetadata: Array<any>;
  private handlers: { [key: string]: Array<Function> };
  private start: number | undefined;

  constructor(
    id: string | HTMLCanvasElement,
    config: { size?: Size; autoresize?: boolean } = {}
  ) {
    if (typeof id === "string") {
      this.canvas = document.getElementById(id) as HTMLCanvasElement;
    } else {
      this.canvas = id;
    }

    if (!this.canvas) {
      throw new Error("No canvas element found.");
    }

    this.ctx = this.canvas.getContext("2d")!;
    this.drawings = [];
    this.drawingMetadata = [];
    this.handlers = { resize: [] };
    this.setInitialCanvasSize(config.size);
    this.start = undefined;
  }

  private setInitialCanvasSize(size?: Size) {
    if (size) {
      this.width = size.width;
      this.height = size.height;
    } else {
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  public run() {
    this.tick();
  }

  private tick() {
    const ts = performance.now();
    this.doDrawing(ts);
    requestAnimationFrame(() => this.tick());
  }

  private doDrawing(ts: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawings.forEach((drawing, idx) => {
      const metadata = this.drawingMetadata[idx];
      if (!metadata.off) {
        drawing({
          ctx: this.ctx,
          width: this.width,
          height: this.height,
          timestamp: ts,
        });
      }
    });
  }

  public addDrawing(draw: Function) {
    this.drawings.push(draw);
    this.drawingMetadata.push({});
    return this.drawings.length - 1;
  }

  public removeDrawing(id: number) {
    if (this.drawingMetadata[id]) {
      this.drawingMetadata[id].off = true;
    }
  }

  public restoreDrawing(id: number) {
    if (this.drawingMetadata[id]) {
      this.drawingMetadata[id].off = false;
    }
  }

  public addClickHandler(handler: Function) {
    this.handlers.click = this.handlers.click || [];
    this.handlers.click.push(handler);
    this.canvas.addEventListener("click", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      handler({ x, y });
    });
  }
}
