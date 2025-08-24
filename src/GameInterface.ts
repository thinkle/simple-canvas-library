import { GameCanvas } from "./GameCanvas";
import { TopBar, BottomBar } from "./UIBar";
import { Size } from "./types";

/**
 * Configuration for GameInterface
 */
export interface GameInterfaceConfig {
  /** Size of the canvas area */
  canvasSize?: Size;
  /** Whether to auto-resize the canvas */
  autoresize?: boolean;
  /** Container element to append to (defaults to document.body) */
  parent?: HTMLElement;
  /** CSS class for the main container */
  containerClass?: string;
  /** CSS variable overrides for this interface (e.g. { '--bar-background': '#222' }) */
  cssVars?: Record<string, string>;
}

/**
 * GameInterface extends GameCanvas functionality with UI components.
 * Creates a complete game interface with top bar, canvas, and bottom bar.
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
export class GameInterface extends GameCanvas {
  private container!: HTMLElement;
  private canvasContainer!: HTMLElement;
  private topBar?: TopBar;
  private bottomBar?: BottomBar;
  private config: GameInterfaceConfig;
  private gameState: "stopped" | "running" | "paused" = "stopped";

  constructor(config: GameInterfaceConfig = {}) {
    // Create the canvas element first
    const canvas = document.createElement("canvas");
    canvas.width = config.canvasSize?.width || 400;
    canvas.height = config.canvasSize?.height || 300;

    // Call parent constructor with the canvas element
    super(canvas, {
      size: config.canvasSize,
      autoresize: config.autoresize,
    });

    this.config = config;
    this.setupContainer(canvas);
  }

  private setupContainer(canvas: HTMLCanvasElement) {
    // Create main container
    this.container = document.createElement("div");

    if (this.config.containerClass) {
      this.container.className = this.config.containerClass;
    } else {
      this.container.style.cssText = `
        display: flex;
        flex-direction: column;
        border: 1px solid var(--container-border-color, #222);
        border-radius: 4px;
        overflow: hidden;
        background: var(--container-background, #18181b);
        max-width: 100%;
        margin: 0 auto;
        /* Dark mode CSS variable defaults */
        --container-background: #18181b;
        --container-border-color: #222;
        --canvas-container-background: #232326;
        --canvas-background: #18181b;
        --bar-background: #232326;
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
        /* Slider specific */
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
    }

    // Inject CSS variables as inline styles on the container (overrides)
    if (this.config.cssVars) {
      for (const [k, v] of Object.entries(this.config.cssVars)) {
        this.container.style.setProperty(k, v);
      }
    }

    // Create canvas container with responsive sizing
    this.canvasContainer = document.createElement("div");
    this.canvasContainer.style.cssText = `
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--canvas-container-background, #fafafa);
      min-height: 200px;
      padding: 10px;
      box-sizing: border-box;
    `;

    // Make canvas responsive within its container
    canvas.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: var(--canvas-background, transparent);
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
