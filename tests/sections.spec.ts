import { test, expect } from '@playwright/test';
import { SectionResponse } from '../src/utils/types.util';

const endpoint = '/sections';

test.describe('Sections API', () => {
  test('GET /sections should return 200 and an array', async ({ request }) => {
    const response = await request.get(endpoint);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SectionResponse;
    expect(body).toHaveProperty('courses');
    expect(Array.isArray(body.courses)).toBeTruthy();
  });

  test('GET /sections with title query', async ({ request }) => {
    const response = await request.get(
      `${endpoint}?title=ROADMAP TO COMPUTING`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SectionResponse;
    expect(body.courses.length).toBeGreaterThan(0);
    expect(body.courses[0].TITLE).toBe('ROADMAP TO COMPUTING');
  });

  test('GET /sections with a title query that should return nothing', async ({
    request,
  }) => {
    const response = await request.get(`${endpoint}?title=FAKETITLE9000`);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SectionResponse;
    expect(body.courses.length).toBe(0);
  });

  test('GET /sections with a course & term query', async ({ request }) => {
    const response = await request.get(
      `${endpoint}?course=MATH 111&term=202510`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as SectionResponse;
    expect(body.courses[0].TITLE).toBe('CALCULUS I');
    expect(body.courses[0].TERM).toBe('202510');
  });
});
