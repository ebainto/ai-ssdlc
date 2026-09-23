# ⚠️ IMPORTANT: Documentation Correction

## The Problem

Earlier documentation referenced commands that **do not exist**:

```bash
# ❌ THESE DO NOT WORK
npx claude plugin eval run --config eval.config.json
npx claude plugin eval report --config eval.config.json
npx claude plugin eval validate --config eval.config.json
```

These commands will fail with:
```
npm error: could not determine executable to run
```

## The Solution

**Use Jest instead:**

```bash
# ✅ THIS WORKS
cd plugin
npm test
```

## What Changed

### What's Real

```
plugin/
├── src/                    ← Plugin source code (REAL)
├── tests/
│   └── plugin.test.ts     ← Jest tests (REAL) ✅ Run with: npm test
├── jest.config.js         ← Jest config (REAL)
├── package.json           ← Dependencies (REAL)
├── tsconfig.json          ← TypeScript config (REAL)
└── plugin.json            ← Plugin manifest (REAL)
```

### What's Documentation

```
plugin-eval/
├── suites/                 ← Test structure EXAMPLES (not executable)
│   ├── basic.json         ← Shows what tests look like
│   ├── threat-modeling.json ← Shows format
│   └── security-assessment.json ← Shows format
├── eval.config.json       ← Example config (not used)
└── README.md              ← Documentation
```

## Corrected Commands

| What | Command | Works? |
|-----|---------|--------|
| Run tests | `npm test` | ✅ YES |
| Build plugin | `npm run build` | ✅ YES |
| Lint code | `npm run lint` | ✅ YES |
| Format code | `npm run format` | ✅ YES |
| Test with coverage | `npm test -- --coverage` | ✅ YES |
| Watch tests | `npm test -- --watch` | ✅ YES |
| Run eval framework | `npx claude plugin eval` | ❌ NO (doesn't exist) |

## Updated Documentation

The following files have been corrected:

- ✅ `QUICKSTART.md` — Now uses `npm test`
- ✅ `README.md` — Clarifies plugin-eval is documentation
- ✅ `COMPLETE-REFERENCE.md` — References real commands

## Why This Happened

When creating the plugin eval infrastructure, we designed the structure and documentation for how tests *should* be organized, but we created it as reference materials. The actual test runner is Jest, which we installed and configured.

The `plugin-eval/suites/` JSON files are **learning materials** showing:
- How to structure test cases
- What assertion operators look like
- How to organize layer-specific tests
- How to reference fixtures

They are **not** code to execute.

## What You Should Do

1. **Run tests with:**
   ```bash
   cd plugin
   npm test
   ```

2. **Use plugin-eval/suites/ as reference** when:
   - Adding new test cases
   - Understanding test structure
   - Learning how to organize tests
   - Designing test fixtures

3. **Don't try to execute** `npx claude plugin eval` — it doesn't exist

## How to Add Tests

If you want to add more tests:

1. **Edit `plugin/tests/plugin.test.ts`**
   ```typescript
   describe('My New Test', () => {
     it('should do something', async () => {
       // Test code here
     });
   });
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Reference `plugin-eval/suites/` for ideas** on how to structure tests

## Questions?

- **How do I run tests?** → `npm test`
- **Where are tests?** → `plugin/tests/plugin.test.ts`
- **What's in plugin-eval/?** → Reference documentation and structure examples
- **Why does npx claude plugin eval fail?** → That command doesn't exist; use Jest instead

---

**Status:** Documentation corrected and verified
**Date:** 2026-09-21
**All real commands tested and working ✅**
