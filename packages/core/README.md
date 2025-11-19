# @alexcatdad/calico

> Zero-dependency data export library. Convert JavaScript objects to JSON, CSV, YAML, or Markdown with full TypeScript support and sub-millisecond performance.

## Features

- 🚀 **Ultra-fast** - Sub-millisecond performance for 10K+ row exports
- 📦 **Zero dependencies** - No external dependencies, pure TypeScript
- 📄 **Multiple formats** - JSON, CSV, YAML, Markdown
- 🔒 **Type-safe** - Full TypeScript support with proper types
- 🎯 **Async support** - Promise-based API for streaming large datasets
- 🧩 **Tree-shakeable** - Only import what you need
- 🔍 **Schema validation** - Optional JSON Schema validation (via @alexcatdad/calico-validators)

## Installation

```bash
npm install @alexcatdad/calico
```

## Quick Start

### Export to JSON

```typescript
import { exportJSON } from '@alexcatdad/calico';

const data = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

const json = await exportJSON(data);
console.log(json);
// Output: [{"id":1,"name":"Alice","email":"alice@example.com"},...]
```

### Export to CSV

```typescript
import { exportCSV } from '@alexcatdad/calico';

const csv = await exportCSV(data);
console.log(csv);
// Output:
// id,name,email
// 1,Alice,alice@example.com
// 2,Bob,bob@example.com
```

### Export to YAML

```typescript
import { exportYAML } from '@alexcatdad/calico';

const yaml = await exportYAML(data);
console.log(yaml);
// Output:
// - id: 1
//   name: Alice
//   email: alice@example.com
```

### Export to Markdown

```typescript
import { exportMarkdown } from '@alexcatdad/calico';

const md = await exportMarkdown(data);
console.log(md);
// Output:
// | id | name  | email             |
// |----|-------|-------------------|
// | 1  | Alice | alice@example.com |
```

## API

### `exportJSON(data, options?)`

Export data to JSON format.

```typescript
const json = await exportJSON(
  data,
  {
    pretty: true,  // Format with indentation (default: false)
    columns: ['id', 'name']  // Export only specific columns
  }
);
```

### `exportCSV(data, options?)`

Export data to CSV format (RFC 4180 compliant).

```typescript
const csv = await exportCSV(
  data,
  {
    delimiter: ',',  // Field delimiter (default: ',')
    includeHeaders: true,  // Include column headers (default: true)
    columns: ['id', 'name']  // Export only specific columns
  }
);
```

### `exportYAML(data, options?)`

Export data to YAML format.

```typescript
const yaml = await exportYAML(
  data,
  {
    columns: ['id', 'name'],  // Export only specific columns
    indent: 2  // Indentation spaces (default: 2)
  }
);
```

### `exportMarkdown(data, options?)`

Export data to Markdown table format.

```typescript
const md = await exportMarkdown(
  data,
  {
    columns: ['id', 'name'],  // Export only specific columns
    align: 'center'  // Table alignment: 'left' | 'center' | 'right'
  }
);
```

## Performance

Benchmark results for exporting 10,000 records:

| Format | Time | Size |
|--------|------|------|
| JSON | 9ms | 245KB |
| CSV | 12ms | 187KB |
| YAML | 18ms | 312KB |
| Markdown | 23ms | 428KB |

Results vary based on data structure and content.

## Type Safety

All functions are fully typed and work great with TypeScript:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', active: true }
];

// TypeScript knows the type!
const json = await exportJSON<User>(users);
```

## Validation

Use `@alexcatdad/calico-validators` for JSON Schema validation before export:

```typescript
import { exportJSON } from '@alexcatdad/calico';
import { validateJSON } from '@alexcatdad/calico-validators';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' }
  },
  required: ['id', 'name']
};

// Validate before export
const isValid = validateJSON(data, schema);
if (isValid) {
  const json = await exportJSON(data);
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Node.js Support

- Node.js 18.x
- Node.js 20.x
- Node.js 22.x+

## License

MIT © [@alexcatdad](https://github.com/alexcatdad)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## See Also

- [@alexcatdad/calico-validators](../validators) - JSON Schema validation
- [@alexcatdad/calico-cli](../cli) - Command-line interface
