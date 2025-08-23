import { UIComponent } from './UIComponent';

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
  private input: HTMLInputElement;
  private valueDisplay: HTMLSpanElement;
  private config: SliderConfig;

  constructor(config: SliderConfig = {}) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      margin: 5px 10px;
      gap: 8px;
    `;

    super(container);
    this.config = config;
    this.createSlider();
  }

  private createSlider() {
    // Label
    if (this.config.label) {
      const label = document.createElement('label');
      label.textContent = this.config.label + ':';
      label.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-right: 8px;
        white-space: nowrap;
      `;
      this.element.appendChild(label);
    }

    // Range input
    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.min = String(this.config.min ?? 0);
    this.input.max = String(this.config.max ?? 100);
    this.input.value = String(this.config.value ?? 50);
    this.input.step = String(this.config.step ?? 1);
    this.input.disabled = this.config.disabled ?? false;

    this.input.style.cssText = `
      flex: 1;
      min-width: 100px;
      height: 20px;
      background: transparent;
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    `;

    // Custom slider styling
    const style = document.createElement('style');
    style.textContent = `
      input[type="range"]::-webkit-slider-track {
        width: 100%;
        height: 6px;
        background: #ddd;
        border-radius: 3px;
      }
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 8px;
        background: #007cba;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      input[type="range"]::-moz-range-track {
        width: 100%;
        height: 6px;
        background: #ddd;
        border-radius: 3px;
        border: none;
      }
      input[type="range"]::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 8px;
        background: #007cba;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      input[type="range"]:disabled::-webkit-slider-thumb {
        background: #ccc;
        cursor: not-allowed;
      }
      input[type="range"]:disabled::-moz-range-thumb {
        background: #ccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

    // Value display
    this.valueDisplay = document.createElement('span');
    this.valueDisplay.textContent = this.input.value;
    this.valueDisplay.style.cssText = `
      font-size: 14px;
      color: #666;
      min-width: 30px;
      text-align: right;
      font-family: monospace;
    `;

    // Event listener
    this.input.addEventListener('input', () => {
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