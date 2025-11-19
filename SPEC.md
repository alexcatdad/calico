# @alexcatdad/calico - Library Specification v1.0

## Overview

Lightweight, fast data export and import library for business applications. Exports JavaScript objects to multiple formats with optional JSON Schema validation. Imports from stable data formats only (JSON, CSV, YAML). Zero external dependencies for core functionality.

**Constraints:** 
- **Max size:** 10KB minified
- **Export time:** <3ms for typical datasets (100-1000 records)
- **Runtime:** Bun (development and publishing)
- **Release:** v1.0 - all features ship together, no v1.1/v2.0 deferrals

---

## Philosophy

This library provides a clear, honest contract:

- **Export:** We'll convert your data to any of 6 popular formats (maximum flexibility)
- **Import:** We only parse formats with predictable, stable schemas (JSON, CSV, YAML)
- **No magic:** fromTXT(), fromMarkdown(), fromHTML() removed - users have better purpose-built tools for those
- **Type-safe:** Mandatory generic type parameters enable compile-time type checking
- **Explicit errors:** Verbose error messages include context, attempted format, and failure reason

---

## Project Structure

```
calico/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── exporter.ts
│   │   │   ├── formats/
│   │   │   │   ├── json.ts
│   │   │   │   ├── csv.ts
│   │   │   │   ├── yaml.ts
│   │   │   │   ├── txt.ts
│   │   │   │   ├── md.ts
│   │   │   │   └── html.ts
│   │   │   ├── validators/
│   │   │   │   └── json-schema.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── validators/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cli/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── bunfig.toml
├── tsconfig.json
├── biome.json
└── README.md
```

---

## Type System

### Core Types

**ExportFormat**
- Union type: `'json' | 'csv' | 'yaml' | 'txt' | 'md' | 'html'`
- Represents supported export formats

**ImportFormat**
- Union type: `'json' | 'csv' | 'yaml'`
- Only stable formats with clear contracts

**ValidationSchema**
- JSON Schema compatible object (draft-2020-12)
- Properties: type, properties, required, and all standard JSON Schema keywords
- Optional - validation is always optional via config

**ExporterConfig**
- Optional `schema: ValidationSchema` - Schema for validation
- Optional `throwOnValidationError: boolean` (default: true) - Error handling behavior

**CSVOptions**
- Optional `headers: boolean` (default: true) - Include column headers
- Optional `delimiter: string` (default: ',') - Field separator
- Optional `quoteStrings: boolean` (default: true) - Quote string fields

**HTMLOptions**
- Optional `title: string` - Document title
- Optional `css: string` - Custom CSS styling
- Optional `dark: boolean` - Dark mode theme

**MarkdownOptions**
- Optional `title: string` - Document header
- Optional `includeTableOfContents: boolean` - TOC generation

**ExportResult**
- `data: string` - Exported content
- `format: ExportFormat` - Format used
- `size: number` - Byte size of output
- `timestamp: Date` - Export timestamp

**ValidationResult**
- `valid: boolean` - Validation status
- `errors?: Array<{path: string; message: string; value: any}>` - Error details

### Generics (Mandatory)

All methods require an explicit generic type parameter `<T>` for type safety.

**Export methods:**
- `toJSON<T>(data: T): string` - Input type validation
- `toCSV<T>(data: T[]): string` - Array type validation
- `toYAML<T>(data: T): string` - Input type validation
- `toTXT<T>(data: T): string` - Input type validation
- `toMarkdown<T>(data: T): string` - Input type validation
- `toHTML<T>(data: T): string` - Input type validation

**Import methods:**
- `fromJSON<T>(input: string): T` - Output typed as T
- `fromCSV<T>(input: string): T[]` - Output typed as array of T
- `fromYAML<T>(input: string): T` - Output typed as T

**Examples:**
```typescript
// Input type validation
exporter.toJSON<User>(userData)
exporter.toCSV<Transaction[]>(transactions)

// Output type casting
const user = exporter.fromJSON<User>(jsonString)
const orders = exporter.fromCSV<Order>(csvString)
```

---

## Core API Specification

### DataExporter Class

#### Constructor
```typescript
new DataExporter(config: ExporterConfig = {})
```
- Initializes exporter with optional schema and error handling configuration
- If schema provided, validation occurs on all export operations

#### Configuration Methods

**validate(data: any): ValidationResult**
- Validates data against configured schema
- Returns validation result with error details
- Does not throw, returns `{ valid: true }` if no schema set

**setSchema(schema: ValidationSchema): void**
- Updates validation schema at runtime
- Subsequent exports validate against new schema

---

## Export Methods (All 6 Formats)

All export methods include validation (if schema configured) and return exported string.

### toJSON<T>(data: T, pretty: boolean = true): string

- Exports data as JSON
- `pretty` parameter controls formatting (default: true)
- Validates before export if schema configured
- Throws error on circular references with message: "Circular reference detected at path [path]"
- Generic type parameter mandatory

**Errors:**
- `TypeError`: "Input data for toJSON must be serializable"
- `Error`: "Circular reference detected at [path]"
- `ValidationError`: "[Field] is invalid: [reason]"

---

### toCSV<T>(data: T[], options: CSVOptions = {}): string

- Exports array data as CSV format
- Handles array of objects and array of primitives
- Automatic header generation from object keys
- RFC 4180 compliant escaping (quotes, newlines, delimiters)
- Validates before export if schema configured
- Generic type parameter mandatory

**Options:**
- `headers: boolean` (default: true) - Include column headers
- `delimiter: string` (default: ',') - Field separator
- `quoteStrings: boolean` (default: true) - Quote string fields

**Behavior:**
- Objects: each key becomes column, each object becomes row
- Primitives: single column with values
- Missing fields: empty cells
- Special chars: properly escaped per RFC 4180

**Errors:**
- `TypeError`: "toCSV requires an array, received [type]"
- `TypeError`: "CSV data must be array of objects or primitives, received mixed types"
- `ValidationError`: "[Field] is invalid: [reason]"
- `Error`: "Circular reference detected at [path]"

---

### toYAML<T>(data: T, indent: number = 2): string

- Exports data as YAML 1.2 format
- Configurable indentation (default: 2 spaces)
- Proper type handling: null, boolean, number, string, arrays, objects
- Validates before export if schema configured
- Generic type parameter mandatory

**Type Handling:**
- `null` → `null`
- `true/false` → `true/false`
- Numbers → numeric representation
- Strings → quoted if necessary (special chars, spaces)
- Arrays → list format with `-` prefix
- Objects → key: value pairs with indentation

**Errors:**
- `TypeError`: "YAML indentation must be positive integer"
- `ValidationError`: "[Field] is invalid: [reason]"
- `Error`: "Circular reference detected at [path]"

---

### toTXT<T>(data: T, format: 'json' | 'table' = 'json'): string

- Exports data as plain text
- Two format modes: `'json'` (pretty-printed JSON) or `'table'` (for arrays)
- JSON format: human-readable indented JSON
- Table format: generates text table for array of objects
- Validates before export if schema configured
- Generic type parameter mandatory

**Table Format (arrays only):**
- Column headers from object keys
- Rows separated by newlines
- Aligned columns with padding
- Useful for terminal/console output

**Errors:**
- `TypeError`: "toTXT format must be 'json' or 'table', received [type]"
- `TypeError`: "Table format requires array, received [type]"
- `ValidationError`: "[Field] is invalid: [reason]"
- `Error`: "Circular reference detected at [path]"

---

### toMarkdown<T>(data: T, options: MarkdownOptions = {}): string

- Exports data as Markdown
- Auto-table generation for array of objects
- Key-value pairs for plain objects
- List format for simple arrays
- Validates before export if schema configured
- Generic type parameter mandatory

**Options:**
- `title: string` - Markdown header (`# title`)
- `includeTableOfContents: boolean` - TOC for complex structures

**Format Examples:**
```markdown
# Data Export

## Array of Objects
| Name | Age | Email |
|------|-----|-------|
| John | 30  | ... |

## Plain Object
- name: John
- age: 30

## Simple Array
- Item 1
- Item 2
```

**Errors:**
- `ValidationError`: "[Field] is invalid: [reason]"
- `Error`: "Circular reference detected at [path]"

---

### toHTML<T>(data: T, options: HTMLOptions = {}): string

- Exports data as complete HTML5 document
- Responsive tables for array data
- Definition lists for objects
- Dark/light theme support via CSS
- XSS protection: escapes all user content
- Validates before export if schema configured
- Generic type parameter mandatory

**Options:**
- `title: string` - HTML page title
- `css: string` - Custom CSS (injected into `<style>`)
- `dark: boolean` - Dark mode theme

**Sanitization:**
- All user content HTML-escaped
- No inline scripts, only CSS
- No external resource loading
- Safe for untrusted data

**Errors:**
- `ValidationError`: "[Field] is invalid: [reason]"
- `Error`: "Circular reference detected at [path]"

---

## Import Methods (Stable Formats Only: JSON, CSV, YAML)

### fromJSON<T>(input: string): T

- Parses JSON string to typed object
- Input must be string, throws TypeError if not
- Returns parsed data with generic type T
- Throws SyntaxError on invalid JSON with line/column info
- Generic type parameter mandatory

**Input Validation:**
- Must be string type
- Throws: `TypeError: "fromJSON input must be string, received [type]"`

**Parse Errors (verbose):**
- `SyntaxError: "Invalid JSON at line [line], column [col]: [context]. Expected [expected]"`

**Example:**
```typescript
try {
  const user = exporter.fromJSON<User>('{"name": "John", "age": 30}')
} catch (e) {
  // Detailed error with line/column and context
}
```

---

### fromCSV<T>(input: string, options: CSVOptions = {}): T[]

- Parses CSV string to typed array of objects
- Input must be string, throws TypeError if not
- Returns array of objects with type T
- RFC 4180 compliant parsing
- Handles quoted fields, escaped delimiters, newlines in values
- Generic type parameter mandatory

**Input Validation:**
- Must be string type
- Throws: `TypeError: "fromCSV input must be string, received [type]"`

**Behavior:**
- First row assumed to be headers (unless `headers: false`)
- Empty cells become empty strings or skipped fields
- Quoted cells preserve delimiters and newlines
- All values are strings - consumer responsibility to type-cast

**Parse Errors (verbose):**
- `Error: "CSV parse error at row [row], column [col]: [reason]. Context: [line preview]"`
- `Error: "CSV line [row] has mismatched columns. Expected [expected], got [actual]"`

**Options:**
- `headers: boolean` (default: true) - First row is headers
- `delimiter: string` (default: ',') - Field separator

**Example:**
```typescript
const orders = exporter.fromCSV<Order>(`
Name,Amount,Date
John,100,2024-01-01
Jane,200,2024-01-02
`)
```

---

### fromYAML<T>(input: string): T

- Parses YAML string to typed object
- Input must be string, throws TypeError if not
- Returns parsed data with generic type T
- Full YAML 1.2 support
- Proper type inference: null, boolean, number, string, arrays, objects
- Generic type parameter mandatory

**Input Validation:**
- Must be string type
- Throws: `TypeError: "fromYAML input must be string, received [type]"`

**Type Inference:**
- `null`, `~` → null
- `true`/`false`, `yes`/`no` → boolean
- Numbers → numeric type
- Quoted strings → string
- Lists (`:`) → arrays
- Key-value pairs → objects

**Parse Errors (verbose):**
- `SyntaxError: "Invalid YAML at line [line]: [reason]. Context: [line preview]"`
- `Error: "YAML structure error: [detail]"`

**Example:**
```typescript
const config = exporter.fromYAML<Config>(`
database:
  host: localhost
  port: 5432
  ssl: true
`)
```

---

## Error Handling Strategy

### Verbose Errors (No Debug Mode)

All errors are intentionally verbose to replace the need for a debug mode:

**Error Message Format:**
```
[ErrorType]: [What happened] at [path/location]. [Why it matters]. Received: [value type/preview]
```

**Examples:**

```typescript
// Type error
TypeError: "fromJSON input must be string, received number (value: 42)"

// Validation error
ValidationError: "Field 'email' is invalid: must match pattern /^[^\s@]+@[^\s@]+\.[^\s@]+$/ at path 'users.0.email'. Received: 'not-an-email'"

// Parse error
SyntaxError: "Invalid JSON at line 5, column 12: unexpected token '}' near 'incomplete': { "name": "John" }'

// Circular reference
Error: "Circular reference detected at path 'root.user.parent' - object references itself"
```

### Input Type Validation

All `from*` methods validate input type strictly:

**Valid inputs:**
- `fromJSON('{}')` ✓ String only
- `fromCSV('a,b,c')` ✓ String only
- `fromYAML('key: value')` ✓ String only

**Invalid inputs (all throw TypeError):**
- `fromJSON(123)` ✗ Numbers
- `fromJSON({})` ✗ Objects
- `fromJSON([])` ✗ Arrays
- `fromJSON(true)` ✗ Booleans
- `fromJSON(null)` ✗ Null
- `fromJSON(undefined)` ✗ Undefined
- `fromJSON(() => {})` ✗ Functions

### Circular Reference Detection

All `to*` methods detect circular references:

```typescript
const obj = { name: 'John' }
obj.self = obj  // Circular reference

try {
  exporter.toJSON<any>(obj)
} catch (e) {
  // Error: "Circular reference detected at path 'root.self' - object references itself"
}
```

### UTF-8 Handling

- All `from*` methods normalize UTF-8 input
- BOM (Byte Order Mark) stripped automatically
- All `to*` methods output valid UTF-8
- Special characters escaped appropriately per format

### Immutability Guarantee

- All `from*` and `to*` methods do NOT mutate input
- Original data structures remain unchanged
- Safe to call repeatedly on same input

---

## Validation (Optional)

JSON Schema validation is optional and lazy-loaded:

```typescript
const schema: ValidationSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
}

const exporter = new DataExporter({ schema })

// All exports validate first
try {
  const json = exporter.toJSON<User>(userData)
} catch (error) {
  // ValidationError with detailed field path
}

// Can also validate manually
const result = exporter.validate(userData)
if (!result.valid) {
  console.log(result.errors)  // Array of validation errors
}

// Update schema at runtime
exporter.setSchema(newSchema)
```

---

## Performance Targets

- **Exports:** <3ms for typical datasets (100-1000 records)
- **Imports:** <3ms for typical documents
- **Memory:** Linear with data size, no unnecessary duplication
- **Bundle:** <10KB minified

**Optimizations:**
- Lazy schema compilation (compile once, reuse)
- Buffered string building (array + join, not concatenation)
- UTF-8 normalization on parse, not export
- No streaming - simple datasets (fits in memory)

---

## What's NOT Included (Intentionally Cut)

To stay under 10KB and maintain clarity:

- ❌ `fromTXT()`, `fromMarkdown()`, `fromHTML()` - too magical, use purpose-built parsers
- ❌ Streaming/async methods - use Node streams or worker threads if needed
- ❌ Auto-detect CSV delimiters - too much parsing logic
- ❌ Configurable size limits - let consumers enforce
- ❌ Worker thread support - out of scope
- ❌ Partial failure handling for CSV - either all succeed or all fail
- ❌ Advanced format features (YAML anchors, frontmatter, nested extraction)
- ❌ Comprehensive sanitization beyond XSS basics
- ❌ Fluent API / method chaining

This keeps the library focused and prevents scope creep.

---

## Browser vs Node Support

**Browser:**
- All export (`to*`) methods work
- All import (`from*`) methods work
- `download()` method available (triggers file download via blob)
- No file system access

**Node.js:**
- All export (`to*`) methods work
- All import (`from*`) methods work
- Use fs module to write exports to disk
- No `download()` method (throws error)

---

## v1.0 Commitment

This specification represents **version 1.0 - complete and final**.

**What ships in v1.0:**
- Core 6 export formats (JSON, CSV, YAML, TXT, Markdown, HTML)
- Core 3 import formats (JSON, CSV, YAML)
- JSON Schema validation (optional)
- Generic type support (mandatory)
- Verbose error messages
- Circular reference detection
- UTF-8 normalization
- Immutability guarantee

**No roadmap items, no v1.1 deferrals.** If something isn't in this spec, it's not in the library. Users can extend via wrappers or use specialized libraries.

---

## Examples

### Basic Export

```typescript
import { DataExporter } from '@alexcatdad/calico'

interface User {
  name: string
  email: string
  age: number
}

const exporter = new DataExporter()
const users: User[] = [
  { name: 'John', email: 'john@example.com', age: 30 },
  { name: 'Jane', email: 'jane@example.com', age: 28 }
]

// Export to CSV
const csv = exporter.toCSV<User[]>(users)
console.log(csv)
// name,email,age
// John,john@example.com,30
// Jane,jane@example.com,28

// Export to JSON
const json = exporter.toJSON<User[]>(users)
console.log(json)
// [{"name":"John",...}]

// Export to Markdown table
const md = exporter.toMarkdown<User[]>(users)
console.log(md)
// | name | email | age |
// ...
```

### Basic Import

```typescript
const csvString = `name,email,age
John,john@example.com,30
Jane,jane@example.com,28`

const users = exporter.fromCSV<User>(csvString)
// users: User[]
// [
//   { name: 'John', email: 'john@example.com', age: '30' },
//   { name: 'Jane', email: 'jane@example.com', age: '28' }
// ]
```

### With Validation

```typescript
const schema: ValidationSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number', minimum: 0, maximum: 150 }
  },
  required: ['name', 'email']
}

const exporter = new DataExporter({ schema })

try {
  const json = exporter.toJSON<User>(userData)
} catch (error) {
  console.error('Validation failed:', error.message)
  // ValidationError: Field 'age' is invalid: must be number ...
}
```

### Error Handling Examples

```typescript
// Type error
try {
  exporter.fromJSON<User>(123)
} catch (e) {
  // TypeError: "fromJSON input must be string, received number (value: 123)"
}

// Parse error
try {
  exporter.fromJSON<User>('{ invalid json }')
} catch (e) {
  // SyntaxError: "Invalid JSON at line 1, column 3: unexpected token 'i' ..."
}

// Circular reference
const obj = { name: 'John' }
obj.self = obj
try {
  exporter.toJSON<any>(obj)
} catch (e) {
  // Error: "Circular reference detected at path 'root.self'"
}
```

---

## Summary

**Calico v1.0** is a focused, honest data export/import library:

- **Export:** Any data to 6 formats (maximum flexibility)
- **Import:** Only stable formats (JSON, CSV, YAML - predictable contracts)
- **Type Safety:** Mandatory generics for compile-time checking
- **Errors:** Verbose messages replace debug mode
- **Size:** <10KB minified
- **Promise:** No v1.1 deferrals - everything ships in v1.0

Perfect for business applications that need reliable, fast data conversion without magic or complexity.
