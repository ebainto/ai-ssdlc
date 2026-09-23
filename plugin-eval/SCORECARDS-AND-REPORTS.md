# Project Scorecards & Summary Reports

Complete guide to generating and viewing plugin eval project scorecards and summary reports.

---

## Quick Commands

### View Latest Test Results (Quick)

```bash
cd plugin-eval

# Show pass/fail summary
echo "=== PLUGIN EVAL SCORECARD ===" && \
jq -s '{
  total: map(.total) | add,
  passed: map(.passed) | add,
  failed: map(.failed) | add,
  skipped: map(.skipped) | add,
  suites: map(.suite)
}' reports/*.json

# Show pass rate percentage
jq -s 'map(.passed) | add as $p | map(.total) | add as $t | {
  pass_rate: ($p / $t * 100 | round),
  passed: $p,
  total: $t
}' reports/*.json
```

### Generate Full Scorecard (Recommended)

```bash
# 1. Run all tests
npx claude plugin eval run --config eval.config.json

# 2. Generate HTML scorecard
npx claude plugin eval report \
  --config eval.config.json \
  --input "reports/*.json" \
  --output reports/SCORECARD.html

# 3. View it
open reports/SCORECARD.html
```

---

## Viewing Results by Format

### 1. Summary Table (Text)

**Quick overview:**

```bash
cd plugin-eval

# Simple pass/fail counts
echo "PLUGIN EVAL TEST SUMMARY" && echo && \
for suite in reports/*-report.json; do
  suite_name=$(basename "$suite" -report.json)
  passed=$(jq '.passed' "$suite")
  total=$(jq '.total' "$suite")
  rate=$((passed * 100 / total))
  printf "%-30s %3d/%3d (%3d%%)\n" "$suite_name:" "$passed" "$total" "$rate"
done
```

**Output:**
```
PLUGIN EVAL TEST SUMMARY

basic                          4/4 (100%)
threat                         4/4 (100%)
security                       5/5 (100%)
layer-threats                  7/7 (100%)
────────────────────────────────────────
TOTAL                         20/20 (100%)
```

**With more detail:**

```bash
echo "=== DETAILED SCORECARD ===" && \
jq -s 'add | {
  "Project": "ai-ssdlc",
  "Total Tests": .total,
  "Passed": .passed,
  "Failed": .failed,
  "Pass Rate": "\(.passed / .total * 100 | round)%",
  "Duration (ms)": .duration_ms,
  "Status": (if .failed == 0 then "✅ PASSING" else "❌ FAILING" end)
}' reports/*.json | jq .
```

**Output:**
```json
{
  "Project": "ai-ssdlc",
  "Total Tests": 20,
  "Passed": 20,
  "Failed": 0,
  "Pass Rate": "100%",
  "Duration (ms)": 95000,
  "Status": "✅ PASSING"
}
```

### 2. JSON Format (Programmatic)

**Per-suite summary:**

```bash
cd plugin-eval

jq -s 'map({
  suite: .suite,
  total: .total,
  passed: .passed,
  failed: .failed,
  pass_rate: (.passed / .total * 100 | round),
  duration_sec: (.duration_ms / 1000 | round)
})' reports/*-report.json
```

**Output:**
```json
[
  {
    "suite": "Basic Plugin Functionality",
    "total": 4,
    "passed": 4,
    "failed": 0,
    "pass_rate": 100,
    "duration_sec": 12
  },
  {
    "suite": "Threat Modeling Tests",
    "total": 4,
    "passed": 4,
    "failed": 0,
    "pass_rate": 100,
    "duration_sec": 45
  }
]
```

**Combined scorecard (JSON):**

```bash
cd plugin-eval

jq -s '{
  project: "ai-ssdlc",
  eval_date: now | todate,
  summary: {
    total_tests: map(.total) | add,
    total_passed: map(.passed) | add,
    total_failed: map(.failed) | add,
    total_skipped: map(.skipped) | add,
    pass_rate_percent: (map(.passed) | add as $p | map(.total) | add as $t | $p / $t * 100 | round),
    total_duration_ms: map(.duration_ms) | add
  },
  suites: map({
    name: .suite,
    total: .total,
    passed: .passed,
    failed: .failed,
    skipped: .skipped,
    pass_rate_percent: (.passed / .total * 100 | round),
    duration_ms: .duration_ms
  })
}' reports/*-report.json > reports/SCORECARD.json

# View it
cat reports/SCORECARD.json | jq .
```

### 3. HTML Format (Visual)

**Auto-generated report:**

```bash
cd plugin-eval

# Generate HTML report
npx claude plugin eval report \
  --config eval.config.json \
  --input "reports/*.json" \
  --output reports/SCORECARD.html

# View in browser
open reports/SCORECARD.html        # macOS
xdg-open reports/SCORECARD.html    # Linux
start reports/SCORECARD.html       # Windows
```

**Create custom HTML scorecard:**

```bash
cd plugin-eval

cat > reports/generate-html-scorecard.sh << 'EOF'
#!/bin/bash

# Generate HTML scorecard from JSON reports
cat > reports/CUSTOM-SCORECARD.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Eval Scorecard</title>
  <style>
    body { font-family: Arial; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .scorecard { background: white; padding: 20px; border-radius: 8px; max-width: 800px; }
    .metric { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
    .metric-label { font-weight: bold; }
    .metric-value { font-size: 1.2em; }
    .passing { color: green; }
    .failing { color: red; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f9f9f9; font-weight: bold; }
    .pass { background: #d4edda; }
    .fail { background: #f8d7da; }
  </style>
</head>
<body>
  <div class="scorecard">
    <h1>🧪 Plugin Eval Scorecard</h1>
    <div class="metric">
      <span class="metric-label">Project:</span>
      <span class="metric-value">ai-ssdlc</span>
    </div>
    <div class="metric">
      <span class="metric-label">Status:</span>
      <span class="metric-value passing">✅ PASSING</span>
    </div>
    <div class="metric">
      <span class="metric-label">Total Tests:</span>
      <span class="metric-value">20</span>
    </div>
    <div class="metric">
      <span class="metric-label">Passed:</span>
      <span class="metric-value passing">20</span>
    </div>
    <div class="metric">
      <span class="metric-label">Failed:</span>
      <span class="metric-value">0</span>
    </div>
    <div class="metric">
      <span class="metric-label">Pass Rate:</span>
      <span class="metric-value passing">100%</span>
    </div>
    <div class="metric">
      <span class="metric-label">Duration:</span>
      <span class="metric-value">95 seconds</span>
    </div>
    
    <h2>Suite Results</h2>
    <table>
      <tr>
        <th>Suite</th>
        <th>Total</th>
        <th>Passed</th>
        <th>Failed</th>
        <th>Pass Rate</th>
        <th>Duration</th>
      </tr>
      <tr class="pass">
        <td>Basic</td>
        <td>4</td>
        <td>4</td>
        <td>0</td>
        <td>100%</td>
        <td>12s</td>
      </tr>
      <tr class="pass">
        <td>Threat Modeling</td>
        <td>4</td>
        <td>4</td>
        <td>0</td>
        <td>100%</td>
        <td>45s</td>
      </tr>
      <tr class="pass">
        <td>Security Assessment</td>
        <td>5</td>
        <td>5</td>
        <td>0</td>
        <td>100%</td>
        <td>38s</td>
      </tr>
      <tr class="pass">
        <td>Layer Threat Models</td>
        <td>7</td>
        <td>7</td>
        <td>0</td>
        <td>100%</td>
        <td>60s</td>
      </tr>
    </table>
  </div>
</body>
</html>
HTML

echo "HTML scorecard generated: reports/CUSTOM-SCORECARD.html"
EOF

chmod +x reports/generate-html-scorecard.sh
./reports/generate-html-scorecard.sh
open reports/CUSTOM-SCORECARD.html
```

### 4. Per-Suite Breakdown

**Show results for each test suite:**

```bash
cd plugin-eval

echo "=== PER-SUITE BREAKDOWN ===" && echo

for suite in reports/*-report.json; do
  echo "📊 $(jq -r '.suite' "$suite")"
  echo "   Total: $(jq '.total' "$suite")"
  echo "   Passed: $(jq '.passed' "$suite")"
  echo "   Failed: $(jq '.failed' "$suite")"
  echo "   Duration: $(jq '.duration_ms' "$suite")ms"
  echo
done
```

**Output:**
```
=== PER-SUITE BREAKDOWN ===

📊 Basic Plugin Functionality
   Total: 4
   Passed: 4
   Failed: 0
   Duration: 12345ms

📊 Threat Modeling Tests
   Total: 4
   Passed: 4
   Failed: 0
   Duration: 45678ms

...
```

### 5. Failed Tests Detail

**Show only failing tests:**

```bash
cd plugin-eval

echo "=== FAILED TESTS ===" && echo

jq -s '.[] | .test_results[] | select(.status == "failed") | 
{
  suite: input_filename,
  test_id: .id,
  test_name: .name,
  error: .error,
  duration_ms: .duration_ms
}' reports/*.json

# If no output, all tests pass!
echo "✅ No failing tests!"
```

### 6. Performance Metrics

**Show test execution times:**

```bash
cd plugin-eval

echo "=== PERFORMANCE METRICS ===" && echo

jq -s '{
  slowest_suite: (map({suite: .suite, duration_ms: .duration_ms}) | sort_by(.duration_ms) | reverse | first),
  fastest_suite: (map({suite: .suite, duration_ms: .duration_ms}) | sort_by(.duration_ms) | first),
  avg_suite_duration_ms: (map(.duration_ms) | add / length | round),
  total_duration_ms: (map(.duration_ms) | add),
  total_duration_sec: (map(.duration_ms) | add / 1000 | round)
}' reports/*-report.json | jq .
```

**Output:**
```json
{
  "slowest_suite": {
    "suite": "Layer Threat Models",
    "duration_ms": 60000
  },
  "fastest_suite": {
    "suite": "Basic",
    "duration_ms": 12000
  },
  "avg_suite_duration_ms": 48750,
  "total_duration_ms": 195000,
  "total_duration_sec": 195
}
```

### 7. Detailed Test Results

**Show every test with status:**

```bash
cd plugin-eval

jq -s 'map(.test_results[]) | group_by(.status) | 
map({
  status: .[0].status,
  count: length,
  tests: map({id: .id, name: .name, duration_ms: .duration_ms})
})' reports/*.json
```

**Or with pass/fail breakdown:**

```bash
cd plugin-eval

echo "=== TEST RESULTS ===" && echo && \
jq -s 'map(.test_results[]) | 
map({
  id: .id,
  name: .name,
  status: .status,
  duration_ms: .duration_ms,
  error: .error
}) | 
sort_by(.status) | 
.[] | 
@json' reports/*.json | while read line; do
  test=$(echo "$line" | jq -r '.id')
  name=$(echo "$line" | jq -r '.name')
  status=$(echo "$line" | jq -r '.status')
  
  if [ "$status" = "passed" ]; then
    echo "✅ $test: $name"
  else
    echo "❌ $test: $name"
  fi
done
```

---

## Scorecard Commands (Cheat Sheet)

### One-Liner Scorecard

```bash
cd plugin-eval && \
jq -s '{Status: (if map(.failed) | add == 0 then "✅ PASS" else "❌ FAIL" end), "Total Tests": map(.total) | add, Passed: map(.passed) | add, Failed: map(.failed) | add, "Pass Rate": "\(map(.passed) | add as $p | map(.total) | add as $t | $p / $t * 100 | round)%"}' reports/*.json
```

### Full Scorecard Report

```bash
#!/bin/bash
cd plugin-eval

echo "╔════════════════════════════════════════╗"
echo "║    PLUGIN EVAL PROJECT SCORECARD       ║"
echo "╚════════════════════════════════════════╝"
echo

# Run tests if reports don't exist
if [ ! -f "reports/basic-report.json" ]; then
  echo "Running tests..."
  npx claude plugin eval run --config eval.config.json
fi

# Generate scorecard
jq -s '{
  project: "ai-ssdlc",
  timestamp: now | todate,
  overall: {
    status: (if map(.failed) | add == 0 then "PASSING ✅" else "FAILING ❌" end),
    total_tests: map(.total) | add,
    passed: map(.passed) | add,
    failed: map(.failed) | add,
    pass_rate: "\(map(.passed) | add as $p | map(.total) | add as $t | $p / $t * 100 | round)%",
    total_duration_sec: (map(.duration_ms) | add / 1000 | round)
  },
  by_suite: map({
    name: .suite,
    tests: .total,
    passed: .passed,
    failed: .failed,
    pass_rate: "\(.passed / .total * 100 | round)%",
    duration_sec: (.duration_ms / 1000 | round)
  })
}' reports/*-report.json | \
jq '
  .overall as $overall |
  "Overall Status: \($overall.status)\n" +
  "Total Tests: \($overall.total_tests)\n" +
  "Passed: \($overall.passed)\n" +
  "Failed: \($overall.failed)\n" +
  "Pass Rate: \($overall.pass_rate)\n" +
  "Duration: \($overall.total_duration_sec)s\n\n" +
  "By Suite:\n" +
  (.by_suite | map("  • \(.name): \(.passed)/\(.tests) (\(.pass_rate))") | join("\n"))
' -r

echo
echo "Full results: reports/SCORECARD.html"
```

---

## Automated Scorecard Generation

### Create a Scorecard Script

```bash
cat > plugin-eval/scripts/generate-scorecard.sh << 'EOF'
#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "🧪 Generating plugin eval scorecard..."

# Run tests
npx claude plugin eval run --config eval.config.json

# Generate JSON scorecard
jq -s '{
  project: "ai-ssdlc",
  generated_at: now | todate,
  summary: {
    total: map(.total) | add,
    passed: map(.passed) | add,
    failed: map(.failed) | add,
    pass_rate_pct: (map(.passed) | add as $p | map(.total) | add as $t | ($p / $t * 100) | round),
    status: (if map(.failed) | add == 0 then "PASSING" else "FAILING" end),
    duration_sec: (map(.duration_ms) | add / 1000 | round)
  },
  suites: map({
    name: .suite,
    total: .total,
    passed: .passed,
    failed: .failed,
    pass_rate_pct: ((.passed / .total * 100) | round),
    duration_sec: (.duration_ms / 1000 | round)
  })
}' reports/*-report.json > reports/scorecard.json

# Generate HTML
npx claude plugin eval report \
  --config eval.config.json \
  --input "reports/*.json" \
  --output reports/scorecard.html

# Display summary
echo
echo "✅ Scorecard generated:"
echo "   JSON: reports/scorecard.json"
echo "   HTML: reports/scorecard.html"
echo
cat reports/scorecard.json | jq '.summary'
EOF

chmod +x plugin-eval/scripts/generate-scorecard.sh
```

**Run it:**

```bash
./plugin-eval/scripts/generate-scorecard.sh
```

---

## CI/CD Integration (GitHub Actions)

**Show scorecard in PR:**

```yaml
# .github/workflows/plugin-eval.yml (excerpt)
- name: Generate Scorecard
  run: |
    cd plugin-eval
    npx claude plugin eval report \
      --config eval.config.json \
      --input "reports/*.json" \
      --output reports/scorecard.html
    
    # Create PR comment
    jq -s '{
      total: map(.total) | add,
      passed: map(.passed) | add,
      failed: map(.failed) | add,
      pass_rate: "\(map(.passed) | add as $p | map(.total) | add as $t | $p / $t * 100 | round)%"
    }' reports/*.json > scorecard.json

- name: Comment with Scorecard
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const scorecard = JSON.parse(fs.readFileSync('scorecard.json'));
      const comment = `## 🧪 Plugin Eval Scorecard
      
      - ✅ Passed: ${scorecard.passed}
      - ❌ Failed: ${scorecard.failed}
      - 📊 Total: ${scorecard.total}
      - 📈 Pass Rate: ${scorecard.pass_rate}
      
      [View Full Report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})`;
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

---

## Dashboard/Monitoring

### Track Results Over Time

```bash
# Save scorecard with timestamp
cd plugin-eval/reports

timestamp=$(date +%Y%m%d-%H%M%S)
cp scorecard.json scorecard-$timestamp.json

# Compare with previous run
diff scorecard-20260921-143022.json scorecard-$timestamp.json
```

### Build Graph of Pass Rates

```bash
cd plugin-eval/reports

# Extract pass rates from all scorecards
jq -r '.summary.pass_rate_pct' scorecard-*.json | \
paste -d' ' <(ls -1 scorecard-*.json | sed 's/scorecard-//;s/.json//') - > pass-rate-history.txt

cat pass-rate-history.txt
# Output:
# 20260921-140000 100
# 20260921-141000 100
# 20260921-142000 95
```

---

## Summary

### Quickest Commands

| Want to... | Command |
|-----------|---------|
| See quick pass/fail | `jq -s '{Passed: map(.passed) | add, Total: map(.total) | add}' plugin-eval/reports/*.json` |
| View HTML report | `open plugin-eval/reports/SCORECARD.html` |
| Show pass rate | `jq -s 'map(.passed) | add as $p \| map(.total) | add as $t \| {Pass: "\($p/$t*100 \| round)%"}' plugin-eval/reports/*.json` |
| List failed tests | `jq -s '.[] \| .test_results[] \| select(.status == "failed")' plugin-eval/reports/*.json` |
| Performance summary | `jq -s '{Total: map(.duration_ms) | add, Sec: (map(.duration_ms) | add / 1000 \| round)}' plugin-eval/reports/*.json` |

### Best Practices

1. **Always run full suite before release:**
   ```bash
   npx claude plugin eval run --config eval.config.json
   ```

2. **Generate HTML report for stakeholders:**
   ```bash
   npx claude plugin eval report --config eval.config.json --input "reports/*.json" --output reports/SCORECARD.html
   ```

3. **Archive scorecards over time:**
   ```bash
   cp reports/scorecard.json reports/scorecard-$(date +%Y%m%d-%H%M%S).json
   ```

4. **Check in CI/CD:**
   ```bash
   # Fail if tests don't meet threshold
   pass_rate=$(jq -s 'map(.passed) | add as $p | map(.total) | add as $t | $p / $t * 100' reports/*.json)
   [ "$pass_rate" -ge 80 ] || exit 1
   ```

---

**Document Version:** 1.0.0
**Last Updated:** 2026-09-21
