import { test, expect } from '@playwright/test';
import { CurriculaResponse } from 'src/utils/types.util';
import * as fs from 'fs';
import * as path from 'path';

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
    expect(body).toHaveProperty(
      'message',
      'No curricula found given the query parameters',
    );
  });
  test('POST /curricula should return status code 201 when given request body', async ({
    request,
  }) => {
    const endpoint = '/curricula';
    const mockCurriculaPath = path.join(
      __dirname,
      'testCurriculaData',
      'mockCurricula.json',
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockCurricula: CurriculaResponse = JSON.parse(
      fs.readFileSync(mockCurriculaPath, 'utf8'),
    );
    const response = await request.post(endpoint, { data: mockCurricula });
    const json = (await response.json()) as CurriculaResponse;
    expect(response.status()).toBe(201);
    expect(json).toHaveProperty('_id');
    expect(json._id).toBe('TESTING');
  });
  test('DELETE /curricula/id should return status code 200 when given valid id', async ({
    request,
  }) => {
    const endpoint = '/curricula/TESTING';
    const response = await request.delete(endpoint);
    const json = (await response.json()) as {
      deleted: boolean;
      message: string;
    };
    expect(response.status()).toBe(200);
    expect(json).toHaveProperty(
      'message',
      'Curricula document has been deleted successfully',
    );
    expect(json).toHaveProperty('deleted', true);
  });
});
