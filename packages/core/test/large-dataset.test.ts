/**
 * Large Dataset Tests (100k rows)
 *
 * These tests are OPTIONAL and can be run with:
 *   LARGE_DATASET_TESTS=true bun test large-dataset.test.ts
 *
 * Or run all tests including large datasets:
 *   bun test --timeout 300000
 *
 * Default: SKIPPED (to keep CI fast)
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { DataExporter } from '../src/exporter';
import { AsyncDataExporter } from '../src/async-exporter';
import { generateUsers, generateUser, verifyUser, estimateMemoryUsage, type User } from './mock-db';

// Skip these tests unless explicitly enabled
const ENABLE_LARGE_TESTS = process.env.LARGE_DATASET_TESTS === 'true';
const testFn = ENABLE_LARGE_TESTS ? it : it.skip;
const describeFn = ENABLE_LARGE_TESTS ? describe : describe.skip;

const DATASET_SIZE = 100_000;
const SAMPLE_SIZE = 1_000; // For quick verification tests
const PERFORMANCE_TIMEOUT = 300_000; // 5 minutes max per test

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Large Dataset Tests (100k rows)
Status: ${ENABLE_LARGE_TESTS ? '✅ ENABLED' : '⏭️  SKIPPED'}
${ENABLE_LARGE_TESTS ? '' : 'To enable: LARGE_DATASET_TESTS=true bun test'}
Estimated Memory: ${estimateMemoryUsage(DATASET_SIZE)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

describeFn('Large Dataset Tests - 100k Rows', () => {
  let users: User[];
  let exporter: DataExporter;
  let asyncExporter: AsyncDataExporter;

  beforeAll(() => {
    console.log('🔄 Generating 100,000 user records...');
    const startGen = performance.now();
    users = generateUsers(DATASET_SIZE);
    const endGen = performance.now();
    console.log(`✅ Generated ${users.length} users in ${(endGen - startGen).toFixed(2)}ms`);

    exporter = new DataExporter();
    asyncExporter = new AsyncDataExporter();
  }, PERFORMANCE_TIMEOUT);

  describe('Data Integrity', () => {
    testFn('should generate exactly 100k users', () => {
      expect(users).toHaveLength(DATASET_SIZE);
    });

    testFn('should have valid structure for all users', () => {
      // Check first 100, middle 100, last 100
      const samplesToCheck = [
        ...users.slice(0, 100),
        ...users.slice(49950, 50050),
        ...users.slice(-100),
      ];

      for (const user of samplesToCheck) {
        const { valid, errors } = verifyUser(user);
        expect(valid).toBe(true);
        if (!valid) {
          console.error(`Invalid user ${user.id}:`, errors);
        }
      }
    });

    testFn('should have unique IDs', () => {
      const ids = new Set(users.map(u => u.id));
      expect(ids.size).toBe(DATASET_SIZE);
    });

    testFn('should have unique usernames', () => {
      const usernames = new Set(users.map(u => u.username));
      expect(usernames.size).toBe(DATASET_SIZE);
    });

    testFn('should have unique emails', () => {
      const emails = new Set(users.map(u => u.email));
      expect(emails.size).toBe(DATASET_SIZE);
    });
  });

  describe('JSON Export - 100k rows', () => {
    let jsonOutput: string;
    let exportTime: number;

    testFn('should export 100k users to JSON', () => {
      console.log('📤 Exporting to JSON...');
      const start = performance.now();
      jsonOutput = exporter.toJSON(users, true);
      const end = performance.now();
      exportTime = end - start;

      console.log(`✅ JSON export completed in ${exportTime.toFixed(2)}ms`);
      expect(jsonOutput).toBeDefined();
      expect(jsonOutput.length).toBeGreaterThan(0);
    }, PERFORMANCE_TIMEOUT);

    testFn('JSON output should be valid', () => {
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
    });

    testFn('JSON output should preserve all data', () => {
      const parsed = JSON.parse(jsonOutput);
      expect(parsed).toHaveLength(DATASET_SIZE);

      // Verify first, middle, and last records
      expect(parsed[0]).toEqual(users[0]);
      expect(parsed[49999]).toEqual(users[49999]);
      expect(parsed[99999]).toEqual(users[99999]);
    });

    testFn('JSON export performance should be acceptable', () => {
      // Should complete in under 1 second for 100k rows
      const maxTime = 1000;
      console.log(`   Performance: ${exportTime.toFixed(2)}ms (max: ${maxTime}ms)`);
      expect(exportTime).toBeLessThan(maxTime);
    });

    testFn('JSON output size should be reasonable', () => {
      const sizeInMB = jsonOutput.length / (1024 * 1024);
      console.log(`   Output size: ${sizeInMB.toFixed(2)} MB`);
      // Should be less than 100MB for 100k users
      expect(sizeInMB).toBeLessThan(100);
    });
  });

  describe('CSV Export - 100k rows', () => {
    let csvOutput: string;
    let exportTime: number;

    testFn('should export 100k users to CSV', () => {
      console.log('📤 Exporting to CSV...');
      const start = performance.now();
      csvOutput = exporter.toCSV(users);
      const end = performance.now();
      exportTime = end - start;

      console.log(`✅ CSV export completed in ${exportTime.toFixed(2)}ms`);
      expect(csvOutput).toBeDefined();
      expect(csvOutput.length).toBeGreaterThan(0);
    }, PERFORMANCE_TIMEOUT);

    testFn('CSV output should have correct number of rows', () => {
      const lines = csvOutput.split('\n').filter(line => line.trim());
      // Should have header + 100k data rows
      expect(lines.length).toBe(DATASET_SIZE + 1);
    });

    testFn('CSV output should have valid header', () => {
      const lines = csvOutput.split('\n');
      const header = lines[0];
      expect(header).toContain('"id"');
      expect(header).toContain('"username"');
      expect(header).toContain('"email"');
      expect(header).toContain('"firstName"');
      expect(header).toContain('"lastName"');
    });

    testFn('CSV output should be parseable', () => {
      const parsed = exporter.fromCSV(csvOutput);
      expect(parsed).toHaveLength(DATASET_SIZE);
    });

    testFn('CSV roundtrip should preserve data', () => {
      const parsed = exporter.fromCSV<User>(csvOutput);

      // Check sample records
      const sampleIndices = [0, 1000, 50000, 99999];
      for (const idx of sampleIndices) {
        const original = users[idx];
        const roundtrip = parsed[idx];

        expect(roundtrip.id).toBe(original.id.toString()); // CSV converts to string
        expect(roundtrip.username).toBe(original.username);
        expect(roundtrip.email).toBe(original.email);
        expect(roundtrip.firstName).toBe(original.firstName);
        expect(roundtrip.lastName).toBe(original.lastName);
      }
    });

    testFn('CSV export performance should be acceptable', () => {
      // Should complete in under 1 second for 100k rows
      const maxTime = 1000;
      console.log(`   Performance: ${exportTime.toFixed(2)}ms (max: ${maxTime}ms)`);
      expect(exportTime).toBeLessThan(maxTime);
    });

    testFn('CSV output size should be reasonable', () => {
      const sizeInMB = csvOutput.length / (1024 * 1024);
      console.log(`   Output size: ${sizeInMB.toFixed(2)} MB`);
      expect(sizeInMB).toBeLessThan(100);
    });
  });

  describe('YAML Export - 100k rows', () => {
    let yamlOutput: string;
    let exportTime: number;

    testFn('should export 100k users to YAML', () => {
      console.log('📤 Exporting to YAML...');
      const start = performance.now();
      yamlOutput = exporter.toYAML(users);
      const end = performance.now();
      exportTime = end - start;

      console.log(`✅ YAML export completed in ${exportTime.toFixed(2)}ms`);
      expect(yamlOutput).toBeDefined();
      expect(yamlOutput.length).toBeGreaterThan(0);
    }, PERFORMANCE_TIMEOUT);

    testFn('YAML output should be parseable', () => {
      expect(() => exporter.fromYAML(yamlOutput)).not.toThrow();
    });

    testFn('YAML output should preserve data structure', () => {
      const parsed = exporter.fromYAML<User[]>(yamlOutput);
      expect(parsed).toHaveLength(DATASET_SIZE);

      // Verify sample records
      expect(parsed[0]).toEqual(users[0]);
      expect(parsed[50000]).toEqual(users[50000]);
      expect(parsed[99999]).toEqual(users[99999]);
    });

    testFn('YAML export performance should be acceptable', () => {
      // YAML is slower, allow up to 3 seconds for 100k rows
      const maxTime = 3000;
      console.log(`   Performance: ${exportTime.toFixed(2)}ms (max: ${maxTime}ms)`);
      expect(exportTime).toBeLessThan(maxTime);
    });

    testFn('YAML output size should be reasonable', () => {
      const sizeInMB = yamlOutput.length / (1024 * 1024);
      console.log(`   Output size: ${sizeInMB.toFixed(2)} MB`);
      expect(sizeInMB).toBeLessThan(150); // YAML is more verbose
    });
  });

  describe('Markdown Export - 100k rows', () => {
    let mdOutput: string;
    let exportTime: number;

    testFn('should export 100k users to Markdown table', () => {
      console.log('📤 Exporting to Markdown...');
      const start = performance.now();
      mdOutput = exporter.toMarkdown(users, { format: 'table' });
      const end = performance.now();
      exportTime = end - start;

      console.log(`✅ Markdown export completed in ${exportTime.toFixed(2)}ms`);
      expect(mdOutput).toBeDefined();
      expect(mdOutput.length).toBeGreaterThan(0);
    }, PERFORMANCE_TIMEOUT);

    testFn('Markdown output should have table structure', () => {
      const lines = mdOutput.split('\n').filter(line => line.trim());
      // Should have more than 100k lines (header + separator + data)
      expect(lines.length).toBeGreaterThan(DATASET_SIZE);
    });

    testFn('Markdown output should have valid table header', () => {
      const lines = mdOutput.split('\n');
      expect(lines[0]).toContain('|');
      expect(lines[1]).toContain('|'); // separator line
    });

    testFn('Markdown export performance should be acceptable', () => {
      // Markdown should be fast, under 1 second
      const maxTime = 1000;
      console.log(`   Performance: ${exportTime.toFixed(2)}ms (max: ${maxTime}ms)`);
      expect(exportTime).toBeLessThan(maxTime);
    });

    testFn('Markdown output size should be reasonable', () => {
      const sizeInMB = mdOutput.length / (1024 * 1024);
      console.log(`   Output size: ${sizeInMB.toFixed(2)} MB`);
      expect(sizeInMB).toBeLessThan(200); // Markdown has table formatting
    });
  });

  describe('Async Export - 100k rows', () => {
    testFn('should export 100k users to JSON asynchronously', async () => {
      console.log('📤 Async JSON export...');
      const start = performance.now();
      const result = await asyncExporter.toJSON(users);
      const end = performance.now();

      console.log(`✅ Async JSON export completed in ${(end - start).toFixed(2)}ms`);
      expect(result).toBeDefined();

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(DATASET_SIZE);
    }, PERFORMANCE_TIMEOUT);

    testFn('should export 100k users to CSV asynchronously', async () => {
      console.log('📤 Async CSV export...');
      const start = performance.now();
      const result = await asyncExporter.toCSV(users);
      const end = performance.now();

      console.log(`✅ Async CSV export completed in ${(end - start).toFixed(2)}ms`);
      expect(result).toBeDefined();

      const lines = result.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(DATASET_SIZE + 1); // header + data
    }, PERFORMANCE_TIMEOUT);
  });

  describe('Memory and Edge Cases', () => {
    testFn('should handle users with special characters in CSV', () => {
      const specialUsers = [
        generateUser(1),
        { ...generateUser(2), firstName: 'John, Jr.' },
        { ...generateUser(3), lastName: 'O"Brien' },
        { ...generateUser(4), username: 'user\nwith\nnewlines' },
        { ...generateUser(5), email: 'user"quote"@example.com' },
      ];

      const csv = exporter.toCSV(specialUsers);
      const parsed = exporter.fromCSV(csv);

      expect(parsed).toHaveLength(specialUsers.length);
    });

    testFn('should not crash on deeply nested objects', () => {
      const deepUsers = users.slice(0, 1000).map(user => ({
        ...user,
        deep: {
          level1: {
            level2: {
              level3: {
                level4: {
                  data: 'nested',
                },
              },
            },
          },
        },
      }));

      expect(() => exporter.toJSON(deepUsers)).not.toThrow();
      expect(() => exporter.toYAML(deepUsers)).not.toThrow();
    });

    testFn('should handle null and undefined values across 100k rows', () => {
      const nullishUsers = users.slice(0, 1000).map(user => ({
        ...user,
        nullField: null,
        undefinedField: undefined,
      }));

      const json = exporter.toJSON(nullishUsers);
      const parsed = JSON.parse(json);
      expect(parsed[0]).toHaveProperty('nullField');
      expect(parsed[0].nullField).toBeNull();
      expect(parsed[0]).not.toHaveProperty('undefinedField'); // JSON drops undefined
    });
  });

  describe('Performance Comparison', () => {
    testFn('should compare all format export times', () => {
      const sampleData = users.slice(0, 10000); // 10k sample
      const results: Record<string, number> = {};

      console.log('\n📊 Performance Comparison (10k rows):');

      const start1 = performance.now();
      exporter.toJSON(sampleData);
      results.json = performance.now() - start1;

      const start2 = performance.now();
      exporter.toCSV(sampleData);
      results.csv = performance.now() - start2;

      const start3 = performance.now();
      exporter.toYAML(sampleData);
      results.yaml = performance.now() - start3;

      const start4 = performance.now();
      exporter.toMarkdown(sampleData);
      results.markdown = performance.now() - start4;

      console.log(`   JSON:     ${results.json.toFixed(2)}ms`);
      console.log(`   CSV:      ${results.csv.toFixed(2)}ms`);
      console.log(`   YAML:     ${results.yaml.toFixed(2)}ms`);
      console.log(`   Markdown: ${results.markdown.toFixed(2)}ms`);

      // All should complete in reasonable time
      expect(results.json).toBeLessThan(500);
      expect(results.csv).toBeLessThan(500);
      expect(results.yaml).toBeLessThan(1500);
      expect(results.markdown).toBeLessThan(500);
    });
  });
});

// Summary statistics
if (ENABLE_LARGE_TESTS) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test Configuration:
  Dataset Size: ${DATASET_SIZE.toLocaleString()} rows
  Estimated Memory: ${estimateMemoryUsage(DATASET_SIZE)}
  Timeout: ${PERFORMANCE_TIMEOUT / 1000}s per test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
