import { UIComponent } from "./UIComponent";

/**
 * Configuration for creating a button
 */
export interface ButtonConfig {
  text: string;
  onclick: () => void;
  class?: string;
  /**
   * Friendly style overrides (e.g. { color: 'blue', textColor: 'white', fontSize: '18px', fontFamily: 'Courier' })
   */
  style?: {
    color?: string;
    textColor?: string;
    fontSize?: string;
    fontFamily?: string;
    borderColor?: string;
    hoverColor?: string;
    [key: string]: any;
  };
  /**
   * Advanced: direct CSS variable injection. Keys should be CSS vars.
   * e.g. { '--button-background': '#222' }
   */
  cssVars?: Record<string, string>;
}

/**
 * Button UI component
 */
export class Button extends UIComponent {
  private config: ButtonConfig;

  constructor(config: ButtonConfig) {
    const button = document.createElement("button");
    button.textContent = config.text;
    button.addEventListener("click", config.onclick);

    super(button);
    this.config = config;

    if (config.class) {
      button.className = config.class;
    } else {
      // Default styling using CSS variables
      button.style.cssText = `
        padding: 8px 16px;
        margin: 4px;
        border: 1px solid var(--button-border-color, #ccc);
        border-radius: 4px;
        background: var(--button-background, #f0f0f0);
        color: var(--button-text-color, #222);
        cursor: pointer;
        font-size: var(--button-font-size, 14px);
        font-family: var(--button-font-family, inherit);
        transition: background 0.15s;
      `;

      // Friendly style keys mapped to CSS variables
      if (config.style) {
        const styleMap: Record<string, string> = {
          color: "--button-background",
          textColor: "--button-text-color",
          fontSize: "--button-font-size",
          fontFamily: "--button-font-family",
          borderColor: "--button-border-color",
          hoverColor: "--button-hover-background",
        };
        for (const [key, value] of Object.entries(config.style)) {
          if (styleMap[key]) {
            button.style.setProperty(styleMap[key], value);
          }
        }
      }
      // Advanced direct CSS variable injection
      if (config.cssVars) {
        for (const [k, v] of Object.entries(config.cssVars)) {
          button.style.setProperty(k, v);
        }
      }

      button.addEventListener("mouseenter", () => {
        if (this.isEnabled) {
          button.style.background =
            getComputedStyle(button).getPropertyValue(
              "--button-hover-background"
            ) || "#e0e0e0";
        }
      });

      button.addEventListener("mouseleave", () => {
        if (this.isEnabled) {
          button.style.background =
            getComputedStyle(button).getPropertyValue("--button-background") ||
            "#f0f0f0";
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
