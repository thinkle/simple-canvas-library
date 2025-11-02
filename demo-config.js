/**
 * Demo Configuration
 * 
 * Single source of truth for demo organization.
 * Tags are automatically extracted from demo files' @tags metadata.
 */

export const demoConfig = {
  title: "SimpleCanvasLibrary Demos",
  description: "Interactive examples showcasing the features of SimpleCanvasLibrary",
  subtitle: "Each demo shows the exact source code that's running",
  navigation: [
    {
      text: "📖 API Documentation",
      href: "../docs/index.html"
    },
    {
      text: "📦 GitHub Repository",
      href: "https://github.com/thinkle/simple-canvas-library"
    }
  ]
};

/**
 * Featured demos and categories
 * Simply reorder the arrays to change display order
 */
export const categories = [
  /*   {
      name: 'Featured',
      description: 'Start here - these demos showcase the core features',
      demos: [
        'simple-drawing',
        'simple-moving-steps',
        'simple-moving-drawing',
        'gravity',
        'advanced-cat-sprite',
        'simple-click-handler',
      ]
    }, */
  {
    name: 'Drawing and Simple Animation',
    description: 'Drawing examples using GameCanvas',
    demos: [
      'simple-drawing',
      'simple-moving-drawing',
      'simple-moving-steps',
      'gravity',
    ]
  },
  {
    name: 'Events and Interaction',
    description: 'Handling user input and interaction',
    demos: [
      'simple-click-handler',
      'simple-mousemove-handler',
      'resize-demo',
      'advanced-cat-sprite',
    ]
  },
  {
    name: 'GameInterface UI',
    description: 'Creating user interfaces with GameInterface',
    demos: [
      'gi-buttons',
      'game-interface-demo',
    ]
  },
  {
    name: 'Animation and Sprites',
    description: 'Animating graphics and using sprites',
    demos: [
      'basic-animation',
      'sprite-sheet-animation',
      'advanced-cat-sprite',
    ]
  },
];

/**
 * Category descriptions for tag-based grouping
 * Tags are automatically extracted from demo files
 */
export const tagDescriptions = {
  // Core concepts
  'basics': 'Fundamental concepts and getting started',
  'getting-started': 'Perfect for beginners learning the library',
  'advanced': 'Advanced techniques and patterns',

  // Drawing and animation
  'drawing': 'Canvas drawing techniques',
  'animation': 'Animation and movement examples',
  'timing': 'Time-based animation (elapsed time, step time)',

  // Sprites
  'sprites': 'Working with sprite graphics',
  'spritesheet': 'Using sprite sheets for animation',
  'frames': 'Frame-based sprite animation',

  // Interaction
  'interactive': 'User interaction and input handling',
  'events': 'Event handling (clicks, mouse movement, etc.)',
  'click': 'Click event handling',
  'mouse': 'Mouse tracking and interaction',
  'mouse-following': 'Interactive mouse tracking',

  // UI and GameInterface
  'game-interface': 'GameInterface class with UI controls',
  'buttons': 'Interactive button components',
  'sliders': 'Slider input controls',
  'inputs': 'Number and text input fields',
  'dialog': 'Dialog boxes and modals',
  'shapes': 'Dynamic shape creation and manipulation',

  // Other features
  'physics': 'Physics simulations and effects',
  'resize': 'Canvas resizing and responsive design',
  'responsive': 'Responsive canvas behavior',
  'orientation': 'Screen orientation handling',
  'debugging': 'Development and debugging tools',
  'analysis': 'Analysis and inspection utilities',
};
