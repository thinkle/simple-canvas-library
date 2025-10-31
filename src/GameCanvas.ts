import { Size, DrawingParams } from "./types";

/**
 * GameCanvas sets up a canvas for creating a simple game in.
 *
 * Hand it the id of the canvas you want to use from your HTML document.
 *
 * It returns an object for registering functions to do the drawing and for
 * registering callbacks to handle events on the canvas.
 *
 * @example <caption>Make a simple spinner using only the addDrawing method.</caption>
 * ```typescript
 * const game = new GameCanvas('game'); // Set up a game on <canvas id='game'>
 * game.addDrawing(
 *    function ({ctx,elapsed}) {
 *         ctx.beginPath();
 *         ctx.moveTo(100,100);
 *         ctx.lineTo(100+Math.cos(elapsed/1000)*100,
 *                    100+Math.sin(elapsed/1000)*100);
 *         ctx.stroke()
 *    }
 * );
 * game.run();
 * ```
 *
 * @example <caption>Create a game where clicking makes balls drop.</caption>
 * ```typescript
 * const game = new GameCanvas('game');
 * const colors = ['red','green','purple','yellow','orange'];
 * const drawings: number[] = []; // track our drawings so we can remove them...
 * let colorIndex = 0;
 * let color = colors[colorIndex];
 *
 * game.addClickHandler(
 *     // When the canvas is clicked...
 *     function ({x,y}) {
 *         // Add the drawing to the game...
 *         const id = game.addDrawing(
 *             function ({ctx,elapsed,height}) {
 *                 let ypos = y + elapsed/5;
 *                 while (ypos > height) {
 *                     ypos -= height; // come around the top...
 *                 }
 *                 ctx.beginPath();
 *                 ctx.fillStyle = color;
 *                 ctx.arc(x,ypos,20,0,Math.PI*2);
 *                 ctx.fill();
 *             } // end drawing function
 *         );
 *
 *         drawings.push(id); // Keep track of our drawing so we can remove it.
 *         // If we have too many drawings, remove the first one we put on...
 *         if (drawings.length > colors.length) {
 *             const toRemove = drawings.shift()!;
 *             game.removeDrawing(toRemove);
 *         }
 *
 *         // shift colors for next ball
 *         colorIndex += 1;
 *         if (colorIndex >= colors.length) {colorIndex = 0}
 *         color = colors[colorIndex];
 *
 *     } // end click callback
 * );
 * game.run(); // run the game!
 * ```
 *
 * @memberof SimpleCanvas
 */
export class GameCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width!: number; // Initialized in setInitialCanvasSize called from constructor
  private height!: number; // Initialized in setInitialCanvasSize called from constructor
  private drawings: Array<
    | ((params: DrawingParams) => void)
    | { draw: (params: DrawingParams) => void }
  >;
  private drawingMetadata: Array<any>;
  private handlers: { [key: string]: Array<Function> };
  private autoresize: boolean;
  private animationFrameId?: number;
  private isRunning: boolean = false;

  /**
   * Creates a new GameCanvas instance.
   *
   * @param id - The Canvas Element OR the ID of the canvas element we will render the game in.
   * @param config - Optional configuration object
   * @param config.size - Optional size for canvas. Otherwise size is taken from explicitly set width/height OR from the element's size on the page.
   * @param config.autoresize - Whether to resize the game canvas to the DOM canvas automatically (defaults to true)
   */
  constructor(
    id: string | HTMLCanvasElement,
    config: { size?: Size; autoresize?: boolean } = {}
  ) {
    if (!id) {
      throw new Error(
        'GameCanvas must be called with the ID of a canvas, like this\n\nconst game=new GameCanvas("mycanvasid")'
      );
    }
    this.canvas =
      typeof id === "string"
        ? (document.getElementById(id) as HTMLCanvasElement)
        : id;
    if (!this.canvas) {
      throw new Error("No canvas element found at ID=" + id);
    }
    this.ctx = this.canvas.getContext("2d")!;
    this.drawings = [];
    this.drawingMetadata = [];
    this.handlers = { resize: [] };
    this.autoresize = config.autoresize ?? true;
    this.setInitialCanvasSize(config.size);
    this.setupHandlers();
  }

  private setInitialCanvasSize(size?: Size) {
    if (size?.width) {
      this.canvas.width = size.width;
      this.width = size.width;
    } else if (this.canvas.getAttribute("width")) {
      this.width = this.canvas.width;
    } else {
      this.width = this.canvas.clientWidth;
      this.canvas.width = this.width;
    }
    if (size?.height) {
      this.canvas.height = size.height;
      this.height = size.height;
    } else if (this.canvas.getAttribute("height")) {
      this.height = this.canvas.height;
    } else {
      this.height = this.canvas.clientHeight;
      this.canvas.height = this.height;
    }
  }

  private setupHandlers() {
    const events = [
      "click",
      "dblclick",
      "mousedown",
      "mousemove",
      "mouseup",
      "keyup",
      "keydown",
      "keypress",
    ];
    for (const eventType of events) {
      this.handlers[eventType] = [];
      this.canvas.tabIndex = 1000;
      this.canvas.addEventListener(eventType, (evt: any) => {
        const x = evt.offsetX;
        const y = evt.offsetY;
        for (const h of this.handlers[eventType]) {
          const result = h({ x, y, type: eventType, event: evt });
          if (result) return;
        }
      });
    }
  }

  private observeCanvasResize() {
    const ro = new (window as any).ResizeObserver((canvases: any) => {
      for (let cnv of canvases) {
        if (this.autoresize) {
          this.setCanvasSize(cnv.contentRect.width, cnv.contentRect.height);
        }
        for (const h of this.handlers["resize"]) {
          let result = h({
            width: cnv.contentRect.width,
            height: cnv.contentRect.height,
            canvas: this.canvas,
            setCanvasSize: this.setCanvasSize.bind(this),
            ctx: this.ctx,
          });
          if (result) return;
        }
      }
    });
    ro.observe(this.canvas);
  }

  private setCanvasSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  private doDrawing(ts: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawings.forEach((d, idx) => {
      const remove = () => {
        this.drawingMetadata[idx].off = true;
      };
      const md = this.drawingMetadata[idx];
      if (md.off) return;
      let elapsed;
      let stepTime = md.__lastTime ? ts - md.__lastTime : 0;
      md.__lastTime = ts;
      if (!md.__startTime) {
        elapsed = 0;
        md.__startTime = ts;
      } else {
        elapsed = ts - md.__startTime;
      }
      if ((d as any).draw) {
        (d as any).draw({
          ctx: this.ctx,
          width: this.width,
          height: this.height,
          remove,
          timestamp: ts,
          elapsed,
          stepTime,
        });
      } else {
        (d as any)({
          ctx: this.ctx,
          width: this.width,
          height: this.height,
          remove,
          timestamp: ts,
          elapsed,
          stepTime,
        });
      }
    });
  }

  private tick = (ts?: number) => {
    this.doDrawing(ts ?? performance.now());
    if (this.isRunning) {
      this.animationFrameId = window.requestAnimationFrame(this.tick);
    }
  };

  /**
   * run the game (start animations, listen for events).
   * @method
   */
  public run() {
    // Only observe and resize if autoresize is true and no fixed size is set
    const hasFixedSize = !!(this.canvas.getAttribute("width") || this.canvas.getAttribute("height"));
    if (this.autoresize && !hasFixedSize) {
      this.observeCanvasResize();
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
    this.isRunning = true;
    this.tick();
  }

  /**
   * Stop the game animation loop.
   * @method
   */
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  /**
   * Check if the game is currently running.
   * @returns Whether the game is running
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Add a drawing to our drawing queue (it will remain until we remove it).
   *
   * @param d - draw function OR an object with a draw callback method
   * @returns ID that can be used in removeDrawing callback to remove drawing.
   *
   * @example <caption>Passing a draw function</caption>
   * ```typescript
   * game.addDrawing(
   *     function ({ctx,elapsed}) {
   *         ctx.beginPath();
   *         ctx.moveTo(200,200);
   *         ctx.lineTo(100,200+Math.sin(elapsed/10)*200);
   *         ctx.stroke();
   *     }
   * );
   * ```
   *
   * @example <caption>Passing an object with a draw method</caption>
   * ```typescript
   * game.addDrawing(
   *      { x : 0,
   *        y : 0,
   *        w : 100,
   *        h : 100,
   *        draw ({ctx,stepTime,width,height}) {
   *           this.x += stepTime/20;
   *           this.y += stepTime/20;
   *           if (this.x > width) { this.x = 0 }
   *           if (this.y > height) { this.y = 0 }
   *           ctx.fillRect(this.x,this.y,this.w,this.h)
   *        },
   *      }
   * );
   * ```
   *
   * @example <caption>A drawing that will remove itself when it leaves the screen</caption>
   * ```typescript
   * game.addDrawing(
   *     function ({ctx,elapsed,width,remove}) {
   *         const x = elapsed / 20
   *         ctx.fillRect(x,20,20,20);
   *         if (x > width) { remove() }
   *     }
   * );
   * ```
   */
  public addDrawing(
    d:
      | ((params: {
          ctx: CanvasRenderingContext2D;
          width: number;
          height: number;
          elapsed: number;
          timestamp: number;
          stepTime: number;
          remove: () => void;
        }) => void)
      | {
          draw: (params: {
            ctx: CanvasRenderingContext2D;
            width: number;
            height: number;
            elapsed: number;
            timestamp: number;
            stepTime: number;
            remove: () => void;
          }) => void;
        }
  ): number {
    this.drawings.push(d);
    this.drawingMetadata.push({});
    return this.drawings.length - 1;
  }

  /**
   * Remove a drawing by its ID.
   *
   * @param idx - drawing ID to remove (return value from addDrawing).
   */
  public removeDrawing(idx: number) {
    if (typeof idx !== "number") {
      throw new Error(
        `removeDrawing must have a numeric ID as an argument. Received ${typeof idx} ${idx}`
      );
    }
    if (this.drawingMetadata[idx]) {
      this.drawingMetadata[idx].off = true;
    } else {
      console.log("WARNING: Attempt to remove non-existent drawing: %s", idx);
    }
  }

  /**
   * Restore a previously removed drawing (start drawing again).
   *
   * @param idx - drawing ID to restore (start drawing again).
   */
  public restoreDrawing(idx: number) {
    if (typeof idx !== "number") {
      throw new Error(
        `restoreDrawing must have a numeric ID as an argument. Received ${typeof idx} ${idx}`
      );
    }
    this.drawingMetadata[idx].off = false;
  }

  /**
   * Replace a drawing by id
   */
  public replaceDrawing(
    idx: number,
    f:
      | ((params: DrawingParams) => void)
      | { draw: (params: DrawingParams) => void }
  ) {
    this.drawings[idx] = f;
    return idx;
  }

  /**
   * Register a handler h for eventType
   * @param eventType - type of event to handle
   * @param h - handler function
   * @returns ID that can be used to remove handler with removeHandler
   *
   * @example <caption>Register a mousemove handler</caption>
   * ```typescript
   * game.addHandler('mousemove',
   *     function ({x,y}) {
   *         console.log("Mouse moved to",x,y);
   *     }
   * );
   * ```
   */
  public addHandler(
    eventType: "click" | "dblclick" | "mousedown" | "mousemove" | "mouseup",
    h: (params: {
      x: number;
      y: number;
      type: string;
      event: Event;
    }) => boolean | void
  ): number;
  public addHandler(
    eventType: "keyup" | "keydown" | "keypress",
    h: (params: { type: string; event: KeyboardEvent }) => boolean | void
  ): number;
  public addHandler(
    eventType: "resize",
    h: (params: {
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      canvas: HTMLCanvasElement;
      setCanvasSize: (w: number, h: number) => void;
    }) => boolean | void
  ): number;
  public addHandler(eventType: string, h: Function): number {
    if (!this.handlers[eventType]) {
      throw new Error(
        `No eventType ${eventType}: SimpleCanvasLibrary only supports events of type: ${Object.keys(
          this.handlers
        ).join(",")}`
      );
    }
    if (typeof h !== "function") {
      throw new Error(
        `addHandler requires a function as second argument. ${h} is a ${typeof h}, not a function.`
      );
    }
    this.handlers[eventType].push(h);
    return this.handlers[eventType].length - 1;
  }

  /**
   * Remove handler for eventType.
   */
  public removeHandler(eventType: string, idx: number) {
    if (!this.handlers[eventType]) {
      throw new Error(
        `No eventType ${eventType}: SimpleCanvasLibrary only supports events of type: ${Object.keys(
          this.handlers
        ).join(",")}`
      );
    }
    this.handlers[eventType][idx] = () => {};
  }

  /**
   * Syntactic sugar for addHandler('click',h).
   *
   * @param h - A function to handle click events
   * @returns ID that can be used to remove handler with removeClickHandler
   *
   * @example <caption>Make a drawing move whenever there is a click</caption>
   * ```typescript
   * let xpos = 100;
   * let ypos = 100;
   * // Register a handler to update our variable each time
   * // there is a click.
   * game.addClickHandler(
   *     function ({x,y}) {
   *       // set variables...
   *       xpos = x;
   *       ypos = y;
   *     }
   * )
   * // Now create a drawing that uses the variable we set.
   * game.addDrawing(
   *     function ({ctx}) {ctx.fillRect(xpos,ypos,30,30)}
   * )
   * ```
   */
  public addClickHandler(
    h: (params: {
      x: number;
      y: number;
      type: string;
      event: Event;
    }) => boolean | void
  ): number {
    if (typeof h !== "function") {
      throw new Error(
        `addClickHandler requires a function as an argument. ${h} is a ${typeof h}, not a function.`
      );
    }
    this.handlers.click.push(h);
    return this.handlers.click.length - 1;
  }

  /**
   * Syntactic sugar for removeHandler('click',h)
   */
  public removeClickHandler(idx: number) {
    this.handlers.click[idx] = () => {};
  }

  /**
   * Register a handler h for resize
   */
  public addResizeHandler(
    h: (params: {
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      canvas: HTMLCanvasElement;
      setCanvasSize: (w: number, h: number) => void;
    }) => boolean | void
  ): number {
    return this.addHandler("resize", h);
  }

  /**
   * Syntactic sugar for removeHandler('resize',h)
   */
  public removeResizeHandler(idx: number) {
    return this.removeHandler("resize", idx);
  }

  /**
   * Get current canvas size
   */
  public getSize(): Size {
    return { width: this.width, height: this.height };
  }
}
