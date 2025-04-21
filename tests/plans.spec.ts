import { test, expect } from '@playwright/test';

interface UnauthorizedPayload {
  message: string;
  statusCode: number;
}

test.describe('Plans', () => {
  test('GET /userplans should return the plans of a user and requires an auth token', async ({
    request,
  }) => {
    const endpoint = '/userplans/';

    const response = await request.get(endpoint, {
      headers: {
        authorization: '',
      },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as UnauthorizedPayload;
    expect(body.message == 'Unauthorized');
  });
});
