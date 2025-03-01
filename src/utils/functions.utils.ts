import { queryFilters } from './types.util';

export function sanitizeFilters(filters: queryFilters): Partial<queryFilters> {
  const query: Partial<queryFilters> = {};
  for (const key in filters) {
    const typedKey = key as keyof queryFilters; // Explicitly cast the key
    if (filters[typedKey] !== undefined && filters[typedKey] !== '') {
      query[typedKey] = filters[typedKey]; // Explicitly cast value to string
    }
  }
  return query;
}
