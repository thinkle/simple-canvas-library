import { GameCanvas } from "./GameCanvas";
import { TopBar, BottomBar, UIBar } from "./UIBar";
import { Button, ButtonConfig } from "./Button";
import { NumberInput, NumberInputConfig } from "./NumberInput";
import { Slider, SliderConfig } from "./Slider";
import { Size } from "./types";

/**
 * Configuration for GameInterface
 */
export interface GameInterfaceConfig {
  /** Size of the canvas area */
  canvasSize?: Size;
  /** Whether to auto-resize the canvas bitmap to match display size */
  autoresize?: boolean;
  /**
   * If true, canvas display scales to fit container while maintaining aspect ratio.
   * Use with canvasSize to have fixed logical resolution with flexible display size.
   * Example: canvasSize: {width: 800, height: 600}, scaleToFit: true
   */
  scaleToFit?: boolean;
  /** Container element to append to (defaults to document.body) */
  parent?: HTMLElement;
  /** CSS class for the main container */
  containerClass?: string;
  /** CSS variable overrides for this interface (e.g. { '--bar-background': '#222' }) */
  cssVars?: Record<string, string>;
  /** If true, make the interface fullscreen (canvas fills viewport, no scroll) */
  fullscreen?: boolean;
}

/**
 * GameInterface extends GameCanvas functionality with UI components.
 * Creates a complete game interface with top bar, canvas, and bottom bar.
 * Provides methods to add UI controls, dialogs, and manage game state.
 *
 * @example
 * ```typescript
 * const gi = new GameInterface();
 * gi.addTopBar().addButton({text: "Start", onclick: () => console.log("Started!")});
 * const bottomBar = gi.addBottomBar();
 * bottomBar.addNumberInput({
 *   label: "Players",
 *   min: 1,
 *   max: 4,
 *   value: 2,
 *   oninput: (value) => console.log("Players:", value)
 * });
 * gi.run();
 * ```
 */
/**
 * GameInterface extends GameCanvas functionality with UI components.
 *
 * This class provides a complete game interface with a top bar, canvas, and bottom bar.
 * You can use it to add UI controls such as buttons, sliders, and number inputs to your game layout.
 *
 * ### Example: Add a top bar with a title
 * ```typescript
 * import { GameInterface } from "simple-canvas-library";
 *
 * const gi = new GameInterface();
 * const topBar = gi.addTopBar();
 * topBar.addButton({
 *   text: "Game Title",
 * });
 *
 * ### Example: Add a bottom bar with a button
 * const bottomBar = gi.addBottomBar();
 * bottomBar.addButton({
 *   text: "Start Game",
 *   onclick: () => gi.dialog("Game Started!", "Good luck!")
 * });
 *
 * gi.run();
 * ```
 *
 * See also:
 * - {@link TopBar}
 * - {@link BottomBar}
 * - {@link Button}
 * - {@link NumberInput}
 * - {@link Slider}
 * - {@link UIBar}
 */
export class GameInterface extends GameCanvas {
  /** UI Components available for use in GameInterface */
  private container!: HTMLElement;
  private canvasContainer!: HTMLElement;
  private topBar?: TopBar;
  private bottomBar?: BottomBar;
  private config: GameInterfaceConfig;
  private gameState: "stopped" | "running" | "paused" = "stopped";

  constructor(config: GameInterfaceConfig = {}) {
    // Create the canvas element first
    const canvas = document.createElement("canvas");

    // Handle contradictory configuration
    const hasExplicitSize = !!config.canvasSize;
    const explicitAutoresize = config.autoresize !== undefined;
    const useScaleToFit = !!(config.scaleToFit && hasExplicitSize);

    if (hasExplicitSize && explicitAutoresize && config.autoresize) {
      console.warn(
        "GameInterface: Both canvasSize and autoresize:true were specified. " +
          "This is contradictory - autoresize will be ignored and canvas will use the specified size. " +
          "Did you mean to use scaleToFit:true instead?"
      );
    }

    if (config.scaleToFit && !hasExplicitSize) {
      console.warn(
        "GameInterface: scaleToFit requires canvasSize to be specified. " +
          "Falling back to autoresize mode."
      );
    }

    // Determine sizing behavior:
    // - If scaleToFit + explicit size: fixed logical size, CSS scales display
    // - If explicit size only: fixed size, no scaling
    // - If no size: default to autoresize (bitmap matches display)
    const shouldAutoresize = useScaleToFit
      ? false
      : hasExplicitSize
      ? false
      : config.autoresize ?? true;

    // Set initial canvas size if we have an explicit size or scaleToFit
    if (hasExplicitSize) {
      canvas.width = config.canvasSize!.width;
      canvas.height = config.canvasSize!.height;
    }

    // Call parent constructor with the canvas element
    super(canvas, {
      size: config.canvasSize,
      autoresize: shouldAutoresize,
    });

    this.config = config;
    this.setupContainer(
      canvas,
      hasExplicitSize,
      shouldAutoresize,
      useScaleToFit
    );
  }

  private setupContainer(
    canvas: HTMLCanvasElement,
    hasExplicitSize: boolean,
    shouldAutoresize: boolean,
    useScaleToFit: boolean
  ) {
    // Create main container
    this.container = document.createElement("div");

    // CSS variables - defined once for all modes
    const cssVars = `
      --container-background: #18181b;
      --container-border-color: #222;
      --canvas-container-background: #232326;
      --canvas-background: #18181b;
      --bar-background: #232326;
      --bar-text-color: #e6e6e6;
      --bar-border-color: #333;
      --button-background: #232326;
      --button-hover-background: #333;
      --button-border-color: #333;
      --button-text-color: #e6e6e6;
      --input-background: #232326;
      --input-border-color: #333;
      --input-text-color: #e6e6e6;
      --input-container-background: transparent;
      --label-color: #e6e6e6;
      --dialog-background: #232326;
      --dialog-title-color: #e6e6e6;
      --dialog-message-color: #b3b3b3;
      --close-button-background: #22c55e;
      --close-button-color: #18181b;
      --scl-font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      --scl-font-size: 14px;
      --scl-color-text: #e6e6e6;
      --scl-color-muted: #9ca3af;
      --scl-color-accent: #22c55e;
      --scl-input-bg: transparent;
      --scl-input-track-bg: #444;
      --scl-input-thumb-bg: #22c55e;
      --scl-input-thumb-border: #18181b;
    `;

    if (this.config.containerClass) {
      this.container.className = this.config.containerClass;
    } else if (this.config.fullscreen) {
      // Fullscreen mode: fill viewport
      this.container.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        border: none;
        border-radius: 0;
        overflow: hidden;
        background: var(--container-background);
        width: 100vw;
        height: 100vh;
        margin: 0;
        ${cssVars}
      `;
      document.body.style.overflow = "hidden";
    } else {
      // Normal mode: flexible or fixed size
      // Only fill container if autoresize without explicit size
      // scaleToFit should size to content (inline-flex) so UI respects canvas size
      const shouldFillContainer = !hasExplicitSize && shouldAutoresize;

      this.container.style.cssText = `
        display: ${shouldFillContainer ? "flex" : "inline-flex"};
        flex-direction: column;
        border: 1px solid var(--container-border-color);
        border-radius: 4px;
        overflow: hidden;
        background: var(--container-background);
        margin: 0 auto;
        box-sizing: border-box;
        ${shouldFillContainer ? "width: 100%; height: 100%;" : ""}
        ${cssVars}
      `;
    }

    // User CSS variable overrides
    if (this.config.cssVars) {
      for (const [k, v] of Object.entries(this.config.cssVars)) {
        this.container.style.setProperty(k, v);
      }
    }

    // Create canvas container
    this.canvasContainer = document.createElement("div");

    // Determine layout CSS based on mode
    const isFullscreen = this.config.fullscreen;
    
    // Canvas container needs flex when:
    // - fullscreen (fills viewport)
    // - autoresize without explicit size (fills parent)
    // - scaleToFit (needs to provide space for canvas to scale within)
    let containerLayoutCss = "";
    if (isFullscreen || shouldAutoresize || useScaleToFit) {
      containerLayoutCss = "flex: 1; min-height: 0;";
    }
    
    let canvasLayoutCss = "";
    if (useScaleToFit) {
      // scaleToFit mode: fixed logical size, scales to fit with aspect ratio preserved
      const aspectRatio = this.config.canvasSize!.width / this.config.canvasSize!.height;
      canvasLayoutCss = `
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: ${aspectRatio};
        object-fit: contain;
      `;
    } else if (isFullscreen || shouldAutoresize) {
      // Flexible modes: fill container
      canvasLayoutCss = `
        width: 100%;
        height: 100%;
        ${isFullscreen ? "max-width: 100vw; max-height: 100vh;" : ""}
      `;
    }

    // Canvas container styling (common styles + layout)
    this.canvasContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--canvas-container-background);
      padding: ${isFullscreen ? "0" : "10px"};
      box-sizing: border-box;
      ${containerLayoutCss}
    `;

    // Canvas styling (common styles + layout)
    canvas.style.cssText = `
      border: ${isFullscreen ? "none" : "1px solid #ddd"};
      border-radius: ${isFullscreen ? "0" : "4px"};
      background: var(--canvas-background);
      display: block;
      ${canvasLayoutCss}
    `;

    // Add canvas to container
    this.canvasContainer.appendChild(canvas);
    this.container.appendChild(this.canvasContainer);

    // Append to parent element
    const parent = this.config.parent || document.body;
    parent.appendChild(this.container);
  }

  /**
   * Add and return a top bar for UI components.
   * If a top bar already exists, returns the existing one.
   */
  addTopBar(): TopBar {
    if (!this.topBar) {
      this.topBar = new TopBar();
      // Insert at the beginning of container
      this.container.insertBefore(
        this.topBar.getElement(),
        this.container.firstChild
      );
    }
    return this.topBar;
  }

  /**
   * Add and return a bottom bar for UI components.
   * If a bottom bar already exists, returns the existing one.
   */
  addBottomBar(): BottomBar {
    if (!this.bottomBar) {
      this.bottomBar = new BottomBar();
      this.container.appendChild(this.bottomBar.getElement());
    }
    return this.bottomBar;
  }

  /**
   * Get the top bar if it exists
   */
  getTopBar(): TopBar | undefined {
    return this.topBar;
  }

  /**
   * Get the bottom bar if it exists
   */
  getBottomBar(): BottomBar | undefined {
    return this.bottomBar;
  }

  /**
   * Remove the top bar
   */
  removeTopBar(): this {
    if (this.topBar) {
      const element = this.topBar.getElement();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.topBar = undefined;
    }
    return this;
  }

  /**
   * Remove the bottom bar
   */
  removeBottomBar(): this {
    if (this.bottomBar) {
      const element = this.bottomBar.getElement();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.bottomBar = undefined;
    }
    return this;
  }

  /**
   * Show a simple dialog with a message
   */
  dialog(
    title: string,
    message?: string,
    onClose?: () => void
  ): HTMLDialogElement {
    const dialog = document.createElement("dialog");
    dialog.style.cssText = `
      border: none;
      border-radius: 8px;
      padding: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
      background: var(--dialog-background, #fff);
    `;

    const content = document.createElement("div");
    content.style.cssText = `
      padding: 20px;
      text-align: center;
    `;

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 10px 0;
      color: var(--dialog-title-color, #333);
    `;
    content.appendChild(titleEl);

    if (message) {
      const messageEl = document.createElement("p");
      messageEl.textContent = message;
      messageEl.style.cssText = `
        margin: 0 0 20px 0;
        color: var(--dialog-message-color, #666);
        line-height: 1.4;
      `;
      content.appendChild(messageEl);
    }

    const closeButton = document.createElement("button");
    closeButton.textContent = "OK";
    closeButton.style.cssText = `
      padding: 8px 20px;
      background: var(--close-button-background, #007cba);
      color: var(--close-button-color, #fff);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    closeButton.addEventListener("click", () => {
      dialog.close();
      if (onClose) onClose();
    });

    content.appendChild(closeButton);
    dialog.appendChild(content);

    // Close on backdrop click
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
        if (onClose) onClose();
      }
    });

    document.body.appendChild(dialog);
    dialog.showModal();

    // Remove from DOM when closed
    dialog.addEventListener("close", () => {
      document.body.removeChild(dialog);
    });

    return dialog;
  }

  /**
   * Get the main container element
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * Get the current game state
   */
  getGameState(): "stopped" | "running" | "paused" {
    return this.gameState;
  }

  /**
   * Start the game (override parent to track state)
   */
  run(): void {
    super.run();
    this.gameState = "running";
  }

  /**
   * Pause the game
   */
  pause(): void {
    super.stop();
    this.gameState = "paused";
  }

  /**
   * Resume the game
   */
  resume(): void {
    super.run();
    this.gameState = "running";
  }

  /**
   * Stop the game completely
   */
  stop(): void {
    super.stop();
    this.gameState = "stopped";
  }

  /**
   * Reset the game (alias for stop)
   */
  reset(): void {
    this.stop();
  }

  /**
   * Destroy the interface and clean up DOM elements
   */
  destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
export { UIBar, BottomBar };
