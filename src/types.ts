/**
 * Type for a drawing object with a draw method used in GameCanvas.
 */
export type Drawer = {
  draw: DrawingCallback;
};
/**
 * @file Shared types for SimpleCanvasLibrary (SimpleCanvas)
 * @module SimpleCanvas
 */

/** @typedef SimpleCanvas.Size
 * @property {number} width - width in pixels
 * @property {number} height - height in pixels
 */
export type Size = {
  width: number;
  height: number;
};

/**
 * @typedef SimpleCanvas.GameCanvas~drawCallback
 * @property {Object} config
 * @property {CanvasRenderingContext2D} config.ctx - drawing context
 * @property {number} config.width - width of canvas
 * @property {number} config.height - height of canvas
 * @property {number} config.elapsed - milliseconds since first drawing
 * @property {number} config.timestamp - current timestamp
 * @property {number} config.stepTime - milliseconds passed since last tick
 * @property {Function} config.remove - a function that will remove this callback from the queue
 */
export type DrawingParams = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  elapsed: number;
  timestamp: number;
  stepTime: number;
  remove: () => void;
};

/**
 * Type for a drawing callback function used in GameCanvas.
 */
export type DrawingCallback = (params: DrawingParams) => void;

/**
 * @callback SimpleCanvas.GameCanvas~eventCallback
 * @param {Object} config
 * @param {number} config.x - offsetX of event (x with respect to canvas)
 * @param {number} config.y - offsetY of event (y with respect to canvas)
 * @param {string} config.type - type of event (i.e. mouseUp)
 * @param {Event} config.event - javascript event object
 * @return {boolean|undefined} Return true to prevent other handlers from being called, or undefined/false to allow other handlers to run.
 */
export type EventCallbackArgs = {
  x: number;
  y: number;
  type: string;
  event: Event;
};

/**
 * @callback SimpleCanvas.GameCanvas~resizeCallback
 * @param {Object} config
 * @param {CanvasRenderingContext2D} config.ctx - drawing context
 * @param {number} config.width - width of canvas element (same as internal width if autoresize is true)
 * @param {number} config.height - height of canvas element (same as internal height if autoresize is true)
 * @param {HTMLCanvasElement} config.canvas - the canvas DOM element
 * @param {(w:number,h:number)=>void} config.setCanvasSize - set internal size if implementing custom sizing logic
 * @return {boolean|undefined} Return true to prevent other handlers from being called.
 */
export type ResizeCallbackArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  setCanvasSize: (w: number, h: number) => void;
};
