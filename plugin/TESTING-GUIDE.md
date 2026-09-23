# Plugin Testing Guide

Complete guide to running, adding, and editing tests in the plugin.

---

## Running Tests

### Folder Path

**You MUST be in the `plugin/` folder to run tests:**

```bash
# ✅ CORRECT - Run from plugin folder
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
npm test

# ❌ WRONG - Don't run from plugin-eval folder
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin-eval
npm test  # Will fail - no package.json here
```

### Folder Structure

```
ai-ssdlc/
└── plugin/                    ← YOU ARE HERE
    ├── src/
    │   ├── index.ts
    │   └── tools/
    ├── tests/                 ← Test files go here
    │   └── plugin.test.ts
    ├── dist/
    ├── node_modules/
    ├── package.json           ← Defines npm test command
    ├── tsconfig.json
    ├── jest.config.js         ← Jest configuration
    └── plugin.json
```

### Run Tests from Plugin Folder

```bash
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin

# Run all tests
npm test

# Watch mode (re-run on file change)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Verbose output
npm test -- --verbose

# Run specific test file
npm test -- plugin.test.ts

# Run tests matching a pattern
npm test -- threat-model
```

---

## Test File Location

### Current Test File

```
plugin/tests/plugin.test.ts
```

This file contains all the current tests:
- Threat Model Generator tests (4 tests)
- Security Assessment tests (4 tests)
- Plugin Integration tests (1 test)

---

## Adding a New Test

### Step 1: Open the Test File

```bash
# From plugin folder
cat tests/plugin.test.ts

# Or edit it
vim tests/plugin.test.ts
# or use VS Code, etc.
```

### Step 2: Add a Test Case

**Test file structure:**

```typescript
// tests/plugin.test.ts

describe('Feature Name', () => {
  it('should do something', async () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Step 3: Example - Add Test for New Functionality

Let's say you want to add a test for a new tool. Here's how:

**Before:** (current file)
```typescript
describe('Plugin Integration', () => {
  it('should have threat model and security assessment tools', async () => {
    const generator = new ThreatModelGenerator();
    const assessor = new SecurityAssessment();

    const threats = await generator.generate('Test system', 'component');
    const assessment = await assessor.assess('Test system', 'NIST');

    expect(threats.status).toBe('success');
    expect(assessment.status).toBe('success');
  });
});
```

**After:** (with new test added)
```typescript
describe('Plugin Integration', () => {
  it('should have threat model and security assessment tools', async () => {
    const generator = new ThreatModelGenerator();
    const assessor = new SecurityAssessment();

    const threats = await generator.generate('Test system', 'component');
    const assessment = await assessor.assess('Test system', 'NIST');

    expect(threats.status).toBe('success');
    expect(assessment.status).toBe('success');
  });

  // NEW TEST ADDED HERE
  it('should handle large system descriptions', async () => {
    const generator = new ThreatModelGenerator();
    const largeDescription = 'A'.repeat(10000); // Very long description
    
    const result = await generator.generate(largeDescription, 'full-system');
    
    expect(result.status).toBe('success');
    expect(result.threats.length).toBeGreaterThan(0);
  });
});
```

### Step 4: Run the Test

```bash
# From plugin folder
npm test

# Output:
# PASS tests/plugin.test.ts
#   Plugin Integration
#     ✓ should have threat model and security assessment tools
#     ✓ should handle large system descriptions ← NEW TEST
#
# Tests: 10 passed, 10 total
```

---

## Editing Existing Tests

### Step 1: Open the Test File

```bash
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
cat tests/plugin.test.ts
```

### Step 2: Find the Test to Edit

**Example:** Let's say the test `"should generate threats for a component"` is failing. Find it:

```typescript
describe('Threat Model Generator', () => {
  it('should generate threats for a component', async () => {
    const generator = new ThreatModelGenerator();
    const result = await generator.generate(
      'REST API with JWT authentication',
      'component'
    );

    expect(result.status).toBe('success');
    expect(result.threats).toHaveLength(3);  // ← Maybe change this
    expect(result.threats[0]).toHaveProperty('id');
  });
});
```

### Step 3: Edit the Test

**Before:**
```typescript
expect(result.threats).toHaveLength(3);
```

**After:** (if plugin now returns 5 threats)
```typescript
expect(result.threats).toHaveLength(5);
```

### Step 4: Save and Run

```bash
npm test

# Check if it passes
```

---

## Common Test Patterns

### Pattern 1: Testing Tool Output

```typescript
it('should return structured threat data', async () => {
  const generator = new ThreatModelGenerator();
  const result = await generator.generate('Test API', 'component');

  // Check status
  expect(result.status).toBe('success');
  
  // Check threats array
  expect(result.threats).toBeDefined();
  expect(result.threats.length).toBeGreaterThan(0);
  
  // Check threat structure
  const threat = result.threats[0];
  expect(threat).toHaveProperty('id');
  expect(threat).toHaveProperty('category');
  expect(threat).toHaveProperty('mitigation');
});
```

### Pattern 2: Testing Error Handling

```typescript
it('should throw error for invalid input', async () => {
  const generator = new ThreatModelGenerator();

  // Should throw when description is empty
  await expect(
    generator.generate('', 'component')
  ).rejects.toThrow('INVALID_INPUT');
});
```

### Pattern 3: Testing Multiple Scenarios

```typescript
it('should support multiple scopes', async () => {
  const generator = new ThreatModelGenerator();
  const scopes = ['component', 'layer', 'full-system'];

  for (const scope of scopes) {
    const result = await generator.generate('Test', scope);
    expect(result.status).toBe('success');
  }
});
```

### Pattern 4: Testing Compliance Assessment

```typescript
it('should assess all compliance frameworks', async () => {
  const assessor = new SecurityAssessment();
  const frameworks = ['NIST', 'ISO27001', 'PCI-DSS', 'GDPR'];

  for (const framework of frameworks) {
    const result = await assessor.assess('Architecture', framework);
    
    expect(result.status).toBe('success');
    expect(result.framework).toBe(framework);
    expect(result.controls_assessed).toBeGreaterThan(0);
  }
});
```

---

## Jest Assertion Reference

Common assertions you can use in tests:

| Assertion | Usage | Example |
|-----------|-------|---------|
| `toBe()` | Exact match | `expect(status).toBe('success')` |
| `toEqual()` | Deep equality | `expect(obj).toEqual({a: 1})` |
| `toHaveLength()` | Array length | `expect(threats).toHaveLength(3)` |
| `toBeGreaterThan()` | Number comparison | `expect(count).toBeGreaterThan(0)` |
| `toBeTruthy()` | Truthy check | `expect(result).toBeTruthy()` |
| `toBeDefined()` | Defined check | `expect(value).toBeDefined()` |
| `toContain()` | Array contains | `expect(items).toContain('x')` |
| `toHaveProperty()` | Object has key | `expect(obj).toHaveProperty('id')` |
| `toThrow()` | Function throws | `expect(fn).toThrow()` |
| `rejects.toThrow()` | Async throws | `await expect(asyncFn).rejects.toThrow()` |

---

## Complete Example: Adding a New Test

### Scenario
You want to add a test to verify that the plugin validates input length.

### Step 1: Edit the test file

```bash
cd plugin
# Open tests/plugin.test.ts
vim tests/plugin.test.ts
```

### Step 2: Find where to add it

Scroll down to find the Threat Model Generator tests:

```typescript
describe('Threat Model Generator', () => {
  it('should generate threats for a component', async () => {
    // ... existing test ...
  });

  it('should cover multiple STRIDE categories', async () => {
    // ... existing test ...
  });

  // ADD NEW TEST HERE
  // ↓ ↓ ↓
});
```

### Step 3: Add the new test

```typescript
describe('Threat Model Generator', () => {
  it('should generate threats for a component', async () => {
    // ... existing ...
  });

  it('should cover multiple STRIDE categories', async () => {
    // ... existing ...
  });

  // NEW TEST
  it('should validate input description length', async () => {
    const generator = new ThreatModelGenerator();
    
    // Very long description (100,000 characters)
    const veryLongDesc = 'A'.repeat(100000);
    
    // Should still work (not throw an error)
    const result = await generator.generate(veryLongDesc, 'component');
    
    expect(result.status).toBe('success');
    expect(result.threats).toBeDefined();
  });
});
```

### Step 4: Save the file

### Step 5: Run the tests

```bash
npm test
```

### Step 6: Verify it passes

```
PASS tests/plugin.test.ts
  Threat Model Generator
    ✓ should generate threats for a component
    ✓ should cover multiple STRIDE categories
    ✓ should validate input description length ← NEW

Tests: 12 passed, 12 total
```

---

## Editing an Existing Test

### Example: Change the expected threat count

**Current test:**
```typescript
it('should generate threats for a component', async () => {
  const generator = new ThreatModelGenerator();
  const result = await generator.generate(
    'REST API with JWT authentication',
    'component'
  );

  expect(result.status).toBe('success');
  expect(result.threats).toHaveLength(3);  // Expects 3 threats
});
```

**If plugin now returns 4 threats, edit it:**

```typescript
it('should generate threats for a component', async () => {
  const generator = new ThreatModelGenerator();
  const result = await generator.generate(
    'REST API with JWT authentication',
    'component'
  );

  expect(result.status).toBe('success');
  expect(result.threats).toHaveLength(4);  // Changed from 3 to 4
});
```

**Run tests:**
```bash
npm test
# Should pass now ✅
```

---

## Watch Mode (Automatic Re-run)

For development, use watch mode to automatically re-run tests when you change files:

```bash
cd plugin
npm test -- --watch
```

**Output:**
```
PASS tests/plugin.test.ts

Tests: 9 passed, 9 total

Watch mode is running. Press 'q' to quit, 'p' to filter by filename...
```

Now whenever you edit `tests/plugin.test.ts` or `src/`, tests re-run automatically.

---

## Coverage Report

See what percentage of code is tested:

```bash
cd plugin
npm test -- --coverage
```

**Output:**
```
---------|----------|----------|----------|----------|
File     | % Stmts  | % Branch | % Funcs  | % Lines  |
---------|----------|----------|----------|----------|
All      |   85.32  |   72.41  |   88.89  |   85.32  |
 index   |   90.00  |   80.00  |   100   |   90.00  |
 tools/  |   82.00  |   70.00  |   85.00  |   82.00  |
---------|----------|----------|----------|----------|
```

Higher percentages are better. Aim for 80%+ coverage.

---

## Troubleshooting

### Issue: "npm test" fails with TypeScript errors

**Solution:**
```bash
# Make sure TypeScript is compiled first
npm run build

# Then run tests
npm test
```

### Issue: Test passes locally but fails in CI

**Solution:**
```bash
# Run with exact same environment as CI
npm test -- --verbose

# Or run full build + test
npm run build && npm test
```

### Issue: "Cannot find module" error

**Solution:**
```bash
# Make sure dependencies are installed
npm install

# Rebuild
npm run build

# Run tests again
npm test
```

### Issue: Only one test runs instead of all

**Solution:**
```bash
# Check for focused tests (.only)
grep -n "\.only\|\.skip" tests/plugin.test.ts

# Remove .only to run all tests
# it.only('test') → it('test')
```

---

## File Paths Reference

**Always remember these paths:**

| What | Path | Command |
|-----|------|---------|
| Run tests from | `/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin` | `npm test` |
| Test file | `/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/tests/plugin.test.ts` | Edit here |
| Source code | `/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/src/` | Reference in tests |
| Jest config | `/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/jest.config.js` | No need to edit |

---

## Quick Reference

```bash
# Navigate to plugin folder
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin

# Run all tests (from plugin folder)
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- plugin.test.ts

# Edit the test file
vim tests/plugin.test.ts

# Then save and tests auto-run (if in watch mode)
# Or manually run: npm test
```

---

**Document Version:** 1.0.0
**Last Updated:** 2026-09-21
**All paths tested and verified ✅**
