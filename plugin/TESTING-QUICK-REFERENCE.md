# Testing Quick Reference Card

## 🎯 TL;DR - Run Tests in 3 Steps

```bash
# 1. Navigate to plugin folder
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin

# 2. Run tests
npm test

# 3. See results
# Tests: 9 passed, 9 total ✅
```

---

## 📁 Folder Structure

```
ai-ssdlc/
├── plugin/                          ← RUN npm test FROM HERE
│   ├── src/                         ← Plugin source code
│   │   ├── index.ts                ← Main entry point
│   │   └── tools/                  ← Tool implementations
│   │       ├── threat-model-generator.ts
│   │       └── security-assessment.ts
│   │
│   ├── tests/                       ← TEST FILES GO HERE
│   │   └── plugin.test.ts           ← EDIT THIS FILE TO ADD TESTS
│   │
│   ├── dist/                        ← Compiled output (auto-generated)
│   ├── node_modules/                ← Dependencies (on your disk)
│   │
│   ├── package.json                 ← Defines npm scripts
│   ├── jest.config.js               ← Jest configuration
│   ├── tsconfig.json                ← TypeScript configuration
│   ├── plugin.json                  ← Plugin manifest
│   │
│   ├── TESTING-GUIDE.md             ← Full guide (you are reading this!)
│   └── TESTING-QUICK-REFERENCE.md   ← This file
│
├── plugin-eval/                     ← Reference documentation (not executable)
└── ...other folders...
```

---

## ✅ Commands That Work

| Command | What It Does | From |
|---------|-------------|------|
| `npm test` | Run all tests | `plugin/` folder |
| `npm test -- --watch` | Watch mode (auto re-run) | `plugin/` folder |
| `npm test -- --coverage` | Show test coverage | `plugin/` folder |
| `npm run build` | Compile TypeScript | `plugin/` folder |
| `npm run lint` | Check code style | `plugin/` folder |
| `npm run format` | Auto-format code | `plugin/` folder |

---

## ❌ Commands That DON'T Work

| Command | Why It Fails |
|---------|------------|
| `npm test` (from plugin-eval/) | No package.json in plugin-eval |
| `npx claude plugin eval run` | Command doesn't exist |
| `npx claude plugin eval report` | Command doesn't exist |
| `npm test` (from project root) | No package.json at root |

---

## 🧪 Test File Location

```
/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/tests/plugin.test.ts
                                            ↑ RUN npm test FROM HERE
```

### Current Test Structure

```typescript
describe('Threat Model Generator', () => {
  it('should generate threats for a component', async () => {...});
  it('should cover multiple STRIDE categories', async () => {...});
  it('should throw error for empty description', async () => {...});
  it('should have mitigations for all threats', async () => {...});
});

describe('Security Assessment', () => {
  it('should assess architecture against NIST framework', async () => {...});
  it('should identify compliance gaps', async () => {...});
  it('should support multiple compliance frameworks', async () => {...});
  it('should throw error for empty architecture', async () => {...});
});

describe('Plugin Integration', () => {
  it('should have threat model and security assessment tools', async () => {...});
});
```

---

## 🆕 How to Add a Test - 2 Steps

### Step 1: Open test file
```bash
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
vim tests/plugin.test.ts
```

### Step 2: Add test to appropriate `describe` block

**Template:**
```typescript
it('should do something', async () => {
  // Setup
  const tool = new SomeTool();
  
  // Execute
  const result = await tool.doSomething(input);
  
  // Verify
  expect(result.status).toBe('success');
  expect(result.data).toBeDefined();
});
```

**Example:**
```typescript
describe('Threat Model Generator', () => {
  // ... existing tests ...
  
  // ADD THIS NEW TEST
  it('should handle very long descriptions', async () => {
    const generator = new ThreatModelGenerator();
    const longDesc = 'A'.repeat(50000);
    
    const result = await generator.generate(longDesc, 'component');
    
    expect(result.status).toBe('success');
    expect(result.threats.length).toBeGreaterThan(0);
  });
});
```

---

## ✏️ How to Edit a Test - 2 Steps

### Step 1: Find the test
```bash
grep -n "should generate threats" tests/plugin.test.ts
```

### Step 2: Edit it
```typescript
// BEFORE
expect(result.threats).toHaveLength(3);

// AFTER (if plugin now returns 4)
expect(result.threats).toHaveLength(4);
```

Then run:
```bash
npm test
```

---

## 📊 Test Results

### Success
```
PASS tests/plugin.test.ts
  Plugin Tools
    Threat Model Generator
      ✓ should generate threats for a component
      ✓ should cover multiple STRIDE categories
      ✓ should throw error for empty description
      ✓ should have mitigations for all threats
    Security Assessment
      ✓ should assess architecture against NIST framework
      ✓ should identify compliance gaps
      ✓ should support multiple compliance frameworks
      ✓ should throw error for empty architecture
    Plugin Integration
      ✓ should have threat model and security assessment tools

Tests:  9 passed, 9 total
Time:   0.74 s
```

### Failure
```
FAIL tests/plugin.test.ts
  ● Threat Model Generator › should generate threats for a component

    Expected: 3
    Received: 4

    expect(received).toHaveLength(expected)
       11 |   expect(result.threats).toHaveLength(3);
          |                          ^
    
Tests:  1 failed, 8 passed
```

**Fix:** Update the test to expect 4 instead of 3, then re-run.

---

## 🔍 Common Assertions

```typescript
// Check exact value
expect(result.status).toBe('success');

// Check array length
expect(result.threats).toHaveLength(3);

// Check it's greater than
expect(threats.length).toBeGreaterThan(0);

// Check object has property
expect(threat).toHaveProperty('id');

// Check array contains item
expect(categories).toContain('Spoofing');

// Check function threw error
await expect(fn()).rejects.toThrow('INVALID_INPUT');

// Check value is defined
expect(result).toBeDefined();

// Check multiple conditions
expect(result.status).toBe('success');
expect(result.threats).toBeDefined();
expect(result.threats.length).toBeGreaterThan(0);
```

---

## 🚀 Development Workflow

```bash
# 1. Terminal: Watch mode (auto re-run tests)
cd plugin
npm test -- --watch

# 2. Editor: Edit tests/plugin.test.ts
# (save file → tests auto-run in terminal)

# 3. See results in terminal immediately
```

---

## 📋 Checklist for Adding Tests

- [ ] Navigate to: `/Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin`
- [ ] Open file: `tests/plugin.test.ts`
- [ ] Find the right `describe()` block
- [ ] Add `it('test name', async () => { ... })`
- [ ] Save file
- [ ] Run: `npm test`
- [ ] Verify: Test passes or fails correctly

---

## 🆘 If Tests Fail

```bash
# 1. Check you're in right folder
pwd  # Should end with: /ai-ssdlc/plugin

# 2. Rebuild
npm run build

# 3. Run tests again
npm test

# 4. Check test file syntax
cat tests/plugin.test.ts | head -50

# 5. See full error
npm test -- --verbose
```

---

## 📝 Key Paths

```
Test Command From:     /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
Test File Edit:        /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/tests/plugin.test.ts
Source Code:           /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/src/
Jest Config:           /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin/jest.config.js
```

---

## ⏱️ One-Minute Workflow

```bash
# Terminal 1: Watch mode
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
npm test -- --watch

# Terminal 2: Edit tests
vim tests/plugin.test.ts
# Make changes, save

# Terminal 1: See tests run automatically ✅
```

---

**Last Updated:** 2026-09-21
**All commands tested and verified ✅**
