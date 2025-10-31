/**
 * Base class for UI components.
 * Provides common functionality like show/hide, enable/disable, and access to the underlying DOM element.
 * Extend this class to create custom UI controls.
 */
export abstract class UIComponent {
  protected element: HTMLElement;
  protected isVisible: boolean = true;
  protected isEnabled: boolean = true;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Show the component
   */
  show(): this {
    this.isVisible = true;
    this.element.style.display = '';
    return this;
  }

  /**
   * Hide the component
   */
  hide(): this {
    this.isVisible = false;
    this.element.style.display = 'none';
    return this;
  }

  /**
   * Enable the component
   */
  enable(): this {
    this.isEnabled = true;
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'auto';
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLButtonElement) {
      this.element.disabled = false;
    }
    return this;
  }

  /**
   * Disable the component
   */
  disable(): this {
    this.isEnabled = false;
    this.element.style.opacity = '0.5';
    this.element.style.pointerEvents = 'none';
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLButtonElement) {
      this.element.disabled = true;
    }
    return this;
  }

  /**
   * Get the underlying DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Check if the component is visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Check if the component is enabled
   */
  getIsEnabled(): boolean {
    return this.isEnabled;
  }
}