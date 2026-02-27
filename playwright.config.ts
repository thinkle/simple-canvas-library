import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/test-results",
  snapshotDir: "./tests/snapshots",
  use: {
    baseURL: "http://localhost:5174",
  },
  webServer: {
    command: "npx vite --port 5174 --strictPort",
    url: "http://localhost:5174/tests/fixtures/fixed-size.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
