import { test, expect } from '@playwright/test';
import { CourseResponse } from 'src/utils/types.util';

test.describe('CourseSearch Endpoint', () => {
  test('GET /courseSearch should return status code 200 and a list of courses, and when given term, and subject', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?term=202510&subject=CS';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('courses');
    expect(Array.isArray(body.courses)).toBeTruthy();
    expect(body.courses[0]).toHaveProperty('_id');
    expect(body.courses[0]).toHaveProperty('title');
    expect(body.courses[0]).toHaveProperty('subject');
  });

  test('GET /courseSearch should return status code 200 and a list of courses, and when given term, and title', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?term=202510&title=INTRO';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('courses');
    expect(Array.isArray(body.courses)).toBeTruthy();
    expect(body.courses[0]).toHaveProperty('_id');
    expect(body.courses[0]).toHaveProperty('title');
    expect(body.courses[0]).toHaveProperty('subject');
  });

  test('GET /courseSearch should accept all special characters but not treat them as regex characters', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?term=202510&title=A.*';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('courses');
    expect(Array.isArray(body.courses)).toBeTruthy();
    expect(body.courses).toHaveLength(0);
  });

  test('GET /courseSearch should return status code 400 with a no term was received message when no term is passed', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?title=INTRO';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('error', 'Bad Request');
    expect(body).toHaveProperty('message', 'No term was received');
  });

  test('GET /courseSearch should return courses regardless of case', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?term=202510&title=intro';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(200);
    expect(body.courses.length).toBeGreaterThan(0);
    body.courses.forEach((course) => {
      expect(course.title).toContain('INTRO');
    });
  });

  test('GET /courseSearch should not return duplicate courses', async ({
    request,
  }) => {
    const endpoint = 'courseSearch?term=202510&subject=CS';
    const response = await request.get(endpoint);
    const body = (await response.json()) as CourseResponse;

    expect(response.status()).toBe(200);

    const courseIds = body.courses.map((course) => course._id);
    const uniqueIds = new Set(courseIds);
    expect(courseIds.length).toBe(uniqueIds.size);
  });
});
