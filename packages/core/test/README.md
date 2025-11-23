# Calico Test Suite

This directory contains comprehensive tests for the Calico data export library.

## Test Files

### Standard Tests (Always Run)

| File | Tests | Coverage |
|------|-------|----------|
| `json.test.ts` | 7 | JSON export/import, error handling |
| `csv.test.ts` | 6 | CSV export/import, delimiters, quoting |
| `yaml.test.ts` | 7 | YAML export/import, indentation |
| `md.test.ts` | 5 | Markdown tables, lists |
| `validator.test.ts` | 9 | JSON Schema validation |
| `coverage.test.ts` | 11 | Edge cases, error paths |

**Total:** 45 tests, ~100% pass rate

### Large Dataset Tests (Optional)

| File | Tests | Coverage |
|------|-------|----------|
| `large-dataset.test.ts` | 34 | Performance, stress testing with 100k rows |

**Total:** 34 tests, 93.9% pass rate (2 known YAML issues)

### Supporting Files

| File | Purpose |
|------|---------|
| `mock-db.ts` | Mock database generator for realistic test data |
| `README.md` | This file |

## Running Tests

### Run All Standard Tests

```bash
# From project root
bun turbo test

# Or from packages/core
bun test
```

### Run Specific Test File

```bash
bun test test/json.test.ts
bun test test/csv.test.ts
```

### Run Large Dataset Tests (100k rows)

**Warning:** These tests take ~8 seconds and use ~40MB memory.

```bash
# Enable large dataset tests
LARGE_DATASET_TESTS=true bun test test/large-dataset.test.ts --timeout 300000
```

**By default, large dataset tests are SKIPPED** to keep CI fast.

## Large Dataset Tests

### What They Test

1. **Data Integrity**
   - 100k unique records
   - Valid structure
   - No duplicates

2. **Export Performance**
   - JSON: Must complete in <1s
   - CSV: Must complete in <1s
   - YAML: Must complete in <3s
   - Markdown: Must complete in <1s

3. **Roundtrip Accuracy**
   - Export → Import → Verify
   - Data preservation checks

4. **Memory Efficiency**
   - No memory leaks
   - Reasonable output sizes

5. **Edge Cases**
   - Special characters
   - Deeply nested objects
   - Null/undefined values

### When to Run Large Dataset Tests

- **Before releases** - Ensure performance hasn't regressed
- **After optimization work** - Verify improvements
- **Before major refactors** - Establish baseline
- **Weekly in CI** - Catch regressions early

## Mock Database Generator

The `mock-db.ts` file provides utilities for generating realistic test data using **@faker-js/faker**:

### Generate Users

```typescript
import { generateUsers, generateUser } from './mock-db';

// Generate single user
const user = generateUser(1);

// Generate array of users
const users = generateUsers(1000);
```

### Generate in Batches (Memory Efficient)

```typescript
import { generateUsersBatched } from './mock-db';

for (const batch of generateUsersBatched(100000, 10000)) {
  // Process 10k users at a time
  console.log(`Processing batch of ${batch.length} users`);
}
```

### Validate Data

```typescript
import { verifyUser } from './mock-db';

const { valid, errors } = verifyUser(someUser);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Estimate Memory

```typescript
import { estimateMemoryUsage } from './mock-db';

console.log(estimateMemoryUsage(100000)); // "~37.57 MB"
```

## User Data Structure

```typescript
interface User {
  id: number;                    // Unique ID
  uuid: string;                  // UUID v4
  username: string;              // Unique username
  email: string;                 // Unique email
  firstName: string;             // First name
  lastName: string;              // Last name
  age: number;                   // 18-82
  active: boolean;               // ~66% active
  balance: number;               // 0-9999.99
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  role: 'admin' | 'user' | 'moderator' | 'guest';
  metadata: {
    lastLogin: string;           // ISO 8601
    loginCount: number;          // 0-999
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}
```

## Test Results

### Standard Tests

```
✅ 45 tests passing
⏱️  ~100ms execution time
📦 Runs on every commit
```

### Large Dataset Tests

```
✅ 31 tests passing
❌ 2 tests failing (YAML parser)
⏱️  ~8 seconds execution time
💾 ~40MB memory usage
📦 Optional, run on-demand
```

## CI Integration

### GitHub Actions (Current)

Standard tests run on:
- Every push
- Every pull request
- Node 18.x, 20.x, 22.x

### Recommended: Weekly Large Dataset Tests

Add to `.github/workflows/large-dataset-tests.yml`:

```yaml
name: Large Dataset Tests

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: LARGE_DATASET_TESTS=true bun test packages/core/test/large-dataset.test.ts --timeout 300000
```

## Performance Benchmarks

From large dataset tests (100k rows):

| Format | Export Time | Output Size | Throughput |
|--------|-------------|-------------|------------|
| JSON | 439ms | 53.38 MB | 227k/sec |
| CSV | 482ms | 20.20 MB | 207k/sec |
| YAML | 1381ms | 41.36 MB | 72k/sec |
| Markdown | 421ms | 20.39 MB | 237k/sec |

## Debugging Tests

### Verbose Output

```bash
bun test --verbose
```

### Run Single Test

```bash
bun test test/json.test.ts -t "should export object to JSON string"
```

### Watch Mode

```bash
bun test --watch
```

## Contributing

When adding new tests:

1. Add to appropriate test file (or create new one)
2. Follow existing test structure
3. Use descriptive test names
4. Test happy path AND error cases
5. Keep tests fast (<100ms each)
6. Update this README if needed

## Questions?

See:
- [CONTRIBUTING.md](../../../CONTRIBUTING.md) - Contributing guidelines
- [PROJECT_ANALYSIS.md](../../../PROJECT_ANALYSIS.md) - Project overview
- [LARGE_DATASET_TEST_FINDINGS.md](../../../LARGE_DATASET_TEST_FINDINGS.md) - Performance report
