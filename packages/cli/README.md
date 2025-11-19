# @alexcatdad/calico-cli

> Command-line tool for @alexcatdad/calico. Convert data between JSON, CSV, YAML, and Markdown formats from the terminal.

## Features

- 🎯 **Format conversion** - Convert between JSON, CSV, YAML, Markdown
- 📁 **File operations** - Read from files or stdin, write to stdout or files
- 🔍 **Data filtering** - Select specific columns to export
- 📊 **Pretty output** - Formatted JSON output
- ⚡ **Fast** - Built on @alexcatdad/calico for performance
- 🔒 **Type-safe** - Written in TypeScript

## Installation

```bash
npm install -g @alexcatdad/calico-cli
```

Or use without installing:

```bash
npx @alexcatdad/calico-cli --help
```

## Quick Start

### Convert JSON to CSV

```bash
calico input.json -f csv -o output.csv
```

### Convert CSV to JSON

```bash
calico data.csv -f json -o data.json
```

### Convert to Markdown Table

```bash
calico users.json -f markdown
# Output to console
```

### Pretty Print JSON

```bash
calico data.json -f json --pretty
```

## Usage

```bash
calico <input> [options]
```

### Arguments

- `input` - Input file or `-` for stdin (default: `-`)

### Options

#### Format Options

- `-f, --format <format>` - Output format: `json`, `csv`, `yaml`, `markdown` (default: `json`)
- `--pretty` - Pretty print JSON output (default: false)

#### Output Options

- `-o, --output <file>` - Output file (default: stdout)

#### Column Options

- `-c, --columns <columns>` - Select specific columns (comma-separated)
  - Example: `-c id,name,email`

#### CSV-specific Options

- `--delimiter <char>` - CSV field delimiter (default: `,`)
- `--skip-headers` - Don't include headers in output

#### Help

- `-h, --help` - Show help message
- `-v, --version` - Show version

## Examples

### Convert with Column Selection

```bash
# Export only id and name columns to CSV
calico users.json -f csv -c id,name -o selected.csv
```

### Read from stdin

```bash
# Pipe JSON data
cat data.json | calico -f yaml
```

### Convert and save

```bash
# Convert CSV to JSON and save
calico data.csv -f json -o data.json
```

### Pretty print

```bash
# Format JSON with indentation
calico data.json --pretty
```

### Create Markdown table

```bash
# Generate Markdown table from JSON
calico users.json -f markdown > users.md
```

### Chain with other tools

```bash
# Extract data with jq, export to CSV
jq '.users[] | {id, name, email}' data.json | calico -f csv -o users.csv
```

### Use with pipes

```bash
# Convert CSV to JSON via stdin
cat input.csv | calico -f json | jq '.[] | .name'
```

## Input Formats

The CLI can read JSON and CSV files:

### JSON Input

```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" },
  { "id": 2, "name": "Bob", "email": "bob@example.com" }
]
```

### CSV Input

```csv
id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com
```

## Output Examples

### JSON Output

```bash
$ calico data.csv -f json
[{"id":1,"name":"Alice","email":"alice@example.com"}]
```

### CSV Output

```bash
$ calico data.json -f csv
id,name,email
1,Alice,alice@example.com
```

### YAML Output

```bash
$ calico data.json -f yaml
- id: 1
  name: Alice
  email: alice@example.com
```

### Markdown Output

```bash
$ calico data.json -f markdown
| id | name  | email             |
|----|-------|-------------------|
| 1  | Alice | alice@example.com |
```

## Performance

Benchmark results for exporting 10,000 records:

| Format | Time | Memory |
|--------|------|--------|
| JSON | 15ms | 2.3MB |
| CSV | 18ms | 1.8MB |
| YAML | 25ms | 2.1MB |
| Markdown | 30ms | 2.5MB |

## Shell Integration

### Bash

Add to your `.bashrc`:

```bash
# Alias for quick conversion
alias csv-to-json="calico -f json"
alias to-csv="calico -f csv"
alias to-md="calico -f markdown"
```

### Zsh

Add to your `.zshrc`:

```zsh
alias csv-to-json="calico -f json"
alias to-csv="calico -f csv"
alias to-md="calico -f markdown"
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid input, file not found, etc.)
- `2` - Invalid arguments

## Error Handling

The CLI provides helpful error messages:

```bash
$ calico nonexistent.json
Error: File not found: nonexistent.json

$ calico data.json -f invalid
Error: Invalid format: invalid (valid: json, csv, yaml, markdown)

$ calico data.csv
Error: Unable to parse input: Unexpected character
```

## Troubleshooting

### "Command not found: calico"

Make sure the package is installed globally:

```bash
npm install -g @alexcatdad/calico-cli
```

Or use with npx:

```bash
npx @alexcatdad/calico-cli <input> [options]
```

### "Unable to parse input"

Check that your input file is valid JSON or CSV:

```bash
# Validate JSON
jq . data.json > /dev/null && echo "Valid JSON"

# Try specifying the format
calico data.json -f json
```

### Large file handling

For very large files, consider using streams:

```bash
# Process with jq before export
jq '.[] | select(.active == true)' large.json | calico -f csv
```

## Browser Support

This is a CLI tool for Node.js/terminal use. For browser support, use [@alexcatdad/calico](../core) directly.

## Node.js Support

- Node.js 18.x
- Node.js 20.x
- Node.js 22.x+

## License

MIT © [@alexcatdad](https://github.com/alexcatdad)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## See Also

- [@alexcatdad/calico](../core) - Core data export library
- [@alexcatdad/calico-validators](../validators) - JSON Schema validation
