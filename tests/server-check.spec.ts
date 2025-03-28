import { test, expect } from '@playwright/test';

test('Simple test to ensure server is running', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
});
