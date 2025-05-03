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
    expect(body).toHaveProperty(
      'message',
      'No subjects found given the query parameters',
    );
  });
  test('POST /subjects should return status code 201 when given request body', async ({
    request,
  }) => {
    const endpoint = '/subjects';
    const mockSubject = {
      TERM: 'TEST TERM',
      SUBJECTS: ['MATH', 'CS', 'PHYS'],
    };
    const response = await request.post(endpoint, { data: [mockSubject] });
    const json = (await response.json()) as SubjectsResponse;
    expect(response.status()).toBe(201);
    expect(json).toHaveProperty('success', true);
  });
  test('DELETE /subjects/:term should return status code 200 when given valid term', async ({
    request,
  }) => {
    const endpoint = `/subjects/TEST TERM`;
    const response = await request.delete(endpoint);
    const json = (await response.json()) as {
      deleted: boolean;
      message: string;
    };
    expect(response.status()).toBe(200);
    expect(json).toHaveProperty(
      'message',
      'Subject document has been deleted successfully',
    );
    expect(json).toHaveProperty('deleted', true);
  });
  test('TIMESTAMP /timestamp/:term should return status code 200 when given valid term', async ({
    request,
  }) => {
    const endpoint = '/timestamp?term=202510';
    const response = await request.get(endpoint);
    const json = (await response.json()) as {
      timestamp: number;
    };
    expect(json).toHaveProperty('timestamp');
    expect(response.status()).toBe(200);
  });
  test('TIMESTAMP /timestamp should return status code 200 when not given a term', async ({
    request,
  }) => {
    const endpoint = '/timestamp';
    const response = await request.get(endpoint);
    const json = (await response.json()) as {
      timestamp: number;
    };
    expect(json).toHaveProperty('timestamp');
    expect(response.status()).toBe(200);
  });
});
