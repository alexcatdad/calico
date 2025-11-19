/**
 * Mock Database Generator
 * Generates realistic test data for performance and stress testing
 */

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

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zack', 'Anna', 'Ben', 'Chloe', 'David'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const roles: Array<'admin' | 'user' | 'moderator' | 'guest'> = ['admin', 'user', 'moderator', 'guest'];
const themes: Array<'light' | 'dark'> = ['light', 'dark'];

/**
 * Generate a UUID (mock version)
 */
function generateUUID(seed: number): string {
  const hex = seed.toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(0, 3)}-a${hex.slice(0, 3)}-${hex.slice(0, 12)}`;
}

/**
 * Generate a random date within the last 2 years
 */
function generateDate(seed: number): string {
  const now = Date.now();
  const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60 * 1000);
  const timestamp = twoYearsAgo + (seed % (now - twoYearsAgo));
  return new Date(timestamp).toISOString();
}

/**
 * Generate a single user record
 */
export function generateUser(id: number): User {
  const firstName = firstNames[id % firstNames.length];
  const lastName = lastNames[(id * 7) % lastNames.length];
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${id}`;
  const email = `${username}@example.com`;
  const age = 18 + (id % 65);
  const active = id % 3 !== 0; // ~66% active
  const balance = Math.round((id * 123.456) % 10000 * 100) / 100;
  const role = roles[id % roles.length];
  const theme = themes[id % themes.length];
  const createdAt = generateDate(id * 1000);
  const updatedAt = generateDate(id * 1000 + 500);
  const lastLogin = generateDate(id * 1000 + 1000);
  const loginCount = id % 1000;
  const notifications = id % 2 === 0;

  return {
    id,
    uuid: generateUUID(id),
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
