import { test, expect } from '@playwright/test';
import { SectionResponse } from '../src/utils/types.util';

const endpoint = '/sections';

test.describe('Sections Endpoint', () => {
  test('GET /sections should return status code 200 and an array of sections', async ({
    request,
  }) => {
    const response = await request.get(`${endpoint}?term=202510&course=CS 100`);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SectionResponse;
    expect(body).toHaveProperty('course');
    expect(Array.isArray(body.course.sections)).toBeTruthy();
  });

  test('GET /sections should return status code 400 with a bad request error, when no query parameters are attached', async ({
    request,
  }) => {
    const response = await request.get(endpoint);
    expect(response.status()).toBe(400);

    const body = (await response.json()) as SectionResponse;
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty(
      'message',
      'Term and course are required query parameters',
    );
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('GET /sections should return 404 when course does not exist', async ({
    request,
  }) => {
    const response = await request.get(
      `${endpoint}?term=202510&course=FAKE1091`,
    );

    expect(response.status()).toBe(404);

    const body = (await response.json()) as SectionResponse;
    expect(body).toHaveProperty('statusCode', 404);
    expect(body).toHaveProperty(
      'message',
      'No sections found given the query parameters',
    );
    expect(body).toHaveProperty('error', 'Not Found');
  });
});
