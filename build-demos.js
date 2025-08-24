import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load demo configuration
function loadDemoConfig() {
  const configPath = path.join(__dirname, 'demo-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('demo-config.json not found. Please create this file to configure demo organization.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Parse demo metadata from JS file comments
function parseDemoMetadata(content) {
  const metadata = {
    title: 'Demo',
    description: 'A SimpleCanvasLibrary demo',
    tags: []
  };

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* @demo ')) {
      metadata.title = trimmed.replace('* @demo ', '');
    } else if (trimmed.startsWith('* @description ')) {
      metadata.description = trimmed.replace('* @description ', '');
    } else if (trimmed.startsWith('* @tags ')) {
      metadata.tags = trimmed.replace('* @tags ', '').split(',').map(t => t.trim());
    }
  }

  return metadata;
}

// Transform demo script to use built library instead of TypeScript source
function transformDemoScript(script) {
  // In development mode (when NODE_ENV is not production), keep TypeScript imports
  // In production, replace with built library imports
  if (process.env.NODE_ENV === 'production') {
    return script.replace(
      /import\s+{([^}]+)}\s+from\s+["']\.\.\/src\/index\.ts["']/g,
      'import { $1 } from "../dist/simple-canvas-library.es.js"'
    );
  } else {
    // Development mode - keep TypeScript imports for hot reloading
    return script;
  }
}

// Generate HTML template for a demo
function generateDemoHTML(demoScript, metadata, fileName) {
  const transformedScript = transformDemoScript(demoScript);

  // Check if this is a GameInterface demo
  const isGameInterfaceDemo = demoScript.includes('GameInterface') || demoScript.includes('game-interface');

  // Choose appropriate demo container based on type
  const demoContainerHTML = isGameInterfaceDemo
    ? `<div class="canvas-section">
        <button id="popout-toggle" class="popout-toggle" aria-pressed="false" title="Pop out to full width/height">⤢ Pop out</button>
        <h3>Demo</h3>
        <div id="demo-container"></div>
        <p><small>GameInterface creates its own complete UI structure.</small></p>
      </div>`
    : `<div class="canvas-section">
        <button id="popout-toggle" class="popout-toggle" aria-pressed="false" title="Pop out to full width/height">⤢ Pop out</button>
        <h3>Demo</h3>
        <canvas id="demo-canvas" width="400" height="300"></canvas>
        <p><small>Canvas will resize automatically if resize handling is enabled in the demo.</small></p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SimpleCanvasLibrary: ${metadata.title}</title>
    <base href="./">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
        background: #f8f9fa;
      }
      .header {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .demo-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      .canvas-section {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .code-section {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .code-header {
        background: #f1f3f4;
        padding: 10px 20px;
        border-bottom: 1px solid #e0e0e0;
        font-weight: 500;
      }
      .code-content {
        padding: 0;
        margin: 0;
        overflow-x: auto;
      }
      pre {
        margin: 0;
        padding: 20px;
        background: #f8f9fa;
        overflow-x: auto;
      }
      code {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 14px;
        line-height: 1.5;
      }
      canvas {
        border: 1px solid #ddd;
        border-radius: 4px;
        display: block;
        margin: 10px 0;
        /* make canvas responsive outside of popout */
        width: 100%;
        height: clamp(240px, 60vh, 75vh);
      }
      /* ensure GameInterface container can grow responsively too */
      #demo-container {
        width: 100%;
        min-height: clamp(240px, 60vh, 75vh);
      }
      .tags {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .tag {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      .navigation {
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .nav-link {
        color: #1976d2;
        text-decoration: none;
        margin-right: 15px;
      }
      .nav-link:hover {
        text-decoration: underline;
      }
      @media (max-width: 768px) {
        .demo-container {
          grid-template-columns: 1fr;
        }
      }

      /* Pop-out (full-viewport) styles */
      .canvas-section { position: relative; }
      .popout-toggle {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        background: #ffffffcc;
        border: 1px solid #cfd8dc;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .popout-toggle:hover { background: #fff; }
      body.popout-active { overflow: hidden; }
      .popout-active .navigation,
      .popout-active .header,
      .popout-active .code-section { display: none !important; }
      .popout-active .demo-container {
        display: block;
        margin: 0;
      }
      .popout-active .canvas-section {
        position: fixed;
        inset: 0;
        /* Use dvw/dvh to avoid mobile UI shifts and include padding inside the box */
        width: 100dvw;
        height: 100dvh;
        box-sizing: border-box;
        padding: 16px; /* now produces visible inner gutters */
        border-radius: 0;
        box-shadow: none;
        margin: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      }
      .popout-active #demo-container,
      .popout-active #demo-canvas {
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
        /* allow flex children to shrink within padded container */
        min-width: 0;
        min-height: 0;
      }
    </style>
  </head>
  <body>
    <div class="navigation">
      <a href="index.html" class="nav-link">← All Demos</a>
      <a href="../docs/index.html" class="nav-link">📖 API Docs</a>
    </div>

    <div class="header">
      <h1>${metadata.title}</h1>
      <p>${metadata.description}</p>
      ${metadata.tags.length > 0 ? `
      <div class="tags">
        ${metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      ` : ''}
    </div>

    <div class="demo-container">
      ${demoContainerHTML}

      <div class="code-section">
        <div class="code-header">Source Code</div>
        <div class="code-content">
          <pre><code>${escapeHtml(transformedScript)}</code></pre>
        </div>
      </div>
    </div>

    <script type="module">
      ${transformedScript}

      // Pop-out toggle logic with resize pulse to sync canvas size when popping in/out
      const __popBtn = document.getElementById('popout-toggle');
      if (__popBtn) {
        const body = document.body;
        const triggerResizePulse = () => {
          // After layout flips, dispatch a couple of resize events
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
          });
        };
        const activate = () => {
          body.classList.add('popout-active');
          __popBtn.setAttribute('aria-pressed', 'true');
          __popBtn.textContent = '⤡ Exit pop out';
          triggerResizePulse();
        };
        const deactivate = () => {
          body.classList.remove('popout-active');
          __popBtn.setAttribute('aria-pressed', 'false');
          __popBtn.textContent = '⤢ Pop out';
          triggerResizePulse();
        };
        __popBtn.addEventListener('click', () => {
          body.classList.contains('popout-active') ? deactivate() : activate();
        });
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && body.classList.contains('popout-active')) {
            deactivate();
          }
        });
      }
    </script>
  </body>
</html>`;
}

// Escape HTML for display in code blocks
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Generate index page with all demos
function generateIndexHTML(demos, config) {
  const { demoConfig, categories, demoOrder } = config;

  // Sort demos according to configuration
  const orderedDemos = [];
  const demoMap = new Map(demos.map(demo => [demo.fileName, demo]));

  // Add demos in the order specified in config
  for (const configDemo of demoOrder) {
    const demo = demoMap.get(configDemo.file);
    if (demo) {
      demo.config = configDemo; // Add config info to demo
      orderedDemos.push(demo);
      demoMap.delete(configDemo.file);
    }
  }

  // Add any remaining demos not in config
  orderedDemos.push(...Array.from(demoMap.values()).map(demo => {
    demo.config = { priority: 999 }; // Default low priority
    return demo;
  }));

  // Group demos by category
  const groupedDemos = {
    featured: orderedDemos.filter(demo => demo.config.featured),
    debugging: orderedDemos.filter(demo => demo.config.category === 'debugging'),
    distribution: orderedDemos.filter(demo => demo.config.category === 'distribution'),
    all: orderedDemos
  };

  function renderDemoCard(demo) {
    return `
        <div class="demo-card">
          <h3>${demo.metadata.title}</h3>
          <p>${demo.metadata.description}</p>
          <a href="${demo.fileName}.html" class="demo-link">View Demo</a>
          ${demo.metadata.tags.length > 0 ? `
          <div class="tags">
            ${demo.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </div>`;
  }

  function renderDemoSection(categoryKey, demos) {
    if (!demos.length) return '';

    const category = categories[categoryKey];
    return `
      <div class="demo-section">
        <div class="section-header">
          <h2>${category.title}</h2>
          <p>${category.description}</p>
        </div>
        <div class="demo-grid">
          ${demos.map(renderDemoCard).join('')}
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${demoConfig.title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
        background: #f8f9fa;
      }
      .header {
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 20px;
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .demo-section {
        margin: 40px 0;
      }
      .section-header {
        text-align: center;
        margin-bottom: 30px;
      }
      .section-header h2 {
        color: #333;
        margin-bottom: 8px;
      }
      .section-header p {
        color: #666;
        margin: 0;
      }
      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      .demo-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .demo-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .demo-card h3 {
        margin-top: 0;
        color: #333;
      }
      .demo-card p {
        color: #666;
        margin-bottom: 15px;
      }
      .demo-link {
        display: inline-block;
        background: #1976d2;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        transition: background 0.2s;
        font-weight: 500;
      }
      .demo-link:hover {
        background: #1565c0;
      }
      .tags {
        display: flex;
        gap: 6px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .tag {
        background: #e3f2fd;
        color: #1976d2;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
      .navigation {
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        text-align: center;
      }
      .nav-link {
        color: #1976d2;
        text-decoration: none;
        margin: 0 15px;
        font-weight: 500;
      }
      .nav-link:hover {
        text-decoration: underline;
      }
      
      /* Category navigation */
      .category-nav {
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        text-align: center;
      }
      .category-nav-link {
        display: inline-block;
        color: #666;
        text-decoration: none;
        margin: 0 10px;
        padding: 5px 12px;
        border-radius: 15px;
        transition: all 0.2s;
        font-size: 14px;
      }
      .category-nav-link:hover {
        background: #f0f0f0;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="navigation">
      ${demoConfig.navigation.map(nav =>
    `<a href="${nav.href}" class="nav-link">${nav.text}</a>`
  ).join('')}
    </div>

    <div class="header">
      <h1>${demoConfig.title}</h1>
      <p>${demoConfig.description}</p>
      <p><small>${demoConfig.subtitle}</small></p>
    </div>

    <div class="category-nav">
      <a href="#featured" class="category-nav-link">⭐ Featured</a>
      <a href="#all" class="category-nav-link">📁 All Demos</a>
      ${groupedDemos.debugging.length ? '<a href="#debugging" class="category-nav-link">🔧 Dev Tools</a>' : ''}
      ${groupedDemos.distribution.length ? '<a href="#distribution" class="category-nav-link">📦 Distribution</a>' : ''}
    </div>

    <div id="featured">
      ${renderDemoSection('featured', groupedDemos.featured)}
    </div>

    <div id="debugging">
      ${renderDemoSection('debugging', groupedDemos.debugging)}
    </div>

    <div id="distribution">
      ${renderDemoSection('distribution', groupedDemos.distribution)}
    </div>

    <div id="all">
      ${renderDemoSection('all', groupedDemos.all)}
    </div>

    <script>
      // Smooth scrolling for category navigation
      document.querySelectorAll('.category-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(e.target.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    </script>
  </body>
</html>`;
}

// Main function to generate all demo files
async function generateDemos() {
  const demoScriptsDir = path.join(__dirname, 'demo-scripts');
  const demosDir = path.join(__dirname, 'demos');

  // Load configuration
  const config = loadDemoConfig();

  // Ensure demos directory exists
  if (!fs.existsSync(demosDir)) {
    fs.mkdirSync(demosDir);
  }

  // Read all demo script files
  const demoFiles = fs.readdirSync(demoScriptsDir)
    .filter(file => file.endsWith('.js'));

  const demos = [];

  for (const file of demoFiles) {
    const fileName = path.basename(file, '.js');
    const filePath = path.join(demoScriptsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = parseDemoMetadata(content);

    demos.push({ fileName, metadata, content });

    // Generate HTML for this demo
    const html = generateDemoHTML(content, metadata, fileName);
    const outputPath = path.join(demosDir, `${fileName}.html`);
    fs.writeFileSync(outputPath, html);

    console.log(`Generated ${fileName}.html`);
  }

  // Generate index page with configuration
  const indexHTML = generateIndexHTML(demos, config);
  const indexPath = path.join(demosDir, 'index.html');
  fs.writeFileSync(indexPath, indexHTML);

  console.log('Generated demos/index.html');
  console.log(`Generated ${demos.length} demo files`);
  console.log('Demo organization controlled by demo-config.json');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemos().catch(console.error);
}

export { generateDemos };
