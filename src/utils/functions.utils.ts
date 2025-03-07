import { queryFiltersBase } from './types.util';

export function sanitizeFilters(
  filters: queryFiltersBase,
): Partial<queryFiltersBase> {
  const query: Partial<queryFiltersBase> = {};
  for (const key in filters) {
    const typedKey = key as keyof queryFiltersBase; // Explicitly cast the key
    if (filters[typedKey] !== undefined && filters[typedKey] !== '') {
      query[typedKey] = filters[typedKey]; // Explicitly cast value to string
    }
  }
  return query;
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function addRegexSearch(
  query: Record<string, any>,
  key: string,
  value: string,
) {
  if (value) {
    query[key] = { $regex: escapeRegex(value), $options: 'i' };
  }
}
