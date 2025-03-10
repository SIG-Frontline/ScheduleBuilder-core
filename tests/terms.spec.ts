import { test, expect } from '@playwright/test';
import { TermsResponse } from 'src/utils/types.util';

test.describe('Terms Endpoint', () => {
  test('GET /terms should return status code 200 and an array of terms', async ({
    request,
  }) => {
    const endpoint = '/terms';
    const response = await request.get(endpoint);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as TermsResponse;
    expect(body).toHaveProperty('terms');
    expect(Array.isArray(body.terms)).toBeTruthy();
    expect(body.terms.length).toBeGreaterThan(0);
  });
});
