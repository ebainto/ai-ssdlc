# Plugin Evaluation Suite

⚠️ **CLARIFICATION:** This directory contains **documentation and reference materials** for the plugin's testing approach.

**The actual tests are in `plugin/tests/` and are run with `npm test`.**

The `.json` files in `suites/` show test structure formats — they are not executable. They document how tests should be organized and structured for reference purposes.

## Structure

```
plugin-eval/
├── eval.config.json          # Main evaluation configuration
├── suites/                   # Test suite definitions
│   ├── basic.json           # Basic functionality tests
│   ├── threat-modeling.json # Threat model generation tests
│   └── security-assessment.json # Security assessment tests
├── fixtures/                # Test data and mock responses
├── reports/                 # Generated test reports
└── README.md               # This file
```

## Test Suites

### Basic Functionality (`basic.json`)
Tests core plugin operations:
- Plugin initialization
- Tool availability
- Input validation
- Error handling

**Run single suite:**
```bash
npx claude plugin eval run \
  --config plugin-eval/eval.config.json \
  --suite plugin-eval/suites/basic.json
```

### Threat Modeling (`threat-modeling.json`)
Tests STRIDE threat model generation:
- Component-level threat modeling
- Layer-level threat modeling
- Full system threat modeling
- Output structure validation

**Expected behavior:**
- Identifies at least 3 threats per component
- Covers all STRIDE categories (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
- Returns structured threat objects with mitigation guidance

### Security Assessment (`security-assessment.json`)
Tests compliance framework assessment:
- NIST CSF 2.0 assessment
- ISO 27001:2022 assessment
- PCI-DSS v4.0 assessment
- GDPR assessment

**Expected behavior:**
- Maps architecture components to framework controls
- Identifies compliance gaps
- Returns compliance scores

## Running Tests

⚠️ **IMPORTANT:** The test files in `suites/` are **reference documentation**, not executable.

**Real tests are in `plugin/tests/` — run them with:**

```bash
cd plugin
npm test
```

### About plugin-eval/suites/

The `.json` files in `suites/` demonstrate:
- `basic.json` — Basic test structure format
- `threat-modeling.json` — Threat modeling test format
- `security-assessment.json` — Compliance test format
- `layer-threat-models.json` — Layer-specific test format

These are **learning materials and templates** showing how to structure tests. The actual executable tests are in `plugin/tests/plugin.test.ts`.

### Commands That Work

```bash
# ✅ These work
cd plugin
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report

# ❌ These DON'T work
npx claude plugin eval run        # Does not exist
npx claude plugin eval report     # Does not exist
```

## Configuration Reference

### eval.config.json

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Eval config version |
| `plugin_path` | string | Path to plugin directory |
| `test_suites` | array | Array of test suite files to run |
| `sandbox.timeout` | number | Test timeout in milliseconds |
| `sandbox.max_retries` | number | Max retry attempts per test |
| `reporting.format` | string | Output format (json/xml/csv) |
| `reporting.fail_threshold` | number | Minimum pass rate (0-1) to succeed |
| `ci.enabled` | boolean | Enable CI mode |
| `ci.fail_on_warning` | boolean | Fail CI on warnings |

## Test Case Anatomy

Each test case in a suite has:

```json
{
  "id": "unique-test-id",
  "name": "Human-readable test name",
  "description": "What this test validates",
  "tool": "plugin_tool_name",
  "input": { /* Tool input */ },
  "expected_output": { /* Expected result structure */ },
  "assertions": [ /* Assertion rules */ ],
  "timeout": 15000,
  "retry_count": 1
}
```

### Assertion Operators

- `equals` — strict equality check
- `contains` — array or string contains value
- `contains_all` — array contains all values
- `has_keys` — object has specified keys
- `length_gte` — array/string length >= value
- `gte` — value >= threshold
- `lte` — value <= threshold

## CI/CD Integration

GitHub Actions workflow: `.github/workflows/plugin-eval.yml`

**Triggers:**
- Push to `main` or `develop` branches (plugin or plugin-eval changes)
- Pull requests to `main` or `develop` branches (plugin or plugin-eval changes)

**Workflow:**
1. Checkout code
2. Install Node.js dependencies
3. Run all test suites
4. Generate combined HTML report
5. Upload artifacts
6. Publish results as PR comment
7. Fail if tests don't meet threshold

**Required GitHub secrets:**
- None (can be added for future Anthropic API integration if needed)

## Extending Tests

### Add a new test case

1. Open the relevant suite file in `suites/`
2. Add to `test_cases` array:

```json
{
  "id": "unique-id",
  "name": "Test name",
  "description": "What it tests",
  "tool": "tool_name",
  "input": { /* your input */ },
  "assertions": [
    {
      "path": "$.field",
      "operator": "equals",
      "value": "expected_value"
    }
  ],
  "timeout": 15000
}
```

### Add a new test suite

1. Create `suites/my-suite.json`
2. Add to `eval.config.json`:
   ```json
   "test_suites": [
     "suites/basic.json",
     "suites/my-suite.json"
   ]
   ```
3. Run evaluation to test

### Add test fixtures

Store test data in `fixtures/`:
- `fixtures/architectures/` — Sample architecture documents
- `fixtures/responses/` — Expected tool responses
- `fixtures/edge-cases/` — Edge case inputs

Reference in tests:
```json
"input": { "@fixture": "fixtures/architectures/microservices.md" }
```

## Troubleshooting

### Tests timeout
- Increase `sandbox.timeout` in `eval.config.json`
- Check plugin logs for slow operations
- Profile threat modeling generation

### Tests fail with "tool not found"
- Verify plugin is properly initialized
- Check `plugin.json` tool definitions match test `tool` field
- Run `listTools` test to verify availability

### Assertions fail
- Check assertion operators match value types
- Verify expected output schema matches actual response
- Use `--debug` flag for detailed output

### CI workflow fails
- Check GitHub Actions logs
- Verify Node.js version compatibility
- Ensure all dependencies install correctly

## Performance Baselines

Target execution times per suite (in seconds):

| Suite | Target | Max acceptable |
|-------|--------|-----------------|
| basic.json | 10s | 20s |
| threat-modeling.json | 45s | 90s |
| security-assessment.json | 40s | 80s |

If tests consistently exceed max acceptable, consider:
- Optimizing threat model generation
- Caching assessment results
- Parallelizing independent test cases

## Next Steps

1. **Customize test suites** — Add domain-specific test cases for your use cases
2. **Add performance tests** — Test response times under load
3. **Add integration tests** — Test plugin interaction with other systems
4. **Set up monitoring** — Track test results over time
5. **Document custom assertions** — If adding new assertion types

## Support

For issues or questions about:
- **Plugin functionality** — See `../plugin/README.md`
- **SSDLC processes** — See `../docs/guides/`
- **Test configuration** — See this file
