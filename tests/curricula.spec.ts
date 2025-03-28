import { test, expect } from '@playwright/test';
import { CurriculaResponse } from 'src/utils/types.util';

test.describe('Curricula Endpoint', () => {
  test('GET /curricula should return status code 200 when given year, degree & major', async ({
    request,
  }) => {
    const endpoint = '/curricula/2025/BS/CS';
    const response = await request.get(endpoint);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty('degree', 'BS');
    expect(body).toHaveProperty('major', 'CS');
    expect(body).toHaveProperty('year', '2025');
    expect(body).toHaveProperty('classes');
    expect(Array.isArray(body.classes)).toBeTruthy();
  });

  test('GET /curricula should return status code 404 with a bad request message', async ({
    request,
  }) => {
    const endpoint = '/curricula/1999/BS/RANDOMSTUFF';
    const response = await request.get(endpoint);
    expect(response.status()).toBe(404);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty(
      'message',
      'No curricula found given the query parameters',
    );
    expect(body).toHaveProperty('error', 'Not Found');
  });
});
