import { UIComponent } from './UIComponent';

/**
 * Configuration for creating a number input
 */
export interface NumberInputConfig {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  label?: string;
  oninput: (value: number) => void;
  class?: string;
}

/**
 * Number input UI component
 */
export class NumberInput extends UIComponent {
  private config: NumberInputConfig;
  private input: HTMLInputElement;
  private label?: HTMLLabelElement;

  constructor(config: NumberInputConfig) {
    const container = document.createElement('div');
    
    if (config.class) {
      container.className = config.class;
    } else {
      container.style.cssText = `
        display: inline-flex;
        align-items: center;
        margin: 4px;
        gap: 8px;
      `;
    }

    let label: HTMLLabelElement | undefined;
    // Create label if provided
    if (config.label) {
      label = document.createElement('label');
      label.textContent = config.label + ':';
      label.style.cssText = `
        font-size: 14px;
        font-weight: bold;
      `;
      container.appendChild(label);
    }

    // Create input
    const input = document.createElement('input');
    input.type = 'number';
    
    if (config.min !== undefined) input.min = config.min.toString();
    if (config.max !== undefined) input.max = config.max.toString();
    if (config.step !== undefined) input.step = config.step.toString();
    if (config.value !== undefined) input.value = config.value.toString();

    if (!config.class) {
      input.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        width: 80px;
      `;
    }

    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        config.oninput(value);
      }
    });

    container.appendChild(input);

    super(container);
    
    // Now assign to instance properties after super()
    this.config = config;
    this.input = input;
    this.label = label;
  }

  /**
   * Get the current value
   */
  getValue(): number {
    return parseFloat(this.input.value) || 0;
  }

  /**
   * Set the value
   */
  setValue(value: number): this {
    this.input.value = value.toString();
    this.config.oninput(value);
    return this;
  }

  /**
   * Update the label text
   */
  setLabel(label: string): this {
    if (this.label) {
      this.label.textContent = label + ':';
    }
    return this;
  }

  /**
   * Enable the input
   */
  enable(): this {
    super.enable();
    this.input.disabled = false;
    return this;
  }

  /**
   * Disable the input
   */
  disable(): this {
    super.disable();
    this.input.disabled = true;
    return this;
  }
}