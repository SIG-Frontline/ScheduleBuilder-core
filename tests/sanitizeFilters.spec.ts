import { expect, test } from '@playwright/test';
import { sanitizeFilters } from '../src/utils/functions.utils';

test.describe('sanitizeFilters', () => {
  test('should remove undefined and empty values', () => {
    const filters = {
      TITLE: 'ROADMAP TO COMPUTING',
      COURSE: '',
      TERM: undefined,
    };

    const result = sanitizeFilters(filters);
    expect(result).toEqual({ TITLE: 'ROADMAP TO COMPUTING' });
  });

  test('should return an empty object when all values are empty or undefined', () => {
    const filters = {
      TITLE: '',
      COURSE: '',
      TERM: undefined,
    };

    const result = sanitizeFilters(filters);
    expect(result).toEqual({});
  });

  test('should keep valid filters intact', () => {
    const filters = {
      TITLE: 'DSA',
      COURSE: 'CS435',
      TERM: 'Spring 2025',
    };

    const result = sanitizeFilters(filters);
    expect(result).toEqual(filters);
  });

  test('should handle a mix of valid and invalid filters', () => {
    const filters = {
      TITLE: 'Data Science',
      COURSE: '',
      TERM: undefined,
      INSTRUCTOR: 'John Doe',
    };

    const result = sanitizeFilters(filters);
    expect(result).toEqual({
      TITLE: 'Data Science',
      INSTRUCTOR: 'John Doe',
    });
  });
});
