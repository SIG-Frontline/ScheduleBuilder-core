import { test, expect } from '@playwright/test';
import { CourseStatic } from 'schemas/courseStatic.schema';

const endpoint = '/courseStatic';

test.describe('CourseStatic Endpoint', () => {
  test('GET /courseStatic should return status code 200 and a course static object', async ({
    request,
  }) => {
    const response = await request.get(`${endpoint}/MATH 111`);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as CourseStatic;
    expect(body).toHaveProperty('prereq_str');
    expect(Array.isArray(body.tree)).toBeTruthy();
  });
  test('POST /courseStatic should create a new course static document', async ({
    request,
  }) => {
    const mockCourseStatic = {
      _id: 'TESTING',
      course_number: '328',
      description: '',
      prereq_str: '',
      subject: 'R216',
      tree: null,
      updated: 1741802816,
    };
    const response = await request.post(endpoint, { data: mockCourseStatic });
    const json = (await response.json()) as CourseStatic;
    expect(response.status()).toBe(201);
    expect(json).toHaveProperty('_id');
    expect(json._id).toBe('TESTING');
  });
  test('DELETE /courseStatic/id should return status code 200 when given valid id', async ({
    request,
  }) => {
    const response = await request.delete(`${endpoint}/TESTING`);
    const json = (await response.json()) as {
      deleted: boolean;
      message: string;
    };
    expect(response.status()).toBe(200);
    expect(json).toHaveProperty(
      'message',
      'Course static document has been deleted successfully',
    );
    expect(json).toHaveProperty('deleted', true);
  });
});
