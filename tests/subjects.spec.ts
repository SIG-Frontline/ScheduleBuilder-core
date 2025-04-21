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
  let subjectID: string;
  test('POST /subjects should return status code 201 when given request body', async ({
    request,
  }) => {
    const endpoint = '/subjects';
    const mockSubject = {
      TERM: 'TEST TERM',
      SUBJECTS: ['MATH', 'CS', 'PHYS'],
    };
    const response = await request.post(endpoint, { data: mockSubject });
    const json = (await response.json()) as SubjectsResponse;
    expect(response.status()).toBe(201);
    expect(json).toHaveProperty('_id');
    expect(json.term).toBe('TEST TERM');
    subjectID = json._id;
  });
  test('DELETE /subjects/id should return status code 200 when given valid id', async ({
    request,
  }) => {
    const endpoint = `/subjects/${subjectID}`;
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
});
