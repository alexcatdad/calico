# @alexcatdad/calico

> **Zero-dependency data export library** for JavaScript/TypeScript. Convert your data to JSON, CSV, YAML, or Markdown with 12.95KB bundle size, full TypeScript support, and 50 passing tests.

**[npm](https://npmjs.com/package/@alexcatdad/calico)** • **[GitHub](https://github.com/alexcatdad/calico)** • **[Issues](https://github.com/alexcatdad/calico/issues)**

---

## Why Calico?

Data export is deceptively complex. Libraries typically:
- Pull in heavy dependencies (numeral.js, dayjs, etc.)
- Bloat your bundle with unused format support
- Lack TypeScript support or generic type safety
- Ship unclear error messages

Calico takes a different approach:

✅ **Zero Dependencies** - Just your data, no frameworks or polyfills
✅ **Tiny Bundle** - 12.95KB minified, tree-shakeable
✅ **Type-Safe** - Full TypeScript support with generic types
✅ **Fast** - Sub-millisecond exports for typical datasets
✅ **Honest API** - Clear contracts on what it does and doesn't do

---

## Key Features

- **6 Export Formats**: JSON, CSV, YAML, Markdown (+ planned: TXT, HTML)
- **3 Import Formats**: JSON, CSV, YAML (only stable, predictable schemas)
- **Optional Validation**: JSON Schema validation (tree-shakeable)
- **Async Support**: Web Workers for non-blocking large dataset processing (browsers)
- **CLI Tool**: Built-in command-line interface for file conversions
- **No Dependencies**: Core library requires zero npm packages

---

## Test Results

**Total Tests: 50 | Passed: 50 | Failed: 0**

Coverage breakdown:
- ✅ JSON format (import/export with edge cases)
- ✅ CSV format (delimiters, quoting, headers)
- ✅ YAML format (indentation, complex types)
- ✅ Markdown format (tables, lists, TOC)
- ✅ Validation (type checking, constraints)
- ✅ Error handling (circular refs, invalid input, type mismatches)

---

## Performance Benchmarks

Tested on 10,000 records (see `test_data/users_10k.csv`):

### Sync API (DataExporter)
| Format | Time | Notes |
|--------|------|-------|
| JSON   | 10.28ms | Fastest serialization |
| CSV    | 10.84ms | RFC 4180 compliant |
| YAML   | 22.41ms | Full YAML 1.2 support |
| MD     | 9.64ms | Table and list formats |

### Async API (AsyncDataExporter)
- Browser-optimized with Web Workers
- Non-blocking for UI-heavy applications
- Automatic worker spawning for 10K+ items
- 5-10ms worker overhead (prevents UI freezing)

---

## Installation

Choose your package manager:

### npm
```bash
npm install @alexcatdad/calico
```

### yarn
```bash
yarn add @alexcatdad/calico
```

### pnpm
```bash
pnpm add @alexcatdad/calico
```

### bun
```bash
bun add @alexcatdad/calico
```

Or with the CLI tool:
```bash
npm install -g @alexcatdad/calico-cli
# or
bun add -g @alexcatdad/calico-cli
```

---

## Quick Start

### Sync API
```typescript
import { DataExporter } from '@alexcatdad/calico';

const data = [
  { name: 'Alice', age: 30, email: 'alice@example.com' },
  { name: 'Bob', age: 25, email: 'bob@example.com' }
];

const exporter = new DataExporter();

// Export to different formats
const json = exporter.toJSON(data, { pretty: true });
const csv = exporter.toCSV(data);
const yaml = exporter.toYAML(data);
const markdown = exporter.toMarkdown(data);

// Import from formats
const imported = exporter.fromJSON(json);
const fromCsv = exporter.fromCSV(csv);
const fromYaml = exporter.fromYAML(yaml);
```

### Async API (Browser)
```typescript
import { AsyncDataExporter } from '@alexcatdad/calico';

const exporter = new AsyncDataExporter();
const largeDataset = await fetch('data.json').then(r => r.json());

// Non-blocking export with Web Workers (10K+ items)
const csv = await exporter.toCSV(largeDataset);
```

### Validation
```typescript
import { DataExporter } from '@alexcatdad/calico';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
};

const exporter = new DataExporter({ schema });
exporter.toJSON(data); // Validates before export
```

---

## CLI Usage

Export files from the command line:

```bash
# Auto-detect format from extension
calico input.csv output.json

# Explicit format conversion
calico --from csv --to json input.csv output.json

# Pretty-print JSON
calico --pretty input.csv output.json

# Use with pipes
cat data.csv | calico --from csv --to json > output.json
```

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 60+     | ✅ Full |
| Firefox | 55+     | ✅ Full |
| Safari  | 11+     | ✅ Full |
| Edge    | 79+     | ✅ Full |

**Web Workers Support** (for AsyncDataExporter):
- Chrome 47+
- Firefox 3.5+
- Safari 4+
- Edge 10+

---

## Node.js Support

| Node Version | Status |
|--------------|--------|
| 18.x         | ✅ Full |
| 20.x         | ✅ Full |
| 22.x         | ✅ Full |
| 23.x         | ✅ Full |

ESM modules required. CommonJS not supported.

---

## Packages

This is a monorepo with three publishable packages:

### @alexcatdad/calico
Core export/import library (12.95KB)

### @alexcatdad/calico-validators
Optional JSON Schema validation (3.22KB, tree-shakeable)

### @alexcatdad/calico-cli
Command-line tool for format conversions (13.11KB)

---

## Zero Dependencies

Calico has **zero production dependencies**. All core functionality is implemented from scratch:

- CSV parsing/generation (RFC 4180 compliant)
- YAML 1.2 serialization
- Markdown table/list generation
- JSON Schema validation

This means:
- ✅ No supply chain attacks
- ✅ No dependency updates to monitor
- ✅ Full control over data serialization
- ✅ Predictable bundle size

---

## License

MIT © 2025 [@alexcatdad](https://github.com/alexcatdad)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on reporting issues, submitting features, and writing code.

---

## Package Author

**@alexcatdad** - [GitHub](https://github.com/alexcatdad)
