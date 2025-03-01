import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'API Tests',
      testMatch: '**/*.spec.ts',
    },
  ],

  webServer: {
    command: 'pnpm start:dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});
