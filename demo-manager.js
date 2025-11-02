#!/usr/bin/env node --input-type=module

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { categories as importedCategories, tagDescriptions } from './demo-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'demo-config.js');

function loadConfig() {
  // Return a deep copy to avoid mutating the imported config
  return JSON.parse(JSON.stringify(importedCategories));
}

function saveConfig(categories) {
  // Read the current file
  let content = fs.readFileSync(configPath, 'utf-8');

  // Find and replace the categories array
  const categoriesStr = JSON.stringify(categories, null, 2)
    .split('\n')
    .map((line, i) => i === 0 ? line : '  ' + line)
    .join('\n');

  // Replace the categories export
  content = content.replace(
    /export const categories = \[[\s\S]*?\n\];/,
    `export const categories = ${categoriesStr};`
  );

  fs.writeFileSync(configPath, content);
  console.log('✅ Configuration saved to demo-config.js');
}

function listDemos() {
  const categories = loadConfig();
  console.log('\n📋 Current Demo Organization:\n');

  categories.forEach((category, catIndex) => {
    console.log(`\n${category.name}:`);
    if (category.demos.length === 0) {
      console.log('  (Auto-populated with all demos)');
    } else {
      category.demos.forEach((demo, demoIndex) => {
        console.log(`  ${catIndex + 1}.${demoIndex + 1}. ${demo}`);
      });
    }
  });

  console.log('\n🏷️  Available Tag Descriptions:');
  Object.entries(tagDescriptions).forEach(([tag, description]) => {
    console.log(`  #${tag}: ${description}`);
  });
}

function moveDemo(categoryName, demoFile, newPosition) {
  const categories = loadConfig();
  const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    console.log(`❌ Category "${categoryName}" not found`);
    console.log('Available categories:', categories.map(c => c.name).join(', '));
    return;
  }

  if (category.demos.length === 0) {
    console.log(`❌ Cannot move demos in auto-populated category "${categoryName}"`);
    return;
  }

  const currentIndex = category.demos.indexOf(demoFile);
  if (currentIndex === -1) {
    console.log(`❌ Demo "${demoFile}" not found in category "${categoryName}"`);
    return;
  }

  const targetIndex = parseInt(newPosition) - 1;
  if (targetIndex < 0 || targetIndex >= category.demos.length) {
    console.log(`❌ Invalid position ${newPosition}. Must be between 1 and ${category.demos.length}`);
    return;
  }

  // Remove from current position and insert at new position
  const [demo] = category.demos.splice(currentIndex, 1);
  category.demos.splice(targetIndex, 0, demo);

  saveConfig(categories);
  console.log(`✅ Moved "${demoFile}" to position ${newPosition} in "${categoryName}"`);
}

function addDemo(categoryName, demoFile, position) {
  const categories = loadConfig();
  const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    console.log(`❌ Category "${categoryName}" not found`);
    console.log('Available categories:', categories.map(c => c.name).join(', '));
    return;
  }

  if (category.demos.length === 0 && category.name !== 'All Demos') {
    console.log(`❌ Cannot add demos to auto-populated category "${categoryName}"`);
    return;
  }

  if (category.demos.includes(demoFile)) {
    console.log(`❌ Demo "${demoFile}" already exists in "${categoryName}"`);
    return;
  }

  if (position) {
    const index = parseInt(position) - 1;
    if (index < 0 || index > category.demos.length) {
      console.log(`❌ Invalid position ${position}. Must be between 1 and ${category.demos.length + 1}`);
      return;
    }
    category.demos.splice(index, 0, demoFile);
  } else {
    category.demos.push(demoFile);
  }

  saveConfig(categories);
  console.log(`✅ Added "${demoFile}" to "${categoryName}"${position ? ` at position ${position}` : ''}`);
}

function removeDemo(categoryName, demoFile) {
  const categories = loadConfig();
  const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    console.log(`❌ Category "${categoryName}" not found`);
    return;
  }

  const index = category.demos.indexOf(demoFile);
  if (index === -1) {
    console.log(`❌ Demo "${demoFile}" not found in "${categoryName}"`);
    return;
  }

  category.demos.splice(index, 1);
  saveConfig(categories);
  console.log(`✅ Removed "${demoFile}" from "${categoryName}"`);
}

// Command line interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    listDemos();
    break;

  case 'move':
    if (args.length !== 3) {
      console.log('Usage: node demo-manager.js move <category> <demo-file> <new-position>');
      process.exit(1);
    }
    moveDemo(args[0], args[1], args[2]);
    break;

  case 'add':
    if (args.length < 2 || args.length > 3) {
      console.log('Usage: node demo-manager.js add <category> <demo-file> [position]');
      process.exit(1);
    }
    addDemo(args[0], args[1], args[2]);
    break;

  case 'remove':
    if (args.length !== 2) {
      console.log('Usage: node demo-manager.js remove <category> <demo-file>');
      process.exit(1);
    }
    removeDemo(args[0], args[1]);
    break;

  default:
    console.log(`
🎛️  Demo Manager - SimpleCanvasLibrary

Usage:
  node demo-manager.js list                                      # Show current demo organization
  node demo-manager.js move <category> <demo-file> <position>    # Move demo within a category
  node demo-manager.js add <category> <demo-file> [position]     # Add demo to category
  node demo-manager.js remove <category> <demo-file>             # Remove demo from category

Examples:
  node demo-manager.js list
  node demo-manager.js move Featured simple-drawing 1
  node demo-manager.js add Featured basic-animation
  node demo-manager.js add Featured gravity 3
  node demo-manager.js remove Featured simple-click-handler

Note: 
  - Category names are case-insensitive
  - Demos are organized by editing demo-config.js categories array
  - Tags are automatically extracted from @tags metadata in demo files
  - To reorder, just move demos around in the categories array

After making changes, run: npm run build:demos
`);
    break;
}
