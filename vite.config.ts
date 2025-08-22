import { defineConfig } from "vite";
import { generateDemos } from "./build-demos.js";
import fs from "fs";
import path from "path";

// Custom plugin to watch demo scripts and rebuild demos
function demosPlugin() {
  return {
    name: "demos-plugin",
    buildStart() {
      // Watch demo scripts directory
      const demoScriptsDir = path.resolve("./demo-scripts");
      if (fs.existsSync(demoScriptsDir)) {
        // Add all demo script files as dependencies
        const files = fs.readdirSync(demoScriptsDir);
        files.forEach((file) => {
          if (file.endsWith(".js")) {
            this.addWatchFile(path.join(demoScriptsDir, file));
          }
        });
      }
    },
    handleHotUpdate({ file, server }) {
      // If a demo script file changed, rebuild demos
      if (file.includes("demo-scripts") && file.endsWith(".js")) {
        console.log("Demo script changed, rebuilding demos...");
        generateDemos()
          .then(() => {
            console.log("Demos rebuilt!");
            // Reload any demo pages
            server.ws.send({
              type: "full-reload",
            });
          })
          .catch(console.error);
      }
    },
  };
}

export default defineConfig({
  plugins: [demosPlugin()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "SimpleCanvasLibrary",
      fileName: (format) => `simple-canvas-library.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: [],
      output: {
        globals: {},
      },
    },
  },
  server: {
    open: "/demos/index.html",
  },
});
