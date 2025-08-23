import { UIComponent } from './UIComponent';

/**
 * Configuration for creating a button
 */
export interface ButtonConfig {
  text: string;
  onclick: () => void;
  class?: string;
}

/**
 * Button UI component
 */
export class Button extends UIComponent {
  private config: ButtonConfig;

  constructor(config: ButtonConfig) {
    const button = document.createElement('button');
    button.textContent = config.text;
    button.addEventListener('click', config.onclick);
    
    super(button);
    this.config = config;
    
    if (config.class) {
      button.className = config.class;
    } else {
      // Default styling
      button.style.cssText = `
        padding: 8px 16px;
        margin: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #f0f0f0;
        cursor: pointer;
        font-size: 14px;
      `;
      
      button.addEventListener('mouseenter', () => {
        if (this.isEnabled) {
          button.style.background = '#e0e0e0';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (this.isEnabled) {
          button.style.background = '#f0f0f0';
        }
      });
    }
  }

  /**
   * Update the button text
   */
  setText(text: string): this {
    this.config.text = text;
    this.element.textContent = text;
    return this;
  }

  /**
   * Get the current button text
   */
  getText(): string {
    return this.config.text;
  }
}