import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { queryFiltersBase } from './types.util';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

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

export function encryptArr(arr: any[]) {
  return encrypt(JSON.stringify(arr));
}

export function decryptArr(cipherText: string): any[] {
  return JSON.parse(decrypt(cipherText)) as any[];
}

// Encrypts a string using aes-256-gcm
export function encrypt(text: string) {
  try {
    const key = process.env.ENCRYPT_KEY;
    if (!key) throw new InternalServerErrorException('Invalid encryption');

    const iv = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv,
    );

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('base64') + '.' + encrypted.toString('base64');
  } catch {
    throw new BadRequestException('Invalid input');
  }
}

// Decrypts a string using aes-256-gcm
export function decrypt(text: string) {
  try {
    const [ivRaw, encryptedRaw] = text.split('.');

    const iv = Buffer.from(ivRaw, 'base64');
    const encryptedText = Buffer.from(encryptedRaw, 'base64');

    const key = process.env.ENCRYPT_KEY;
    if (!key) throw new InternalServerErrorException('Invalid encryption');

    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv,
    );
    const decrypted = decipher.update(encryptedText);

    return decrypted.toString();
  } catch {
    throw new BadRequestException('Invalid input');
  }
}
