import { UIComponent } from "./UIComponent";

/**
 * Configuration options for Slider component
 */
export interface SliderConfig {
  /** Label text for the slider */
  label?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Initial value */
  value?: number;
  /** Step increment */
  step?: number;
  /** Callback when value changes */
  oninput?: (value: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /**
   * Simple theme overrides mapped to CSS variables.
   * e.g. { fontFamily: 'Inter, sans-serif', accentColor: '#4f46e5' }
   */
  theme?: {
    fontFamily?: string;
    color?: string; // main text color
    mutedColor?: string; // muted label/value color
    accentColor?: string; // thumb/background accent
    inputBackground?: string; // input background (for host)
    trackBackground?: string; // track color
    thumbBackground?: string; // thumb color
    thumbBorder?: string; // thumb border color
  };
  /**
   * Advanced: direct CSS variable injection. Keys should be CSS vars.
   * e.g. { '--scl-input-track-bg': '#333' }
   */
  cssVars?: Record<string, string>;
}

/**
 * Slider component for range input controls
 *
 * @example
 * ```typescript
 * const slider = new Slider({
 *   label: "Volume",
 *   min: 0,
 *   max: 100,
 *   value: 50,
 *   oninput: (value) => console.log("Volume:", value)
 * });
 * ```
 */
export class Slider extends UIComponent {
  private input!: HTMLInputElement;
  private valueDisplay!: HTMLSpanElement;
  private config: SliderConfig;

  constructor(config: SliderConfig = {}) {
    const container = document.createElement("div");
    container.style.cssText = `
      display: flex;
      align-items: center;
      margin: 5px 10px;
      gap: 8px;
      /* host CSS variables (overridable) */
      font-family: var(--scl-font-family, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
      color: var(--scl-color-text, #e6e6e6);
      background: var(--scl-input-bg, transparent);
    `;

    super(container);
    this.config = config;

    // No custom slider CSS injection; use browser default styling for compatibility

    // Apply simple theme overrides as CSS variables on the host element
    applyThemeVars(this.element, this.config.theme);
    // Apply advanced direct CSS variable overrides if provided
    if (this.config.cssVars) {
      for (const [k, v] of Object.entries(this.config.cssVars)) {
        this.element.style.setProperty(k, v);
      }
    }

    this.createSlider();
  }

  private createSlider() {
    // Label
    if (this.config.label) {
      const label = document.createElement("label");
      label.textContent = this.config.label + ":";
      label.style.cssText = `
        font-size: var(--scl-font-size, 14px);
        font-weight: 500;
        color: var(--scl-color-text, #e6e6e6);
        margin-right: 8px;
        white-space: nowrap;
      `;
      this.element.appendChild(label);
    }

    // Range input
    this.input = document.createElement("input");
    this.input.type = "range";
    this.input.min = String(this.config.min ?? 0);
    this.input.max = String(this.config.max ?? 100);
    this.input.value = String(this.config.value ?? 50);
    this.input.step = String(this.config.step ?? 1);
    this.input.disabled = this.config.disabled ?? false;

    this.input.style.cssText = `
      flex: 1;
      min-width: 100px;
      height: 20px;
      background: var(--scl-color, #5a5a5a);      
      color: var(--scl-color-text, #777777ff);
    `;

    // Remove per-instance style injection; handled globally via ensureSliderStylesInjected()

    // Value display
    this.valueDisplay = document.createElement("span");
    this.valueDisplay.textContent = this.input.value;
    this.valueDisplay.style.cssText = `
      font-size: var(--scl-font-size, 14px);
      color: var(--scl-color-muted, #9ca3af);
      min-width: 30px;
      text-align: right;
      font-family: var(--scl-font-family, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial);
    `;

    // Event listener
    this.input.addEventListener("input", () => {
      const value = parseFloat(this.input.value);
      this.valueDisplay.textContent = String(value);
      if (this.config.oninput) {
        this.config.oninput(value);
      }
    });

    this.element.appendChild(this.input);
    this.element.appendChild(this.valueDisplay);
  }

  /**
   * Get the current value
   */
  getValue(): number {
    return parseFloat(this.input.value);
  }

  /**
   * Set the value
   */
  setValue(value: number): this {
    this.input.value = String(value);
    this.valueDisplay.textContent = String(value);
    return this;
  }

  /**
   * Get whether the slider is enabled
   */
  getIsEnabled(): boolean {
    return !this.input.disabled;
  }

  /**
   * Enable the slider
   */
  enable(): this {
    this.input.disabled = false;
    return this;
  }

  /**
   * Disable the slider
   */
  disable(): this {
    this.input.disabled = true;
    return this;
  }

  /**
   * Set the min value
   */
  setMin(min: number): this {
    this.input.min = String(min);
    return this;
  }

  /**
   * Set the max value
   */
  setMax(max: number): this {
    this.input.max = String(max);
    return this;
  }

  /**
   * Set the step value
   */
  setStep(step: number): this {
    this.input.step = String(step);
    return this;
  }
}

// Removed ensureSliderStylesInjected: slider now uses browser default styling for maximum compatibility.

/**
 * Maps friendly theme keys to CSS variables and applies them to the host element.
 */
function applyThemeVars(host: HTMLElement, theme?: SliderConfig["theme"]) {
  if (!theme) return;
  const map: Record<string, string | undefined> = {
    "--scl-font-family": theme.fontFamily,
    "--scl-color-text": theme.color,
    "--scl-color-muted": theme.mutedColor,
    "--scl-color-accent": theme.accentColor,
    "--scl-input-bg": theme.inputBackground,
    "--scl-input-track-bg": theme.trackBackground,
    "--scl-input-thumb-bg": theme.thumbBackground,
    "--scl-input-thumb-border": theme.thumbBorder,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v != null) host.style.setProperty(k, v);
  }
}
