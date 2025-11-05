/**
 * @module UIBar
 * UI bar components for SimpleCanvasLibrary.
 */
import { UIComponent } from "./UIComponent";
import { Button, ButtonConfig } from "./Button";
import { NumberInput, NumberInputConfig } from "./NumberInput";
import { Slider, SliderConfig } from "./Slider";

/**
 * Base class for UI bars (top/bottom).
 * Provides a flexible container for UI components such as buttons, sliders, and number inputs.
 * Not intended to be used directly; use TopBar or BottomBar instead.
 * @public
 */
export abstract class UIBar extends UIComponent {
  protected components: UIComponent[] = [];

  constructor(element: HTMLElement) {
    super(element);
  }

  /**
   * Set foreground and background colors for the bar using CSS variables.
   * @param foreground - Text color
   * @param background - Background color
   */
  setColor(foreground: string, background: string): this {
    this.element.style.setProperty("--bar-background", background);
    this.element.style.setProperty("--bar-text-color", foreground);
    return this;
  }

  /**
   * Set alignment of items within the bar.
   * @param justifyContent - Justify content value (CSS flexbox)
   */
  setAlignment(
    justifyContent:
      | "start"
      | "center"
      | "end"
      | "space-between"
      | "space-around"
      | "space-evenly"
  ): this {
    this.element.style.setProperty("--bar-justify-content", justifyContent);
    return this;
  }

  /**
   * Add a title (non-interactive text) to the bar.
   * Inherits bar foreground/background colors.
   * @param text - Title text
   * @param options - Optional style overrides
   */
  addTitle(text: string, options?: Partial<CSSStyleDeclaration>): HTMLElement {
    const title = document.createElement("span");
    title.textContent = text;
    title.style.cssText = `
      color: var(--bar-text-color, inherit);
      background: var(--bar-background, inherit);      
      font-weight: bold;
      font-size: 1.1em;
      margin-right: 16px;
      padding: 2px 8px;
      border-radius: 4px;
      user-select: none;
      pointer-events: none;
      display: inline-block;
    `;
    if (options) Object.assign(title.style, options);
    this.element.appendChild(title);
    return title;
  }

  /**
   * Add arbitrary HTML or an HTMLElement to the bar.
   * @param html - HTML string or HTMLElement
   */
  addHTML(html: string | HTMLElement): HTMLElement {
    let el: HTMLElement;
    if (typeof html === "string") {
      const wrapper = document.createElement("span");
      wrapper.innerHTML = html;
      el = wrapper;
    } else {
      el = html;
    }
    this.element.appendChild(el);
    return el;
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
 * TopBar is a horizontal bar for UI components, typically placed above the canvas.
 * Use addButton, addSlider, addNumberInput to add controls.
 * @public
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
      justify-content: var(--bar-justify-content, start);
    `;
    super(element);
  }
}

/**
 * BottomBar is a horizontal bar for UI components, typically placed below the canvas.
 * Use addButton, addSlider, addNumberInput to add controls.
 * @public
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
      justify-content: var(--bar-justify-content, start);
    `;
    super(element);
  }
}
