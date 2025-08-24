#!/usr/bin/env node --input-type=module

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'demo-config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Configuration saved to demo-config.json');
}

function listDemos() {
  const config = loadConfig();
  console.log('\n📋 Current Demo Organization:\n');

  config.demoOrder.forEach((demo, index) => {
    const badges = [];
    if (demo.featured) badges.push('⭐ Featured');
    if (demo.category) badges.push(`📁 ${demo.category}`);

    console.log(`${index + 1}. ${demo.file} ${badges.length ? `(${badges.join(', ')})` : ''}`);
  });

  console.log('\n📂 Categories:');
  Object.entries(config.categories).forEach(([key, category]) => {
    if (key !== 'all') {
      console.log(`  ${key}: ${category.title} - ${category.description}`);
    }
  });
}

function moveDemo(demoFile, newPosition) {
  const config = loadConfig();
  const currentIndex = config.demoOrder.findIndex(demo => demo.file === demoFile);

  if (currentIndex === -1) {
    console.log(`❌ Demo "${demoFile}" not found`);
    return;
  }

  const targetIndex = parseInt(newPosition) - 1;
  if (targetIndex < 0 || targetIndex >= config.demoOrder.length) {
    console.log(`❌ Invalid position ${newPosition}. Must be between 1 and ${config.demoOrder.length}`);
    return;
  }

  // Remove from current position and insert at new position
  const [demo] = config.demoOrder.splice(currentIndex, 1);
  config.demoOrder.splice(targetIndex, 0, demo);

  // Update priorities
  config.demoOrder.forEach((demo, index) => {
    demo.priority = index + 1;
  });

  saveConfig(config);
  console.log(`✅ Moved "${demoFile}" to position ${newPosition}`);
}

function toggleFeatured(demoFile) {
  const config = loadConfig();
  const demo = config.demoOrder.find(demo => demo.file === demoFile);

  if (!demo) {
    console.log(`❌ Demo "${demoFile}" not found`);
    return;
  }

  demo.featured = !demo.featured;
  saveConfig(config);
  console.log(`✅ ${demo.featured ? 'Added' : 'Removed'} "${demoFile}" ${demo.featured ? 'to' : 'from'} featured demos`);
}

function setCategory(demoFile, category) {
  const config = loadConfig();
  const demo = config.demoOrder.find(demo => demo.file === demoFile);

  if (!demo) {
    console.log(`❌ Demo "${demoFile}" not found`);
    return;
  }

  if (category === 'none') {
    delete demo.category;
    console.log(`✅ Removed category from "${demoFile}"`);
  } else {
    demo.category = category;
    console.log(`✅ Set category of "${demoFile}" to "${category}"`);
  }

  saveConfig(config);
}

// Command line interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    listDemos();
    break;

  case 'move':
    if (args.length !== 2) {
      console.log('Usage: node demo-manager.js move <demo-file> <new-position>');
      process.exit(1);
    }
    moveDemo(args[0], args[1]);
    break;

  case 'feature':
    if (args.length !== 1) {
      console.log('Usage: node demo-manager.js feature <demo-file>');
      process.exit(1);
    }
    toggleFeatured(args[0]);
    break;

  case 'category':
    if (args.length !== 2) {
      console.log('Usage: node demo-manager.js category <demo-file> <category|none>');
      process.exit(1);
    }
    setCategory(args[0], args[1]);
    break;

  default:
    console.log(`
🎛️  Demo Manager - SimpleCanvasLibrary

Usage:
  node demo-manager.js list                           # Show current demo organization
  node demo-manager.js move <demo-file> <position>    # Move demo to specific position
  node demo-manager.js feature <demo-file>            # Toggle featured status
  node demo-manager.js category <demo-file> <cat>     # Set category (debugging, distribution, or none)

Examples:
  node demo-manager.js list
  node demo-manager.js move basic-animation 1
  node demo-manager.js feature advanced-cat-sprite
  node demo-manager.js category spritesheet-inspector debugging

After making changes, run: npm run build:demos
`);
    break;
}
