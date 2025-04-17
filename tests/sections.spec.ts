import { test, expect } from '@playwright/test';
import { Section, SectionResponse } from '../src/utils/types.util';

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
    expect(body).toHaveProperty(
      'message',
      'No sections found given the query parameters',
    );
  });
  test('POST /sections should return status code 201 when given request body', async ({
    request,
  }) => {
    const mockSection = {
      _id: 'TESTING',
      TERM: '202410',
      COURSE: 'FYSSEM',
      TITLE: 'FIRST-YEAR SEMINAR',
      SECTION: '002',
      CRN: '13096',
      INSTRUCTION_METHOD: 'Face-to-Face',
      DAYS: {
        M: true,
        T: false,
        W: false,
        R: false,
        F: false,
        S: false,
        U: false,
      },
      TIMES: [
        {
          day: 'M',
          start: {
            $date: {
              $numberLong: '-2208936600000',
            },
          },
          end: {
            $date: {
              $numberLong: '-2208931800000',
            },
          },
          building: 'CKB',
          room: '315',
        },
      ],
      MAX: 0,
      NOW: 10,
      STATUS: 'Closed',
      INSTRUCTOR: 'Baldwin, Ryan',
      COMMENTS: null,
      CREDITS: 0,
      INFO_LINK:
        'https://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet?bookstore_id-1=584&term_id-1=2024 Spring&crn-1=13096',
      IS_HONORS: false,
      IS_ASYNC: false,
      SUBJECT: 'FYSSEM',
      COURSE_LEVEL: null,
      SUMMER_PERIOD: null,
    };
    const response = await request.post(endpoint, { data: mockSection });
    const json = (await response.json()) as Section;
    expect(response.status()).toBe(201);
    expect(json).toHaveProperty('_id');
    expect(json._id).toBe('TESTING');
  });
  test('DELETE /sections/id should return status code 200 when given valid id', async ({
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
      'Section document has been deleted successfully',
    );
    expect(json).toHaveProperty('deleted', true);
  });
});
