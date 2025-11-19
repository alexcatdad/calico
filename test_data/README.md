# Test Data

This directory contains sample datasets for testing and benchmarking Calico's export/import functionality.

## Files

### users_10k.csv
A CSV file with 10,000 user records containing:
- id (1-10000)
- name (User 1 - User 10000)
- email (user{id}@example.com)
- age (20-69)
- city (New York, San Francisco, Chicago, Austin, Seattle, Boston, Denver, Portland)
- department (Engineering, Sales, Marketing, HR, Finance, Operations, Design)
- salary (40000-190000)
- active (true/false)
- joinDate (2020-2023)

**Size**: ~766KB

## Usage

Test format conversions with the CLI:

```bash
# CSV to JSON
bun packages/cli/src/index.ts -i test_data/users_10k.csv -o output.json -f json -p

# CSV to YAML
bun packages/cli/src/index.ts -i test_data/users_10k.csv -o output.yaml -f yaml

# CSV to Markdown
bun packages/cli/src/index.ts -i test_data/users_10k.csv -o output.md -f md

# JSON back to CSV (round-trip test)
bun packages/cli/src/index.ts -i output.json -o output.csv -f csv
```

## Performance Testing

Use these files with the benchmark scripts:

```bash
# Test with the 10K dataset
bun scripts/benchmark-10k.ts
```

## Notes

- This directory is **not included in npm distributions** (see `.npmignore`)
- Test data is committed to the repository for easy CI/CD testing
- Files can be regenerated if needed by updating the data generation script
