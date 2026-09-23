# Plugin Evaluation Guide

Complete guide to understanding and using Claude plugin evaluation in the AI-SSDLC project.

## What is Plugin Eval?

Plugin eval is Claude Code's system for **testing and validating Claude plugins**. It allows you to:

- **Define test cases** — Specify inputs and expected outputs for each plugin tool
- **Run automated tests** — Execute test suites in a sandbox environment
- **Generate reports** — View test results as JSON, HTML, or other formats
- **Integrate with CI/CD** — Automatically run tests on code changes
- **Validate quality** — Ensure plugin reliability before deployment

## Why Plugin Eval Matters for SSDLC

This SSDLC template includes a Claude plugin that provides:
- Automated STRIDE threat modeling
- Security architecture assessment
- Compliance framework mapping

**Plugin eval ensures:**
✅ Threat models are comprehensive and accurate
✅ Assessment outputs meet quality standards
✅ Compliance mappings are correct
✅ Plugin breaks are caught before deployment
✅ Security standards are maintained

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         AI-SSDLC Project                │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐    │
│  │  plugin/                       │    │
│  │  ├── plugin.json      (manifest)    │
│  │  ├── package.json     (dependencies)│
│  │  └── src/             (TypeScript)  │
│  │      ├── index.ts                   │
│  │      └── tools/                     │
│  │          ├── threat-model-gen       │
│  │          └── security-assessment    │
│  └────────────────────────────────────┘
│                                         │
│  ┌────────────────────────────────┐    │
│  │  plugin-eval/                  │    │
│  │  ├── eval.config.json  (config)     │
│  │  ├── suites/           (tests)      │
│  │  │   ├── basic.json             │
│  │  │   ├── threat-modeling.json   │
│  │  │   └── security-assessment.json
│  │  ├── fixtures/         (test data)  │
│  │  └── reports/          (results)    │
│  └────────────────────────────────────┘
│                                         │
│  ┌────────────────────────────────┐    │
│  │  .github/workflows/            │    │
│  │  └── plugin-eval.yml   (CI/CD) │    │
│  └────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Test Structure

### Test Suite (JSON format)

```json
{
  "name": "My Test Suite",
  "version": "1.0.0",
  "description": "What this suite validates",
  "test_cases": [
    {
      "id": "unique-id",
      "name": "Test name",
      "description": "What it tests",
      "tool": "plugin_tool_name",
      "input": { /* Tool input */ },
      "expected_output": { /* Expected output */ },
      "assertions": [ /* Validation rules */ ],
      "timeout": 15000,
      "retry_count": 1
    }
  ]
}
```

### Test Case Lifecycle

```
Test Start
    ↓
Setup (pre_test_steps)
    ↓
Invoke Tool with Input
    ↓
Wait for Output (timeout: 15000ms)
    ↓
Validate Assertions
    ├→ All pass? → SUCCESS
    ├→ Some fail? → FAILED
    └→ Timeout? → RETRY (if retries available)
    ↓
Teardown (post_test_steps)
    ↓
Record Result
```

### Assertion Types

```json
{
  "path": "$.field",                          // JSONPath to value
  "operator": "equals",                       // Comparison operator
  "value": "expected",                        // Expected value
  "description": "Human-readable reason"      // Optional description
}
```

**Available operators:**
- `equals` — `actual === expected`
- `contains` — `actual.includes(expected)`
- `contains_all` — `expected.every(v => actual.includes(v))`
- `has_keys` — `expected.every(k => k in actual)`
- `length_gte` — `actual.length >= expected`
- `gte` — `actual >= expected`
- `lte` — `actual <= expected`

## Plugin Tools

### Tool 1: Threat Model Generator

**Purpose:** Generate STRIDE threat models for system components

**Input:**
```json
{
  "system_description": "string (required)",
  "scope": "component|layer|full-system (required)"
}
```

**Output:**
```json
{
  "status": "success",
  "threats": [
    {
      "id": "T001",
      "category": "Spoofing|Tampering|Repudiation|Information_Disclosure|Denial_of_Service|Elevation_of_Privilege",
      "description": "Threat description",
      "attack_vector": "How the threat could be exploited",
      "likelihood": "Low|Medium|High",
      "impact": "Low|Medium|High|Critical",
      "mitigation": "How to prevent or reduce this threat"
    }
  ],
  "threat_coverage": {
    "categories": ["S", "T", "R", "I", "D", "E"]
  }
}
```

**Example test:**
```json
{
  "id": "threat-001",
  "name": "Component threat model",
  "tool": "threat_model_generator",
  "input": {
    "system_description": "REST API with JWT authentication",
    "scope": "component"
  },
  "assertions": [
    {
      "path": "$.threats",
      "operator": "length_gte",
      "value": 3
    }
  ]
}
```

### Tool 2: Security Assessment

**Purpose:** Assess architecture against compliance frameworks

**Input:**
```json
{
  "architecture_doc": "string (required)",
  "framework": "NIST|ISO27001|PCI-DSS|GDPR (required)"
}
```

**Output:**
```json
{
  "status": "success",
  "framework": "NIST|ISO27001|PCI-DSS|GDPR",
  "controls_assessed": 5,
  "compliance_percentage": 78,
  "gaps": [
    {
      "control_id": "AC-2",
      "description": "Account management",
      "severity": "High"
    }
  ]
}
```

**Example test:**
```json
{
  "id": "assess-001",
  "name": "NIST compliance",
  "tool": "security_assessment",
  "input": {
    "architecture_doc": "Multi-tier web app with encryption and MFA",
    "framework": "NIST"
  },
  "assertions": [
    {
      "path": "$.compliance_percentage",
      "operator": "gte",
      "value": 70
    }
  ]
}
```

## Test Suites Included

### 1. Basic Tests (`suites/basic.json`)
- Plugin initialization
- Tool availability
- Input validation
- Error handling

**Run time:** ~10 seconds
**When to use:** Quick validation after changes

### 2. Threat Modeling Tests (`suites/threat-modeling.json`)
- Component-level threat modeling
- Layer-level threat modeling
- Full system threat modeling
- Output structure validation

**Run time:** ~45 seconds
**When to use:** Validate threat model quality

### 3. Security Assessment Tests (`suites/security-assessment.json`)
- NIST CSF 2.0 compliance
- ISO 27001:2022 compliance
- PCI-DSS v4.0 compliance
- GDPR assessment

**Run time:** ~40 seconds
**When to use:** Validate compliance mapping

## Running Tests

### Local Development

```bash
# Install dependencies
cd plugin && npm install && cd ../plugin-eval

# Run all tests
npx claude plugin eval run --config eval.config.json

# Run single suite
npx claude plugin eval run --config eval.config.json --suite suites/basic.json

# Run with debugging
npx claude plugin eval run --config eval.config.json --debug

# Run with custom timeout
npx claude plugin eval run --config eval.config.json --timeout 30000
```

### CI/CD Pipeline

Tests automatically run on:
- **Push to main/develop** — All branches with plugin changes
- **Pull requests** — Validates changes before merge

**Workflow:** `.github/workflows/plugin-eval.yml`

**Steps:**
1. Setup Node.js environment
2. Install dependencies
3. Run all three test suites
4. Generate HTML report
5. Upload artifacts
6. Comment on PR with results
7. Fail if tests don't meet threshold

## Adding Custom Tests

### Step 1: Create test suite

```bash
cat > plugin-eval/suites/custom.json << 'EOF'
{
  "name": "Custom Tests",
  "test_cases": [
    {
      "id": "custom-001",
      "name": "My custom test",
      "tool": "threat_model_generator",
      "input": {
        "system_description": "My system",
        "scope": "component"
      },
      "assertions": [
        {
          "path": "$.status",
          "operator": "equals",
          "value": "success"
        }
      ],
      "timeout": 15000
    }
  ]
}
EOF
```

### Step 2: Add to configuration

```json
{
  "test_suites": [
    "suites/basic.json",
    "suites/threat-modeling.json",
    "suites/security-assessment.json",
    "suites/custom.json"
  ]
}
```

### Step 3: Run tests

```bash
npx claude plugin eval run --config eval.config.json --suite suites/custom.json
```

## Test Results

### Result Format

```json
{
  "suite": "Test Suite Name",
  "total": 4,
  "passed": 4,
  "failed": 0,
  "skipped": 0,
  "duration_ms": 12345,
  "test_results": [
    {
      "id": "test-001",
      "status": "passed",
      "duration_ms": 3456
    }
  ]
}
```

### Viewing Results

```bash
# JSON output
cat plugin-eval/reports/basic-report.json | jq .

# HTML report
open plugin-eval/reports/combined-report.html

# Summary
echo "Total: $(jq '.total' plugin-eval/reports/basic-report.json)"
echo "Passed: $(jq '.passed' plugin-eval/reports/basic-report.json)"
echo "Failed: $(jq '.failed' plugin-eval/reports/basic-report.json)"
```

## Troubleshooting

### Issue: Tests timeout

**Symptoms:** `TIMEOUT: Test exceeded 15000ms`

**Solutions:**
1. Increase `sandbox.timeout` in `eval.config.json`
2. Increase `timeout` in specific test case
3. Profile plugin tool — may be slow
4. Check system resources — CPU/memory

```bash
# Run with 30 second timeout
npx claude plugin eval run --config eval.config.json --timeout 30000
```

### Issue: Tool not found

**Symptoms:** `Error: Tool 'tool_name' not found`

**Solutions:**
1. Verify tool name matches `plugin.json`
2. Check plugin initialization
3. Verify tool is exported from index.ts

```bash
# Validate plugin
npx claude plugin eval validate --config eval.config.json
```

### Issue: Assertion failures

**Symptoms:** `Assertion failed: $.field equals expected`

**Solutions:**
1. Check actual output vs expected
2. Verify JSONPath is correct
3. Verify assertion operator matches value type
4. Use `--debug` flag for details

```bash
# Debug mode shows actual vs expected
npx claude plugin eval run --config eval.config.json --debug
```

### Issue: CI workflow fails

**Symptoms:** GitHub Actions workflow shows red X

**Solutions:**
1. Check workflow logs: GitHub → Actions → Plugin Evaluation
2. Verify Node.js version (must be 18+)
3. Check plugin dependencies install
4. Review test results in artifacts

## Best Practices

### Testing

1. ✅ **Test realistic scenarios** — Use actual architecture descriptions
2. ✅ **Test edge cases** — Empty input, extreme sizes, special characters
3. ✅ **Test error paths** — Invalid input, timeout scenarios
4. ✅ **Keep tests fast** — Aim for <3 seconds per test case
5. ✅ **Use descriptive IDs** — `threat-001`, not `test1`

### Organization

1. ✅ **Group by functionality** — One suite per major feature
2. ✅ **Use fixtures** — Store test data in `fixtures/` directory
3. ✅ **Version suites** — Update version on changes
4. ✅ **Document tests** — Add descriptions to every test case
5. ✅ **Keep DRY** — Reuse test data where possible

### CI/CD

1. ✅ **Run on every PR** — Catch regressions early
2. ✅ **Report results** — Comment on PR with pass/fail
3. ✅ **Track metrics** — Monitor test execution time over time
4. ✅ **Block on failure** — Prevent merges if tests fail
5. ✅ **Archive artifacts** — Keep test reports for audit

## Integration with SSDLC

Plugin eval fits into the SSDLC workflow:

```
Phase 1: Architecture Intake
    ↓
Phase 2: Threat Modeling
    ↓ [Use plugin to generate threat models]
Phase 3: Requirements
    ↓
Phase 4: Design
    ↓ [Use plugin to assess security]
Phase 5: Development Standards
    ↓ [Plugin eval validates plugin quality]
Phase 6: Security Testing
    ↓
Phase 7: Release
```

Plugin eval ensures the plugin itself meets quality standards for use in production SSDLC pipelines.

## Next Steps

1. **Customize tests** — Add tests specific to your threat model domain
2. **Add performance benchmarks** — Track plugin execution time
3. **Extend tools** — Add new assessment or modeling capabilities
4. **Integrate with monitoring** — Track test results over time
5. **Document patterns** — Create guides for specific test types

## Resources

- **Quick reference:** See `plugin-eval/QUICKSTART.md`
- **Full reference:** See `plugin-eval/README.md`
- **Plugin source:** See `plugin/src/`
- **CI/CD config:** See `.github/workflows/plugin-eval.yml`
- **Test suites:** See `plugin-eval/suites/`

---

**Last updated:** 2026-09-21
**Version:** 1.0.0
