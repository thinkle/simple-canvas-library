import { DrawingParams } from "./types";

/**
 * Sprite config type
 */
export type SpriteConfig = {
  src: string;
  x?: number;
  y?: number;
  frameWidth: number;
  frameHeight: number;
  frame?: number;
  animate?: boolean;
  frameSequence?: number[];
  angle?: number;
  targetWidth?: number;
  targetHeight?: number;
  frameRate?: number;
  repeat?: boolean;
  update?: (sprite: Sprite, cfg: any) => void;
};

/**
 * Sprite sets up a constructor for a simple game sprite.
 *
 * You can draw your own spritesheet using a tool like https://www.piskelapp.com/
 *
 * @example <caption>Create a simple animated sprite</caption>
 * ```typescript
 * const sprite = new Sprite({
 *   src: "path/to/spritesheet.png",
 *   x: 100,
 *   y: 100,
 *   frameWidth: 32,
 *   frameHeight: 32,
 *   frameRate: 12,
 *   animate: true
 * });
 *
 * game.addDrawing(sprite);
 * ```
 *
 * @example <caption>Create a sprite with custom animation sequence</caption>
 * ```typescript
 * const walkingSprite = new Sprite({
 *   src: "character.png",
 *   x: 0,
 *   y: 0,
 *   frameWidth: 64,
 *   frameHeight: 64,
 *   frameSequence: [0, 1, 2, 1], // walk cycle
 *   frameRate: 8,
 *   animate: true
 * });
 * ```
 *
 * @memberof SimpleCanvas
 */
export class Sprite {
  public image: HTMLImageElement;
  public ready: boolean = false;
  public animate: boolean;
  public frameWidth: number;
  public frameHeight: number;
  public frameRate: number;
  public x: number;
  public y: number;
  public angle?: number;
  public frameAnimationIndex: number;
  public frameSequence?: number[];
  public targetWidth: number;
  public targetHeight: number;
  public update?: (sprite: Sprite, cfg: any) => void;
  public repeat: boolean;
  public removeOnNextFrame?: boolean;
  public frames?: number;

  /**
   * Creates a new Sprite instance.
   *
   * @param config - Configuration object for the sprite
   * @param config.src - URL of SpriteSheet resource.
   * @param config.x - Position of Sprite on the canvas (default: 0)
   * @param config.y - Position of Sprite on the canvas (default: 0)
   * @param config.frameWidth - width of each frame of the sprite sheet (required)
   * @param config.frameHeight - height of each frame of the sprite sheet (required)
   * @param config.frame - frame to start on (default: 0).
   * @param config.frameSequence - list of frame indices to run (if not specified, we run all frames in order).
   * @param config.targetWidth - width of sprite to draw on canvas (same as frameWidth if not specified)
   * @param config.targetHeight - height of sprite to draw on canvas (same as frameHeight if not specified)
   * @param config.animate - whether to animate or not (default: true).
   * @param config.frameRate - Number of frames per second to run animation at (default: 24).
   * @param config.repeat - Whether to repeat the animation or play only once (default: true)
   * @param config.angle - Angle to rotate drawing (in radians)
   * @param config.update - a callback to run on each animation frame just before drawing sprite to canvas.
   */
  constructor({
    src,
    x = 0,
    y = 0,
    frame = 0,
    animate = true,
    frameSequence,
    frameWidth,
    frameHeight,
    angle,
    targetWidth,
    targetHeight,
    frameRate = 24,
    repeat = true,
    update,
  }: SpriteConfig) {
    if (!frameWidth)
      throw new Error("Sprite not provided required parameter frameWidth");
    if (!frameHeight)
      throw new Error("Sprite not provided required parameter frameHeight");
    if (!src)
      throw new Error(
        "Sprite not provided with src or preloaded image: needs parameter src or image"
      );
    this.image = new Image();
    this.image.onload = () => {
      this.ready = true;
      if (!this.frames) {
        this.frames = this.framesAcross * this.framesDown;
      }
    };
    this.image.src = src;
    this.animate = animate;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameRate = frameRate;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.frameAnimationIndex = frame;
    this.frameSequence = frameSequence;
    this.targetWidth = targetWidth || frameWidth;
    this.targetHeight = targetHeight || frameHeight;
    this.update = update;
    this.repeat = repeat;
  }

  get framesAcross() {
    return this.image.width / this.frameWidth;
  }
  get framesDown() {
    return this.image.height / this.frameHeight;
  }
  get frame() {
    if (this.repeat) {
      if (this.frameSequence) {
        const sequenceIndex =
          this.frameAnimationIndex % this.frameSequence.length;
        return this.frameSequence[Math.floor(sequenceIndex)];
      } else {
        return this.frameAnimationIndex % (this.frames ?? 1);
      }
    } else {
      if (this.frameSequence) {
        return this.frameSequence[
          Math.min(
            Math.floor(this.frameAnimationIndex),
            this.frameSequence.length - 1
          )
        ];
      } else {
        return Math.min(
          Math.floor(this.frameAnimationIndex),
          (this.frames ?? 1) - 1
        );
      }
    }
  }
  get rowNum() {
    return Math.floor(Math.floor(this.frame) / this.framesAcross);
  }
  get colNum() {
    return Math.floor(this.frame) % this.framesAcross;
  }
  get frameX() {
    return this.colNum * this.frameWidth;
  }
  get frameY() {
    return this.rowNum * this.frameHeight;
  }

  /**
   * Create a copy of sprite.
   * @param newParams settings to override
   * @return a copy of sprite
   */
  public copy(newParams: Partial<SpriteConfig>): Sprite {
    const params = { ...this, ...newParams, src: this.image.src };
    return new Sprite(params as SpriteConfig);
  }

  /**
   * draw sprite to canvas
   */
  public draw(cfg: DrawingParams) {
    const { ctx, elapsed, stepTime, remove } = cfg;
    if (this.removeOnNextFrame) {
      remove();
    }
    if (!this.ready) {
      ctx.fillText("Loading image...", this.x, this.y);
    } else {
      if (this.update) {
        this.update(this, cfg);
      }
      if (this.angle) {
        ctx.translate(
          this.x + this.targetWidth / 2,
          this.y + this.targetHeight / 2
        );
        ctx.rotate(this.angle);
        ctx.translate(
          -(this.x + this.targetWidth / 2),
          -(this.y + this.targetHeight / 2)
        );
      }
      ctx.drawImage(
        this.image,
        this.frameX,
        this.frameY,
        this.frameWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.targetWidth,
        this.targetHeight
      );
      if (this.animate) {
        this.frameAnimationIndex += stepTime / (1000 / this.frameRate);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    }
  }
}
