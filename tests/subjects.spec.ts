import { test, expect } from '@playwright/test';
import { SubjectsResponse } from 'src/utils/types.util';

test.describe('Subjects Endpoint', () => {
  test('GET /subjects should return a status code 200, along with an array of subjects when given a valid term', async ({
    request,
  }) => {
    const endpoint = '/subjects/202510';
    const response = await request.get(endpoint);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SubjectsResponse;
    expect(body).toHaveProperty('term');
    expect(body).toHaveProperty('subjects');
    expect(Array.isArray(body.subjects)).toBeTruthy();
    expect(body.subjects.length).toBeGreaterThan(0);
  });

  test('GET /subjects should return status code 404 with a bad request message', async ({
    request,
  }) => {
    const endpoint = '/subjects/201912/';
    const response = await request.get(endpoint);
    expect(response.status()).toBe(404);

    const body = (await response.json()) as SubjectsResponse;
    expect(body).toHaveProperty(
      'message',
      'No subjects found given the query parameters',
    );
    expect(body).toHaveProperty('error', 'Not Found');
  });
});
