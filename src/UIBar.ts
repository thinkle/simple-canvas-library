import { UIComponent } from "./UIComponent";
import { Button, ButtonConfig } from "./Button";
import { NumberInput, NumberInputConfig } from "./NumberInput";
import { Slider, SliderConfig } from "./Slider";

/**
 * Base class for UI bars (top/bottom)
 */
export abstract class UIBar extends UIComponent {
  protected components: UIComponent[] = [];

  constructor(element: HTMLElement) {
    super(element);
  }

  /**
   * Add a button to the bar
   */
  addButton(config: ButtonConfig): Button {
    const button = new Button(config);
    this.components.push(button);
    this.element.appendChild(button.getElement());
    return button;
  }

  /**
   * Add a number input to the bar
   */
  addNumberInput(config: NumberInputConfig): NumberInput {
    const input = new NumberInput(config);
    this.components.push(input);
    this.element.appendChild(input.getElement());
    return input;
  }

  /**
   * Add a slider to the bar
   */
  addSlider(config: SliderConfig): Slider {
    const slider = new Slider(config);
    this.components.push(slider);
    this.element.appendChild(slider.getElement());
    return slider;
  }

  /**
   * Remove all components from the bar
   */
  clear(): this {
    this.components.forEach((component) => {
      const element = component.getElement();
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.components = [];
    return this;
  }

  /**
   * Get all components in the bar
   */
  getComponents(): UIComponent[] {
    return [...this.components];
  }
}

/**
 * Top bar for UI components
 */
export class TopBar extends UIBar {
  constructor() {
    const element = document.createElement("div");
    element.style.cssText = `
      display: flex;
      align-items: center;
      padding: 8px;
      background: var(--bar-background, #f8f8f8);
      border-bottom: 1px solid var(--bar-border-color, #ddd);
      min-height: 40px;
      flex-wrap: wrap;
    `;
    super(element);
  }
}

/**
 * Bottom bar for UI components
 */
export class BottomBar extends UIBar {
  constructor() {
    const element = document.createElement("div");
    element.style.cssText = `
      display: flex;
      align-items: center;
      padding: 8px;
      background: var(--bar-background, #f8f8f8);
      border-top: 1px solid var(--bar-border-color, #ddd);
      min-height: 40px;
      flex-wrap: wrap;
    `;
    super(element);
  }
}
