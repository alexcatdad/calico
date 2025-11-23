/**
 * Mock Database Generator
 * Generates realistic test data for performance and stress testing
 * Uses @faker-js/faker for realistic, varied data
 */

import { faker } from '@faker-js/faker';

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  active: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  metadata: {
    lastLogin: string;
    loginCount: number;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}

const roles: Array<'admin' | 'user' | 'moderator' | 'guest'> = ['admin', 'user', 'moderator', 'guest'];
const themes: Array<'light' | 'dark'> = ['light', 'dark'];

/**
 * Generate a single user record using Faker.js
 * Deterministic - same ID will always generate the same user
 */
export function generateUser(id: number): User {
  // Seed faker with the ID to get deterministic, reproducible results
  faker.seed(id);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Ensure uniqueness by appending ID
  const username = `${faker.internet.username({ firstName, lastName })}${id}`;
  const email = `${faker.internet.username({ firstName, lastName }).toLowerCase()}${id}@example.com`;
  const age = faker.number.int({ min: 18, max: 82 });
  const active = faker.datatype.boolean({ probability: 0.66 }); // ~66% active
  const balance = faker.number.float({ min: 0, max: 9999.99, fractionDigits: 2 });
  const role = faker.helpers.arrayElement(roles);
  const theme = faker.helpers.arrayElement(themes);
  const createdAt = faker.date.past({ years: 2 }).toISOString();
  const updatedAt = faker.date.recent({ days: 30 }).toISOString();
  const lastLogin = faker.date.recent({ days: 7 }).toISOString();
  const loginCount = faker.number.int({ min: 0, max: 999 });
  const notifications = faker.datatype.boolean();
  const uuid = faker.string.uuid();

  return {
    id,
    uuid,
    username,
    email,
    firstName,
    lastName,
    age,
    active,
    balance,
    createdAt,
    updatedAt,
    role,
    metadata: {
      lastLogin,
      loginCount,
      preferences: {
        theme,
        notifications,
      },
    },
  };
}

/**
 * Generate an array of users
 */
export function generateUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    users.push(generateUser(i));
  }
  return users;
}

/**
 * Generate users in batches to avoid memory issues
 */
export function* generateUsersBatched(count: number, batchSize = 10000): Generator<User[], void, unknown> {
  let remaining = count;
  let offset = 1;

  while (remaining > 0) {
    const currentBatch = Math.min(batchSize, remaining);
    const batch: User[] = [];

    for (let i = 0; i < currentBatch; i++) {
      batch.push(generateUser(offset + i));
    }

    yield batch;
    offset += currentBatch;
    remaining -= currentBatch;
  }
}

/**
 * Verify data integrity - check if user object is valid
 */
export function verifyUser(user: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof user.id !== 'number') errors.push('id must be a number');
  if (typeof user.uuid !== 'string') errors.push('uuid must be a string');
  if (typeof user.username !== 'string') errors.push('username must be a string');
  if (typeof user.email !== 'string') errors.push('email must be a string');
  if (!user.email.includes('@')) errors.push('email must contain @');
  if (typeof user.firstName !== 'string') errors.push('firstName must be a string');
  if (typeof user.lastName !== 'string') errors.push('lastName must be a string');
  if (typeof user.age !== 'number' || user.age < 18) errors.push('age must be a number >= 18');
  if (typeof user.active !== 'boolean') errors.push('active must be a boolean');
  if (typeof user.balance !== 'number') errors.push('balance must be a number');
  if (typeof user.createdAt !== 'string') errors.push('createdAt must be a string');
  if (typeof user.updatedAt !== 'string') errors.push('updatedAt must be a string');
  if (!roles.includes(user.role)) errors.push('role must be valid');
  if (!user.metadata) errors.push('metadata is required');
  if (user.metadata && typeof user.metadata.loginCount !== 'number') {
    errors.push('metadata.loginCount must be a number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate memory usage estimate
 */
export function estimateMemoryUsage(count: number): string {
  const singleUserBytes = JSON.stringify(generateUser(1)).length;
  const totalBytes = singleUserBytes * count;
  const mb = totalBytes / (1024 * 1024);
  return `~${mb.toFixed(2)} MB`;
}
