import { NotImplementedException } from '@nestjs/common';
import { test, expect, APIRequestContext } from '@playwright/test';
import { PlanData } from 'src/utils/types.util';
import fs from 'fs';
import path from 'path';

// A helper function to read in the test plan files
function readTestPlan(filePath: string): Promise<PlanData> {
  filePath = path.join(__dirname, 'testPlansData/' + filePath + '.json');
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, rawData) => {
      if (err)
        reject(
          new NotImplementedException(
            `Could not find test file '${filePath}, ${err.message}'`,
          ),
        );

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: PlanData = JSON.parse(rawData);
        resolve(data);
      } catch (error) {
        reject(
          new NotImplementedException(
            `Could not read test file ${filePath}, ${error}`,
          ),
        );
      }
    });
  });
}

// A helper function to compare the selected classes
function checkClasses(body: PlanData, sections: string[]) {
  // Checks if each section was selected correctly
  for (const s of sections) {
    const [name, sectionNum] = s.split('-');

    // Loops through each course per each filter
    for (const c of body.courses) {
      if (c.code != name) continue;

      let found = false;
      for (const section of c.sections) {
        if (!section.sectionNumber.includes(sectionNum)) continue;

        // Check if it's selected
        if (section.selected) found = true;
      }
      if (!found) return false;
    }
  }
  return true;
}

// A helper function to test for a proper instructor
function checkClassesInstructor(
  body: PlanData,
  section: string,
  instructor: string,
) {
  // Checks if each section was selected correctly
  const name = section.split('-')[0];

  // Loops through each course per each filter
  for (const c of body.courses) {
    if (c.code != name) continue;

    for (const section of c.sections) {
      if (section.selected) return section.instructor == instructor;
    }
  }
  return true;
}

// Tests an imported plan for a specific instructor
async function checkFilterPlan(
  request: APIRequestContext,
  file: string,
  section: string,
  truthy: boolean,
) {
  const endpoint = '/organizer/';
  const plan = await readTestPlan(file);

  const response = await request.post(endpoint, { data: plan });

  expect(response.status()).toBe(201);
  const body = (await response.json()) as PlanData;

  // Determines if the correct courses were selected
  const check = checkClasses(body, [`${section}`]);
  if (truthy) {
    expect(check).toBeTruthy();
  } else {
    expect(check).toBeFalsy();
  }
}

// Tests an imported plan for the specific filters
async function checkInstructorPlan(
  request: APIRequestContext,
  file: string,
  section: string,
  instructor: string,
  truthy: boolean,
) {
  const endpoint = '/organizer/';
  const plan = await readTestPlan(file);

  const response = await request.post(endpoint, { data: plan });

  expect(response.status()).toBe(201);
  const body = (await response.json()) as PlanData;

  // Determines if the correct courses were selected
  const check = checkClassesInstructor(body, section, instructor);
  if (truthy) {
    expect(check).toBeTruthy();
  } else {
    expect(check).toBeFalsy();
  }
}

test.describe('Organizer Endpoint', () => {
  test('POST /organizer should return a status code 200, along with an organizer Plan when given a valid Plan', async ({
    request,
  }) => {
    const endpoint = '/organizer/';
    const plan = await readTestPlan('CSPlanDefault');

    const response = await request.post(endpoint, { data: plan });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as PlanData;
    expect(body).toBeTruthy();
  });

  test('POST /organizer should return a status code of 400 without any plan', async ({
    request,
  }) => {
    const endpoint = '/organizer/';

    const response = await request.post(endpoint);

    expect(response.status()).toBe(400);
    const body = (await response.json()) as PlanData;
    expect(body).toHaveProperty('message', 'No plan provided');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /organizer should return a status code of 400 without any selected courses in the plan', async ({
    request,
  }) => {
    const endpoint = '/organizer/';
    const plan = await readTestPlan('NoCourses');

    const response = await request.post(endpoint, { data: plan });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as PlanData;
    expect(body).toHaveProperty('message', 'No courses selected');
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  test('POST /organizer should return one schedule when only one can be made', async ({
    request,
  }) => {
    const endpoint = '/organizer/';
    const plan = await readTestPlan('OnlyOneSchedule');

    const response = await request.post(endpoint, { data: plan });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as PlanData;
    expect(
      checkClasses(body, [
        'CHE 260-002',
        'CHEM 236-002',
        'MATH 225-102',
        'EVSC 416-002',
      ]),
    ).toBeTruthy();
  });

  test('POST /organizer should return a status code of 404 when no plan can be made', async ({
    request,
  }) => {
    const endpoint = '/organizer/';
    const plan = await readTestPlan('NoPossibleSchedules');

    const response = await request.post(endpoint, { data: plan });

    expect(response.status()).toBe(404);
    const body = (await response.json()) as PlanData;
    expect(body).toHaveProperty('message', 'No valid schedules can be made');
    expect(body).toHaveProperty('error', 'Not Found');
  });

  test.describe('Organizer Endpoint Course Filters', () => {
    test('Specific Course Filter', async ({ request }) => {
      await checkInstructorPlan(
        request,
        'CSPlanInstructor',
        'CS332',
        'Naik, Kamlesh',
        true,
      );
    });

    test('Online Course', async ({ request }) => {
      await checkFilterPlan(request, 'CSPlanOnline', 'COM 313-4', true);
    });

    test('In Person Course', async ({ request }) => {
      await checkFilterPlan(request, 'CSPlanInPerson', 'COM 313-4', false);
    });

    test('Allow Honors Course', async ({ request }) => {
      await checkFilterPlan(request, 'CSPlanHonors', 'CS 301-H', true);
    });

    test('Deny Honors Course', async ({ request }) => {
      await checkFilterPlan(request, 'CSPlanNoHonors', 'CS 301-H', false);
    });

    test('Specific Section of Course', async ({ request }) => {
      await checkFilterPlan(request, 'CSPlanSection', 'CS 288-008', true);
    });
  });
});
