import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        <h3>Demo</h3>
        <div id="demo-container"></div>
        <p><small>GameInterface creates its own complete UI structure.</small></p>
      </div>`
    : `<div class="canvas-section">
        <h3>Demo</h3>
        <canvas id="demo-canvas" width="400" height="300"></canvas>
        <p><small>Canvas will resize automatically if resize handling is enabled in the demo.</small></p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SimpleCanvasLibrary: ${metadata.title}</title>
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
function generateIndexHTML(demos) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SimpleCanvasLibrary Demos</title>
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
    </style>
  </head>
  <body>
    <div class="navigation">
      <a href="../docs/index.html" class="nav-link">📖 API Documentation</a>
      <a href="https://github.com/your-username/simple-canvas-library" class="nav-link">📦 GitHub Repository</a>
    </div>

    <div class="header">
      <h1>SimpleCanvasLibrary Demos</h1>
      <p>Interactive examples showcasing the features of SimpleCanvasLibrary</p>
      <p><small>Each demo shows the exact source code that's running</small></p>
    </div>

    <div class="demo-grid">
      ${demos.map(demo => `
        <div class="demo-card">
          <h3>${demo.metadata.title}</h3>
          <p>${demo.metadata.description}</p>
          <a href="${demo.fileName}.html" class="demo-link">View Demo</a>
          ${demo.metadata.tags.length > 0 ? `
          <div class="tags">
            ${demo.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
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
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemos().catch(console.error);
}

export { generateDemos };
