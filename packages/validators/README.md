# @alexcatdad/calico-validators

> Optional JSON Schema validator for @alexcatdad/calico. Tree-shakeable validation module for data validation before export.

## Features

- 🔍 **JSON Schema validation** - Validate data against JSON Schema (Draft 7)
- 📦 **Zero dependencies** - No external validation libraries
- 🎯 **Tree-shakeable** - Only include what you need
- ⚡ **Fast** - Optimized validation performance
- 🔒 **Type-safe** - Full TypeScript support
- 🧩 **Modular** - Use independently or with @alexcatdad/calico

## Installation

```bash
npm install @alexcatdad/calico-validators
```

## Quick Start

### Basic Validation

```typescript
import { validateJSON } from '@alexcatdad/calico-validators';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  },
  required: ['id', 'name', 'email']
};

const data = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

const isValid = validateJSON(data, schema);
console.log(isValid); // true
```

### Validate Before Export

```typescript
import { exportJSON } from '@alexcatdad/calico';
import { validateJSON } from '@alexcatdad/calico-validators';

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    active: { type: 'boolean' }
  },
  required: ['id', 'name']
};

const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false }
];

if (validateJSON(users, userSchema)) {
  const json = await exportJSON(users);
  // Safe to export - data is valid
}
```

## API

### `validateJSON(data, schema)`

Validates data against a JSON Schema.

**Parameters:**
- `data` - The data to validate (any type)
- `schema` - JSON Schema (Draft 7)

**Returns:** `boolean` - true if valid, false otherwise

```typescript
const isValid = validateJSON(data, schema);
```

### Schema Examples

#### Simple Object

```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 }
  },
  required: ['name']
};
```

#### Array of Objects

```typescript
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      email: { type: 'string' }
    },
    required: ['id', 'email']
  }
};
```

#### With Constraints

```typescript
const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    age: {
      type: 'integer',
      minimum: 18,
      maximum: 100
    }
  },
  required: ['username', 'email']
};
```

## Supported JSON Schema Keywords

### Type Validation
- `type` - Specify data type (string, number, integer, boolean, object, array, null)
- `enum` - Restrict to specific values

### String Validation
- `minLength` - Minimum string length
- `maxLength` - Maximum string length
- `pattern` - Regular expression pattern
- `format` - Predefined formats (email, uri, date, etc.)

### Number Validation
- `minimum` - Minimum value
- `maximum` - Maximum value
- `exclusiveMinimum` - Exclusive minimum
- `exclusiveMaximum` - Exclusive maximum
- `multipleOf` - Value must be multiple of

### Array Validation
- `minItems` - Minimum array length
- `maxItems` - Maximum array length
- `uniqueItems` - All items must be unique
- `items` - Schema for array items

### Object Validation
- `minProperties` - Minimum property count
- `maxProperties` - Maximum property count
- `required` - Required properties
- `properties` - Property schemas
- `additionalProperties` - Allow/disallow extra properties

### Combiners
- `allOf` - Must match all schemas
- `anyOf` - Must match at least one schema
- `oneOf` - Must match exactly one schema
- `not` - Must not match schema

## TypeScript Support

Use with TypeScript for better type safety:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['id', 'name', 'email']
};

const data: unknown = JSON.parse(jsonString);

if (validateJSON(data, schema)) {
  // TypeScript now knows data is a User
  const user = data as User;
}
```

## Performance

Validation is optimized for speed:

- Single object: < 1ms
- Array of 1,000 items: 2-5ms
- Array of 10,000 items: 20-50ms

Results vary based on schema complexity.

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

- [@alexcatdad/calico](../core) - Data export library
- [@alexcatdad/calico-cli](../cli) - Command-line interface
