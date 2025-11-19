# AsyncDataExporter - Web Workers Guide

## Overview

The `AsyncDataExporter` class provides non-blocking data serialization using Web Workers for large browser datasets. It automatically decides whether to use workers based on data size.

**When to use:**
- Exporting 10K+ records in browser
- Preventing UI blocking during large data transformations
- Progressive web apps with data export features

**When NOT to use:**
- Typical datasets (100-1000 records) - `DataExporter` is faster
- Small data exports where worker overhead isn't justified

## Performance Benchmarks

### 1,000 Records (Typical)
| Format | Sync | Status |
|--------|------|--------|
| JSON | 1.07ms | ✅ Fast |
| CSV | 1.24ms | ✅ Fast |
| YAML | 2.43ms | ✅ Fast |
| Markdown | 1.06ms | ✅ Fast |

**Recommendation:** Use `DataExporter` (sync)

### 10,000 Records (Large)
| Format | Sync | Worker Overhead | Benefit |
|--------|------|-----------------|---------|
| JSON | 7.68ms | ~5-7ms | ⚠️ Break-even |
| CSV | 8.42ms | ~5-7ms | ⚠️ Break-even |
| YAML | 20.15ms | ~5-7ms | ✅ Prevents blocking |
| Markdown | 7.08ms | ~5-7ms | ⚠️ Break-even |

**Recommendation:** Use `AsyncDataExporter` for YAML

### 100,000+ Records
| Format | Sync | Async |
|--------|------|-------|
| JSON | 76ms (blocks UI) | 7ms + worker |
| CSV | 84ms (blocks UI) | 8ms + worker |
| YAML | 200ms (blocks UI) | 20ms + worker |

**Recommendation:** Use `AsyncDataExporter` - prevents UI freezing

## Usage Examples

### Basic Usage (Sync - Recommended for most cases)

```typescript
import { DataExporter } from '@alexcatdad/calico';

const exporter = new DataExporter();
const users = [{id: 1, name: 'Alice'}, ...];

// Returns immediately
const csv = exporter.toCSV(users);
console.log(csv);
```

### Async with Web Workers (Large datasets only)

```typescript
import { AsyncDataExporter } from '@alexcatdad/calico';

const asyncExporter = new AsyncDataExporter();
const largeDataset = generateUsers(50000);

// Returns Promise, doesn't block main thread
const csv = await asyncExporter.toCSV(largeDataset);
console.log(csv);
```

### Auto-Detection Threshold

By default, workers are used for arrays with >10,000 items:

```typescript
const asyncExporter = new AsyncDataExporter();

// Uses sync (array < 10K) - faster
await asyncExporter.toJSON(smallArray);

// Uses worker (array > 10K) - non-blocking
await asyncExporter.toJSON(largeArray);
```

### Custom Threshold

```typescript
// Use workers for arrays > 5K items
const asyncExporter = new AsyncDataExporter(5000);

// Cleanup when done
asyncExporter.destroy();
```

## Implementation Details

### How It Works

1. **Data Size Check**: Inspects array length or object key count
2. **Threshold Decision**: Compares against threshold (default 10K)
3. **Route Selection**:
   - **Below threshold**: Direct sync call
   - **Above threshold**: Process in worker thread
4. **Result**: Promise resolves with formatted output

### Worker Lifecycle

```typescript
const asyncExporter = new AsyncDataExporter();

// Worker created on instantiation
// Reused for all subsequent calls
await asyncExporter.toYAML(data);
await asyncExporter.toCSV(data);
await asyncExporter.toJSON(data);

// Cleanup explicitly when done
asyncExporter.destroy();
```

## Bundle Size Impact

```
Core library (Sync):        5.54KB
+ AsyncDataExporter:       +1.54KB = 7.08KB ✅
+ Validation (optional):   +2.80KB = 9.88KB ✅
Total with everything:      <10KB minified ✅
```

Only import `AsyncDataExporter` if you need it:

```typescript
// Minimal bundle (5.54KB)
import { DataExporter } from '@alexcatdad/calico';

// With async support (7.08KB)
import { DataExporter, AsyncDataExporter } from '@alexcatdad/calico';
```

## Performance Tips

### ✅ Do This

```typescript
// Check data size first
const asyncExporter = new AsyncDataExporter(5000);

// For large exports
if (dataset.length > 5000) {
    const result = await asyncExporter.toYAML(dataset);
    displayResult(result);
}

// Cleanup when done (React example)
useEffect(() => {
    return () => asyncExporter.destroy();
}, []);
```

### ❌ Don't Do This

```typescript
// Don't use workers for small datasets
const asyncExporter = new AsyncDataExporter();
const result = await asyncExporter.toJSON([...smallArray]); // Overhead not worth it

// Don't forget cleanup
const asyncExporter = new AsyncDataExporter();
// ... no destroy call = worker hangs around
```

## Error Handling

```typescript
const asyncExporter = new AsyncDataExporter();

try {
    const result = await asyncExporter.toYAML(data);
} catch (error) {
    // Worker errors or serialization failures
    console.error('Export failed:', error.message);
}
```

## Benchmarking Your Own Data

Use the included benchmark scripts:

```bash
# Test with 1,000 records
bun scripts/benchmark.ts

# Test with 10,000 records
bun scripts/benchmark-10k.ts
```

Add your own data structures to see real-world performance.

## API Reference

### Constructor

```typescript
new AsyncDataExporter(workerThreshold?: number)
```

- `workerThreshold`: Use workers for data sizes > this threshold (default: 10000)

### Methods

All methods return `Promise<string>`:

```typescript
async toJSON<T>(data: T, pretty?: boolean): Promise<string>
async toCSV<T>(data: T[], options?: CSVOptions): Promise<string>
async toYAML<T>(data: T, indent?: number): Promise<string>
async toMarkdown<T>(data: T, options?: MarkdownOptions): Promise<string>

async fromJSON<T>(input: string): Promise<T>
async fromCSV<T>(input: string, options?: CSVOptions): Promise<T[]>
async fromYAML<T>(input: string): Promise<T>

destroy(): void  // Terminate worker thread
```

## When Workers Excel

- **Complex transformations**: YAML serialization (recursive)
- **Large datasets**: 10K+ records
- **Real-time UX**: Progressive web apps, data dashboards
- **Background processing**: Scheduled exports, batch operations

## Comparison with DataExporter

| Feature | DataExporter | AsyncDataExporter |
|---------|--------------|-------------------|
| Speed (small data) | ⚡ Faster | Slower (worker overhead) |
| Speed (large data) | 🐌 Blocks UI | ⚡ Non-blocking |
| Bundle impact | None | +1.54KB |
| Browser-only | No | Yes |
| Setup cost | None | ~5-7ms per worker |
| Ideal datasets | <10K | >10K |
