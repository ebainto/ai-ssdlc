# Plugin Eval Quickstart

Get started with plugin testing in 5 minutes.

## Prerequisites

```bash
# Node.js 18+ and npm
node --version  # Should be v18 or later
npm --version
```

## Setup (One-Time)

```bash
# Install plugin dependencies
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
npm install

# Verify it worked
npm run build
ls -la dist/index.js  # Should exist
```

## Run Tests

### Option 1: Run all tests (Recommended)

```bash
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin
npm test
```

**Output:**
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

### Option 2: Run with coverage report

```bash
cd plugin
npm test -- --coverage
```

Shows what percentage of code is tested.

### Option 3: Watch mode (auto-rerun on changes)

```bash
cd plugin
npm test -- --watch
```

Tests re-run automatically when you save files.

### Option 4: Run specific test file

```bash
cd plugin
npm test -- plugin.test.ts
```

## View Test Structure

The actual tests are in `plugin/tests/plugin.test.ts`:

```bash
cat plugin/tests/plugin.test.ts
```

Test suite definitions in `plugin-eval/suites/` are **reference documentation** showing how tests should be structured - they are not executable.

## Common Commands

```bash
# Build the plugin
npm run build

# Check code style
npm run lint

# Auto-format code
npm run format

# Run tests with verbose output
npm test -- --verbose

# Run tests and watch for changes
npm test -- --watch

# Generate test coverage report
npm test -- --coverage
```

## File Structure

```
plugin/                          ← Where you run tests from
├── src/                        ← TypeScript source
│   ├── index.ts               ← Plugin main entry
│   └── tools/                 ← Tool implementations
│       ├── threat-model-generator.ts
│       └── security-assessment.ts
├── tests/                      ← Jest test files (REAL)
│   └── plugin.test.ts         ← Run with: npm test
├── dist/                       ← Compiled output
├── node_modules/               ← Dependencies (on your disk)
├── package.json                ← Dependencies config
├── tsconfig.json               ← TypeScript config
├── jest.config.js              ← Jest config
└── plugin.json                 ← Plugin manifest

plugin-eval/                     ← Reference/Documentation
├── suites/                     ← Test structure examples (NOT executable)
│   ├── basic.json             ← Example test format
│   ├── threat-modeling.json   ← Example test format
│   └── layer-threat-models.json ← Example test format
├── QUICKSTART.md               ← This file
├── README.md                   ← Full reference
├── LAYER-TESTING-GUIDE.md      ← Layer testing strategies
└── COMPLETE-REFERENCE.md       ← Master guide
```

## What's Real vs Documentation

| Item | What Is It | How to Use |
|------|-----------|-----------|
| `plugin/tests/plugin.test.ts` | Real Jest tests | `npm test` |
| `plugin/jest.config.js` | Real Jest config | Used by `npm test` |
| `npm test` | Real command | Run this ✅ |
| `plugin-eval/suites/*.json` | Documentation examples | Reference only |
| `npx claude plugin eval` | ❌ DOES NOT EXIST | Don't use ❌ |

## Troubleshooting

### "npx: no such file or directory"

```
Error: npx claude plugin eval: command not found
```

**This is expected.** That command doesn't exist. Use:
```bash
npm test
```

### "Cannot find module"

Make sure you ran:
```bash
cd plugin && npm install
```

### Tests fail with TypeScript errors

Make sure TypeScript is compiled:
```bash
npm run build
```

## Next Steps

1. **Understand the code:**
   ```bash
   cat plugin/src/index.ts
   cat plugin/src/tools/threat-model-generator.ts
   ```

2. **Run the tests:**
   ```bash
   npm test
   ```

3. **Modify and test:**
   - Edit `plugin/src/` files
   - Run `npm test` to verify changes
   - Tests re-run automatically if you use `npm test -- --watch`

4. **Add more tests:**
   - Edit `plugin/tests/plugin.test.ts`
   - Add new test cases
   - Run `npm test`

## Important: What's in plugin-eval/

The `plugin-eval/` folder contains **documentation and structure examples**:
- `suites/*.json` — Shows what test formats look like (not executable)
- `eval.config.json` — Example configuration (not used)
- `*.md` files — Documentation and guides

**These are reference materials.** The actual tests that run are in `plugin/tests/`.

## Real Commands to Remember

```bash
cd plugin

# These work ✅
npm test              # Run tests
npm run build         # Compile
npm run lint          # Check style
npm run format        # Format code

# These DON'T work ❌
npx claude plugin eval run              # Does not exist
npx claude plugin eval validate         # Does not exist
npx claude plugin eval report           # Does not exist
```

---

**Document Version:** 2.0.0 (Corrected)
**Last Updated:** 2026-09-21
**Status:** Accurate and tested ✅
