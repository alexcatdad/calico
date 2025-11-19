# Contributing to Calico

Thank you for considering contributing to Calico! We welcome bug reports, feature requests, and pull requests.

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment. Please be respectful of others and follow these guidelines in all interactions.

## Getting Started

### Prerequisites
- Bun 1.3.2+ ([Install](https://bun.sh))
- Git
- Node.js 18+ (for type checking)

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/alexcatdad/calico.git
cd calico

# Install dependencies
bun install

# Run tests
bun turbo test

# Run linter
bun turbo lint

# Build all packages
bun turbo build
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

All changes must follow the project structure:
- Source code: `packages/*/src/`
- Tests: `packages/*/test/`
- Configuration: Root level files (tsconfig.json, biome.json, etc.)

### 3. Test Your Changes

```bash
# Run tests
bun turbo test

# Run linter (Biome)
bun turbo lint

# Build
bun turbo build
```

### 4. Commit with Conventional Commits

Commits are validated with commitlint. Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

Optional body with more details about the change.
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `refactor` - Code refactoring without changing functionality
- `perf` - Performance improvement
- `chore` - Maintenance tasks
- `ci` - CI/CD configuration

**Examples:**
- `feat(csv): add support for custom quote characters`
- `fix(validator): handle null values in required fields`
- `test: add edge case for circular references`
- `docs: update README with installation instructions`

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub. See [pull_request_template.md](.github/pull_request_template.md) for PR guidelines.

## Pull Request Guidelines

- **One feature per PR** - Keep PRs focused and reviewable
- **Tests required** - New features must include tests
- **Linting must pass** - Run `bun turbo lint` before submitting
- **All tests must pass** - Run `bun turbo test` and ensure 100% pass rate
- **Bundle size impact** - Document if your change affects bundle size
- **No dependencies** - Do not add npm dependencies to core library

## Project Structure

```
packages/
├── core/                    # Main export/import library
│   ├── src/
│   │   ├── index.ts        # Public API
│   │   ├── exporter.ts     # DataExporter class
│   │   ├── async-exporter.ts # AsyncDataExporter class
│   │   ├── formats/        # Format handlers (JSON, CSV, YAML, MD)
│   │   ├── validators/     # Validation logic
│   │   ├── types.ts        # TypeScript types
│   │   └── utils.ts        # Utility functions
│   └── test/               # Tests for core
├── validators/             # Standalone JSON Schema validator
│   └── src/
├── cli/                    # Command-line tool
│   └── src/
└── */package.json          # Package metadata
```

## Testing Guidelines

- Write tests for all public APIs
- Cover happy path and error cases
- Test edge cases (empty arrays, null values, circular references)
- Use descriptive test names
- Maintain >90% code coverage

Example test structure:
```typescript
import { describe, it, expect } from 'bun:test';
import { DataExporter } from '../src/exporter';

describe('CSV Format', () => {
  it('should convert array to CSV with headers', () => {
    const exporter = new DataExporter();
    const data = [{ name: 'Alice', age: 30 }];
    const result = exporter.toCSV(data);
    expect(result).toContain('name,age');
    expect(result).toContain('Alice,30');
  });

  it('should throw on invalid input', () => {
    const exporter = new DataExporter();
    expect(() => exporter.toCSV('not an array')).toThrow();
  });
});
```

## Code Style

The project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check style
bun turbo lint

# Auto-fix issues (if supported)
biome check --apply packages/*/src/
```

### Style Guidelines
- Use `const` by default
- Use explicit types for function parameters and returns
- Keep functions small and focused
- Write comments for complex logic
- Use meaningful variable names

## Adding New Features

### New Export Format

1. Create `packages/core/src/formats/newformat.ts`
2. Implement `toNewFormat()` and `fromNewFormat()` functions
3. Add tests in `packages/core/test/newformat.test.ts`
4. Update `packages/core/src/types.ts` to add to `ExportFormat` union
5. Update `packages/core/src/exporter.ts` to expose the new methods

### New Validation Rule

1. Add logic to `packages/validators/src/index.ts`
2. Export from public API
3. Add tests to core tests
4. Update documentation

## Bundle Size

Calico aims to keep bundle size under 15KB minified. When submitting PRs:

```bash
# Check bundle size
bun scripts/check-size.ts
```

If your changes increase bundle size significantly, please discuss in the PR description.

## Documentation

- Update README.md if you change public APIs
- Add JSDoc comments to all public functions and classes
- Document breaking changes prominently
- Include examples for new features

## Reporting Issues

When reporting a bug:
1. Use a descriptive title
2. Include Calico version, Node/Bun version, and browser version
3. Provide minimal reproducible example
4. Expected vs actual behavior
5. Error message and stack trace if applicable

## Performance Considerations

- Calico prioritizes correctness over performance
- Avoid adding synchronous operations that block the main thread
- Consider Web Workers for large dataset processing
- Keep format parsing predictable and efficient
- Document performance characteristics for new features

## Licensing

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Check existing issues and discussions
- Open a new issue with `question` label
- Review project documentation

---

**Thank you for contributing to Calico! 🎉**
