import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { demoConfig, categories, tagDescriptions } from './demo-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Build demo order from categories
  const demoOrder = [];
  for (const category of categories) {
    for (const demo of category.demos) {
      if (!demoOrder.includes(demo)) {
        demoOrder.push(demo);
      }
    }
  }
  const currentIndex = demoOrder.indexOf(fileName);
  const prevDemo = currentIndex > 0 ? demoOrder[currentIndex - 1] : null;
  const nextDemo = currentIndex < demoOrder.length - 1 ? demoOrder[currentIndex + 1] : null;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SimpleCanvasLibrary: ${metadata.title}</title>
    <base href="./">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
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
        text-decoration: none;
        display: inline-block;
        transition: background 0.2s;
      }
      .tag:hover {
        background: #bbdefb;
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
      .demo-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 32px 0 0 0;
        gap: 16px;
      }
      .demo-nav-btn {
        background: #e3f2fd;
        color: #1976d2;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.2s;
      }
      .demo-nav-btn:hover {
        background: #bbdefb;
      }
      @media (max-width: 768px) {
        .demo-container {
          grid-template-columns: 1fr;
        }
        .demo-nav {
          flex-direction: column;
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
    <nav class="demo-nav">
      ${prevDemo ? `<a class="demo-nav-btn" href="${prevDemo}.html">← Previous</a>` : '<span></span>'}      
      ${nextDemo ? `<a class="demo-nav-btn" href="${nextDemo}.html">Next →</a>` : '<span></span>'}
    </nav>
    <div class="header">
      <h1>${metadata.title}</h1>
      <p>${metadata.description}</p>
      ${metadata.tags.length > 0 ? `
      <div class="tags">
        ${metadata.tags.map(tag => `<a href="index.html#tag-${tag}" class="tag">${tag}</a>`).join('')}
      </div>
      ` : ''}
    </div>
    
    <div class="demo-container">
      ${demoContainerHTML}

      <div class="code-section">
        <div class="code-header">Source Code</div>
        <div class="code-content">
          <pre><code class="language-js">${escapeHtml(transformedScript)}</code></pre>
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
    <script>hljs.highlightAll();</script>
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
function generateIndexHTML(demos) {
  // Create demo map for easy lookup
  const demoMap = new Map(demos.map(demo => [demo.fileName, demo]));

  // Build grouped demos based on categories
  const groupedDemos = [];
  for (const category of categories) {
    const categoryDemos = [];
    if (category.demos.length === 0) {
      // "All Demos" category - add all demos
      categoryDemos.push(...demos);
    } else {
      // Add demos in the order specified
      for (const demoFileName of category.demos) {
        const demo = demoMap.get(demoFileName);
        if (demo) {
          categoryDemos.push(demo);
        }
      }
    }
    groupedDemos.push({
      name: category.name,
      description: category.description,
      demos: categoryDemos
    });
  }

  // Collect all tags from demos
  const tagMap = new Map();
  for (const demo of demos) {
    for (const tag of demo.metadata.tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag).push(demo);
    }
  }
  const sortedTags = Array.from(tagMap.keys()).sort();

  function renderDemoCard(demo) {
    return `
        <div class="demo-card">
          <h3>${demo.metadata.title}</h3>
          <p>${demo.metadata.description}</p>
          <a href="${demo.fileName}.html" class="demo-link">View Demo</a>
          ${demo.metadata.tags.length > 0 ? `
          <div class="tags">
            ${demo.metadata.tags.map(tag => `<a href="#tag-${tag}" class="tag">${tag}</a>`).join('')}
          </div>
          ` : ''}
        </div>`;
  }

  function renderDemoSection(category) {
    if (!category.demos.length) return '';

    return `
      <div class="demo-section" id="${slugify(category.name)}">
        <div class="section-header">
          <h2>${category.name}</h2>
          <p>${category.description}</p>
        </div>
        <div class="demo-grid">
          ${category.demos.map(renderDemoCard).join('')}
        </div>
      </div>`;
  }

  function renderTagSection(tag, demos) {
    const description = tagDescriptions[tag] || `Demos tagged with "${tag}"`;
    return `
      <div class="demo-section" id="tag-${tag}">
        <div class="section-header">
          <h2>#${tag}</h2>
          <p>${description}</p>
        </div>
        <div class="demo-grid">
          ${demos.map(renderDemoCard).join('')}
        </div>
      </div>`;
  }

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-');
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
        text-decoration: none;
        display: inline-block;
        transition: background 0.2s;
      }
      .tag:hover {
        background: #bbdefb;
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
      
      /* Category and tag navigation */
      .category-nav {
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .nav-section {
        margin-bottom: 15px;
      }
      .nav-section:last-child {
        margin-bottom: 0;
      }
      .nav-section-title {
        font-size: 12px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      .nav-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }
      .category-nav-link, .tag-nav-link {
        display: inline-block;
        color: #666;
        text-decoration: none;
        padding: 5px 12px;
        border-radius: 15px;
        transition: all 0.2s;
        font-size: 14px;
      }
      .category-nav-link {
        background: #f0f0f0;
      }
      .category-nav-link:hover {
        background: #e0e0e0;
        color: #333;
      }
      .tag-nav-link {
        background: #e3f2fd;
        color: #1976d2;
        font-size: 12px;
      }
      .tag-nav-link:hover {
        background: #bbdefb;
      }
      .tag-nav-link::before {
        content: '#';
        opacity: 0.7;
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
      <div class="nav-section">
        <div class="nav-section-title">Categories</div>
        <div class="nav-links">
          ${groupedDemos.map(category =>
    `<a href="#${slugify(category.name)}" class="category-nav-link">${category.name}</a>`
  ).join('')}
        </div>
      </div>
      ${sortedTags.length > 0 ? `
      <div class="nav-section">
        <div class="nav-section-title">Browse by Tag</div>
        <div class="nav-links">
          ${sortedTags.map(tag =>
    `<a href="#tag-${tag}" class="tag-nav-link">${tag}</a>`
  ).join('')}
        </div>
      </div>
      ` : ''}
    </div>

    ${groupedDemos.map(category => renderDemoSection(category)).join('')}

    <div class="demo-section" style="margin-top: 60px;">
      <div class="section-header">
        <h2>Browse by Tag</h2>
        <p>Find demos by their specific features and topics</p>
      </div>
    </div>

    ${sortedTags.map(tag => renderTagSection(tag, tagMap.get(tag))).join('')}

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

  // Generate index page
  const indexHTML = generateIndexHTML(demos);
  const indexPath = path.join(demosDir, 'index.html');
  fs.writeFileSync(indexPath, indexHTML);

  console.log('Generated demos/index.html');
  console.log(`Generated ${demos.length} demo files`);
  console.log('Demo organization controlled by demo-config.js');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemos().catch(console.error);
}

export { generateDemos };
