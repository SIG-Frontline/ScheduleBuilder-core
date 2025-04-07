import { test, expect } from '@playwright/test';
import { ClassRecommendation, CurriculaResponse } from 'src/utils/types.util';

test.describe('Recommender Endpoint', () => {
  test('POST /recommender should return status code 200 when given year, degree , major, and takenCourses', async ({
    request,
  }) => {
    const endpoint = '/recommender/';

    const response = await request.post(endpoint, {
      data: {
        degree: 'BS',
        major: 'CS',
        year: '2025',
        takenCourses: [],
      },
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as ClassRecommendation[];
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('POST /recommender should return status code 400 without a degree', async ({
    request,
  }) => {
    const endpoint = '/recommender/';
    const response = await request.post(endpoint, {
      data: {
        major: 'CS',
        year: '2025',
        takenCourses: [],
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty('message', 'No degree provided!');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /recommender should return status code 400 without a major', async ({
    request,
  }) => {
    const endpoint = '/recommender/';
    const response = await request.post(endpoint, {
      data: {
        degree: 'BS',
        year: '2025',
        takenCourses: [],
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty('message', 'No major provided!');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /recommender should return status code 400 without a year', async ({
    request,
  }) => {
    const endpoint = '/recommender/';
    const response = await request.post(endpoint, {
      data: {
        degree: 'BS',
        major: 'CS',
        takenCourses: [],
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty('message', 'No year provided!');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /recommender should return status code 400 without takenCourses', async ({
    request,
  }) => {
    const endpoint = '/recommender/';
    const response = await request.post(endpoint, {
      data: {
        degree: 'BS',
        major: 'CS',
        year: '2025',
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty('message', 'No courses provided!');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /recommender should return status code 404 for invalid degree parameters', async ({
    request,
  }) => {
    const endpoint = '/recommender/';
    const response = await request.post(endpoint, {
      data: {
        degree: 'BS',
        major: 'THIS DOES NOT EXIST',
        year: '1999',
        takenCourses: [],
      },
    });
    expect(response.status()).toBe(404);

    const body = (await response.json()) as CurriculaResponse;
    expect(body).toHaveProperty(
      'message',
      'No curricula found given the query parameters',
    );
    expect(body).toHaveProperty('error', 'Not Found');
  });
});
