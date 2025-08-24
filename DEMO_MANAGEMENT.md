# Demo Management System

The SimpleCanvasLibrary demo system is now modular and easily configurable through JSON configuration files.

## Quick Start

View current demo organization:

```bash
npm run demo:list
```

Move a demo to a different position:

```bash
node demo-manager.js move <demo-file> <position>
```

Toggle featured status:

```bash
node demo-manager.js feature <demo-file>
```

Set demo category:

```bash
node demo-manager.js category <demo-file> <category>
```

After making changes, rebuild the demos:

```bash
npm run build:demos
```

## Configuration File

The demo organization is controlled by `demo-config.json`:

```json
{
  "demoConfig": {
    "title": "SimpleCanvasLibrary Demos",
    "description": "Interactive examples showcasing the features",
    "subtitle": "Each demo shows the exact source code",
    "navigation": [...]
  },
  "demoOrder": [
    {
      "file": "test-library",
      "featured": true,
      "priority": 1
    },
    {
      "file": "spritesheet-inspector",
      "category": "debugging",
      "priority": 9
    }
  ],
  "categories": {
    "featured": {
      "title": "Featured Demos",
      "description": "Start here - these showcase core features"
    },
    "debugging": {
      "title": "Development Tools",
      "description": "Utilities for debugging and development"
    }
  }
}
```

## Demo Properties

Each demo in `demoOrder` can have:

- **file**: The demo script filename (without .js extension)
- **featured**: Boolean - appears in the featured section
- **category**: String - groups demo in a category section
- **priority**: Number - determines order (auto-managed by demo-manager)

## Categories

The system supports organizing demos into categories:

- **featured**: Highlighted demos for new users
- **debugging**: Development and debugging tools
- **distribution**: Integration examples
- **all**: Shows all demos (automatically generated)

## Demo Manager Commands

```bash
# List current organization
node demo-manager.js list

# Move demo to position 1 (first)
node demo-manager.js move basic-animation 1

# Toggle featured status
node demo-manager.js feature advanced-cat-sprite

# Set category
node demo-manager.js category spritesheet-inspector debugging

# Remove category
node demo-manager.js category some-demo none
```

## Generated Structure

The build system creates:

1. **Individual demo pages**: Each demo gets its own HTML file with source code display
2. **Main index page**: Organized by categories with smooth navigation
3. **Category navigation**: Jump between featured, debugging, distribution, and all demos

## Benefits

- **Easy reordering**: Simple commands to change demo order
- **Flexible categorization**: Group related demos together
- **Featured highlighting**: Showcase the best demos prominently
- **No code editing**: Pure configuration-based management
- **Automatic generation**: Consistent styling and structure
