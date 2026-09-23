# Layer-Specific Plugin Testing Guide

Comprehensive guide to testing the plugin's understanding of each architecture layer.

---

## Overview

The AI-SSDLC project has **6 architecture layers**, and the plugin must accurately understand the security and compliance requirements of each:

```
Frontend (Angular 17)
    ↓
Backend (Spring Boot 3.2)
    ↓
Database (SQL Server 2022)
    ↓
Infrastructure (On-prem Ubuntu + Docker)
    ↓
Integration (WebClient + RabbitMQ)
    ↓
Security (Cross-cutting: Auth, Secrets, Encryption, Audit)
```

Each layer has distinct:
- **Technology stack**
- **Security controls**
- **Threat landscape**
- **Compliance requirements**
- **Integration points**

The plugin must understand all six to provide accurate threat models and compliance assessments.

---

## Test Suites

### Test Suite 1: Layer-Specific Threat Models
**File:** `suites/layer-threat-models.json`
**Purpose:** Validate plugin accurately identifies threats specific to each layer
**Test cases:** 7 (1 per layer + full system)
**Duration:** ~60 seconds

### Test Suite 2: Layer-Specific Compliance Assessments
**File:** `suites/layer-compliance-assessments.json`
**Purpose:** Validate plugin accurately assesses compliance per layer
**Test cases:** 10 (multiple frameworks + integrations)
**Duration:** ~90 seconds

---

## Architecture Layers & Test Coverage

### Layer 1: Frontend (Angular 17)

**Tech Stack:**
- Framework: Angular 17 (standalone components)
- UI: Angular Material 17
- State: NgRx for global state, Angular Signals for local
- Auth: HTTP interceptors + JWT bearer tokens
- Forms: Reactive Forms
- Testing: Jest + Angular Testing Library

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-frontend-001` | Client-side threats | XSS, CSRF, data exposure | STRIDE |
| `layer-frontend-nist` | NIST compliance | Access control, user authentication | NIST CSF 2.0 |
| `layer-frontend-backend-integration` | API boundary security | JWT validation, CORS, rate limiting | NIST |

**Key Security Controls:**
✅ Content Security Policy (CSP) headers
✅ HTTP-only cookies for session data
✅ No sensitive data in localStorage
✅ Input validation on all forms
✅ Route guards for access control
✅ CORS restrictions

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "Angular 17 frontend with NgRx state, HTTP interceptors, JWT tokens, CSP headers, reactive forms",
    "scope": "layer"
  },
  "expected_threats": [
    "XSS via unvalidated input",
    "CSRF attacks on state-changing operations",
    "Session hijacking via JWT token theft",
    "Sensitive data exposure in component memory"
  ]
}
```

---

### Layer 2: Backend (Spring Boot 3.2)

**Tech Stack:**
- Framework: Spring Boot 3.2
- Language: Java 21
- Security: Spring Security + JWT
- HTTP Client: Spring WebClient
- ORM: Hibernate
- Async: Spring Integration
- Resilience: Resilience4j
- Security tooling: Semgrep (SAST), OWASP Dependency-Check (SCA)

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-backend-001` | API threats | Auth bypass, privilege escalation, data tampering | STRIDE |
| `layer-backend-iso27001` | ISO 27001 compliance | Access control, audit logging, input validation | ISO 27001:2022 |
| `layer-backend-database-integration` | Database boundary | SQL injection prevention, encryption, audit | PCI-DSS |

**Key Security Controls:**
✅ Spring Security for authentication/authorization
✅ JWT token validation with expiration
✅ RBAC (Role-Based Access Control)
✅ Input validation on all endpoints
✅ Audit logging of security events
✅ Exception handling without exposing stack traces
✅ Dependency scanning in CI/CD
✅ SAST scanning for vulnerabilities

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "Spring Boot 3.2 API with Spring Security, JWT, RBAC, audit logging, Resilience4j rate limiting",
    "scope": "layer"
  },
  "expected_threats": [
    "JWT token validation bypass",
    "Privilege escalation via RBAC bypass",
    "Brute force attacks on authentication",
    "Unauthorized data access",
    "SQL injection (though mitigated by ORM)"
  ]
}
```

---

### Layer 3: Database (SQL Server 2022)

**Tech Stack:**
- Database: SQL Server 2022
- Encryption: Transparent Data Encryption (TDE)
- Access Control: Row-Level Security (RLS)
- Migrations: Flyway
- Connection: SSL/TLS

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-database-001` | Data threats | Data exposure, unauthorized modification, audit gaps | STRIDE |
| `layer-database-pci-dss` | PCI-DSS compliance | Encryption, access control, audit logging | PCI-DSS v4.0 |
| `layer-backend-database-integration` | Backend-DB boundary | SQL injection, connection security, data integrity | PCI-DSS |

**Key Security Controls:**
✅ Transparent Data Encryption (TDE)
✅ Column-level encryption for PII
✅ Row-Level Security (RLS) policies
✅ Audit logging on all access
✅ Parameterized queries (via ORM)
✅ Database role-based access control
✅ Encrypted connections (TLS)
✅ Change management via Flyway

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "SQL Server 2022 with TDE, column encryption, RLS, audit logging, parameterized queries",
    "scope": "layer"
  },
  "expected_threats": [
    "Data exposure at rest (mitigated by TDE)",
    "Unauthorized data access (mitigated by RLS)",
    "SQL injection (mitigated by parameterized queries)",
    "Audit trail tampering"
  ]
}
```

---

### Layer 4: Infrastructure (On-Prem Ubuntu, Docker, Nginx)

**Tech Stack:**
- OS: Ubuntu 22.04 LTS
- Containers: Docker
- Reverse Proxy: Nginx
- Logging: Loki
- Metrics: Prometheus + Grafana
- Alerting: Alertmanager
- Secrets: HashiCorp Vault

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-infrastructure-001` | Server/network threats | Privilege escalation, DoS, network compromise | STRIDE |
| `layer-infrastructure-dora` | DORA resilience | Incident response, backup/recovery, chaos testing | NIST/DORA |

**Key Security Controls:**
✅ Ubuntu hardened baseline
✅ Docker containers with read-only filesystems
✅ Nginx reverse proxy with TLS 1.3
✅ Centralized logging (Loki)
✅ Metrics/alerting (Prometheus/Grafana)
✅ Network segmentation via security groups
✅ Container orchestration with resource limits
✅ Automated backups and recovery
✅ Chaos engineering for resilience validation

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "Ubuntu 22.04 hardened servers, Docker with read-only FS, Nginx TLS 1.3, centralized logging, Prometheus monitoring, automated backups",
    "scope": "layer"
  },
  "expected_threats": [
    "Host OS privilege escalation",
    "Container escape attacks",
    "Denial of Service against reverse proxy",
    "Network-level data interception (mitigated by TLS)",
    "Logging infrastructure compromise"
  ]
}
```

---

### Layer 5: Integration (WebClient, RabbitMQ)

**Tech Stack:**
- HTTP: Spring WebClient
- Messaging: RabbitMQ
- Circuit Breaker: Resilience4j
- Credentials: HashiCorp Vault
- Event Schema: Versioned

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-integration-001` | External API threats | Data interception, API compromise, message tampering | STRIDE |
| `layer-integration-gdpr` | Data handling in integrations | PII exposure, retention policies, vendor compliance | GDPR |

**Key Security Controls:**
✅ Spring WebClient with timeout/retry policies
✅ Circuit breaker patterns (Resilience4j)
✅ Credentials in Vault (automatic rotation)
✅ Request/response encryption
✅ Event schema versioning
✅ No direct database writes from integration layer
✅ Message signing for RabbitMQ
✅ TLS 1.3 for all external calls

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "Spring WebClient with retry/timeout, RabbitMQ with message signing, third-party API credentials in Vault, request/response encryption",
    "scope": "layer"
  },
  "expected_threats": [
    "Credential exposure for third-party APIs",
    "Message tampering in RabbitMQ",
    "Man-in-the-middle attacks on API calls",
    "Cascading failures from external services"
  ]
}
```

---

### Layer 6: Security (Cross-Cutting)

**Tech Stack:**
- Auth: JWT with refresh token rotation
- Secrets: HashiCorp Vault
- Encryption: TLS 1.3, AES-256-GCM
- SAST: Semgrep
- SCA: OWASP Dependency-Check
- WAF: Nginx WAF rules

**Test Coverage:**

| Test ID | Focus | Threats Tested | Frameworks |
|---------|-------|----------------|------------|
| `layer-security-001` | Cross-cutting controls | Auth bypass, key exposure, audit bypass | STRIDE |
| `layer-security-cross-cutting` | All security controls | Multi-framework compliance | ISO 27001 |

**Key Security Controls:**
✅ JWT authentication with expiration
✅ Refresh token rotation
✅ Vault for all secrets
✅ TLS 1.3 for all communication
✅ AES-256-GCM for sensitive data
✅ Comprehensive audit logging
✅ OWASP Top 10 input validation
✅ Security headers (CSP, HSTS, X-Frame-Options)
✅ Rate limiting and DDoS protection
✅ SAST/SCA in CI/CD
✅ Annual penetration testing

**Sample Plugin Validation:**
```json
{
  "input": {
    "system_description": "JWT auth with rotation, Vault secrets, TLS 1.3, AES-256-GCM encryption, OWASP validation, WAF, SAST/SCA, pen testing",
    "scope": "layer"
  },
  "expected_threats": [
    "JWT token compromise or replay attack",
    "Vault credentials exposure",
    "Encryption key compromise",
    "Audit log tampering"
  ]
}
```

---

## Integration Boundaries

The plugin must also understand how layers interact:

### Frontend ↔ Backend
- **Interface:** HTTP/REST with JWT authorization
- **Threats:** JWT validation bypass, CORS misconfiguration, session hijacking
- **Test:** `layer-frontend-backend-integration`

### Backend ↔ Database
- **Interface:** JDBC with parameterized queries
- **Threats:** SQL injection, connection compromise, unauthorized access
- **Test:** `layer-backend-database-integration`

### Backend ↔ Integration
- **Interface:** REST calls with circuit breaker, message queue
- **Threats:** Cascading failures, credential exposure, message tampering
- **Test:** `layer-integration-001`

### All Layers ↔ Security Layer
- **Interface:** Applied consistently across all layers
- **Threats:** Misconfiguration, bypass, compromise
- **Test:** `layer-security-cross-cutting`

---

## Running Layer-Specific Tests

### Run all layer tests
```bash
cd /Users/erwin.t.bainto/ai_projects/ai-ssdlc/plugin-eval
npx claude plugin eval run --config eval.config.json --suite suites/layer-threat-models.json
npx claude plugin eval run --config eval.config.json --suite suites/layer-compliance-assessments.json
```

### Run specific layer test
```bash
# Frontend threats only
npx claude plugin eval run --config eval.config.json --suite suites/layer-threat-models.json --test layer-frontend-001

# Backend compliance only
npx claude plugin eval run --config eval.config.json --suite suites/layer-compliance-assessments.json --test layer-backend-iso27001
```

### Run full system test
```bash
# Full system integration test
npx claude plugin eval run --config eval.config.json --suite suites/layer-threat-models.json --test layer-full-system-001
npx claude plugin eval run --config eval.config.json --suite suites/layer-compliance-assessments.json --test layer-full-system-multi-framework
```

---

## Interpreting Results

### Success Criteria

Each layer test passes if the plugin:
1. **Identifies threats specific to that layer's tech stack**
2. **Covers all STRIDE categories** relevant to the layer
3. **Provides layer-appropriate mitigations**
4. **Assesses compliance against frameworks** applicable to that layer
5. **Understands integration points** with adjacent layers

### Example: Frontend Layer Test Result

```json
{
  "id": "layer-frontend-001",
  "status": "passed",
  "assertions": [
    {
      "path": "$.threats",
      "operator": "length_gte",
      "value": 4,
      "actual": 5,
      "result": "passed"
    },
    {
      "path": "$.threats[*].category",
      "operator": "contains_all",
      "value": ["Tampering", "Information_Disclosure"],
      "actual": ["Tampering", "Information_Disclosure", "Spoofing"],
      "result": "passed"
    }
  ],
  "duration_ms": 3456
}
```

### Example: Backend Compliance Test Result

```json
{
  "id": "layer-backend-iso27001",
  "status": "passed",
  "compliance_percentage": 78,
  "identified_controls": [
    { "id": "A.5.1", "name": "Access Control Policies", "status": "compliant" },
    { "id": "A.8.29", "name": "Application Security", "status": "compliant" },
    { "id": "A.12.4", "name": "Logging", "status": "compliant" }
  ],
  "gaps": [
    { "control": "A.6.1", "reason": "Key staff dependencies identified" }
  ]
}
```

---

## Extending Layer Tests

### Add a new layer test

1. **Identify the layer's unique threats**
   ```json
   {
     "id": "layer-newlayer-001",
     "name": "New layer - specific threat focus",
     "tool": "threat_model_generator",
     "input": {
       "system_description": "Technology stack specific to this layer",
       "scope": "layer"
     },
     "assertions": [
       {
         "path": "$.threats[*].category",
         "operator": "contains",
         "value": "CategoryRelevantToThisLayer"
       }
     ]
   }
   ```

2. **Add to appropriate suite** (threat-models or compliance-assessments)

3. **Run validation**
   ```bash
   npx claude plugin eval run --config eval.config.json --suite suites/layer-threat-models.json
   ```

### Add a new integration boundary test

```json
{
  "id": "layer-newlayer-existinglayer-integration",
  "name": "New layer ↔ Existing layer - boundary security",
  "tool": "threat_model_generator",
  "input": {
    "system_description": "Data flows between layers, authentication mechanism, error handling",
    "scope": "component"
  }
}
```

---

## Best Practices

### Test Data Organization

Store layer-specific test data in `fixtures/`:

```
fixtures/
├── architectures/
│   ├── frontend-angular-17.md
│   ├── backend-spring-boot-3.2.md
│   ├── database-sql-server-2022.md
│   ├── infrastructure-ubuntu-docker.md
│   └── integration-webClient-rabbitmq.md
├── responses/
│   ├── frontend-threats.json
│   ├── backend-threats.json
│   └── iso27001-compliance.json
└── edge-cases/
    ├── minimal-security.md
    └── enhanced-security.md
```

Then reference:
```json
"input": { "@fixture": "fixtures/architectures/backend-spring-boot-3.2.md" }
```

### Test Maintenance

- **Update tests when tech stack changes** (e.g., Angular 17 → 18)
- **Add tests for new security controls** immediately after implementation
- **Review test results quarterly** to ensure plugin accuracy remains high
- **Document layer-specific assumptions** in test descriptions

---

## Integration with SSDLC Workflow

These tests validate the plugin's capability at key SSDLC phases:

```
Phase 2 (Threat Modeling)
    ↓ Uses: layer-threat-models.json
    ↓ Validates: Plugin threat model accuracy per layer
    ↓
Phase 4 (Design)
    ↓ Uses: Plugin to assess design against threats
    ↓ Validates: Design addresses layer-specific threats
    ↓
Phase 5 (Dev Standards)
    ↓ Uses: layer-compliance-assessments.json in CI/CD
    ↓ Validates: Implementation maintains compliance per layer
    ↓
Phase 7 (Release)
    ↓ Uses: layer-threat-models.json final validation
    ↓ Validates: All layers meet threat/compliance thresholds
```

---

## Troubleshooting

### Test fails: "Plugin doesn't understand layer"

**Symptom:** Test expects X threats/controls but gets Y

**Cause:** Plugin output format or coverage mismatch

**Solution:**
1. Check plugin output format matches test assertions
2. Review STRIDE categories expected for this layer
3. Verify layer description matches test input schema

### Test times out

**Symptom:** `TIMEOUT: Test exceeded 15000ms`

**Cause:** Plugin generation is slow

**Solution:**
1. Increase timeout in test case: `"timeout": 30000`
2. Profile plugin performance
3. Simplify layer description if possible

### Integration test fails but individual tests pass

**Symptom:** `layer-frontend-001` passes but `layer-frontend-backend-integration` fails

**Cause:** Plugin misses cross-layer threats

**Solution:**
1. Ensure test describes actual integration point
2. Review test assertions for integration-specific threats
3. Update plugin if needed to understand layer interactions

---

## Next Steps

1. **Run the layer test suites:**
   ```bash
   npx claude plugin eval run --config eval.config.json --suite suites/layer-threat-models.json
   npx claude plugin eval run --config eval.config.json --suite suites/layer-compliance-assessments.json
   ```

2. **Review results:** Check `reports/` folder for pass/fail details

3. **Add custom tests:** Create tests specific to your domain or security policies

4. **Integrate with CI/CD:** Layer tests run automatically on every commit

5. **Monitor over time:** Track plugin accuracy as the system evolves

---

**Document version:** 1.0.0
**Last updated:** 2026-09-21
**Tech stack reference:** AI-SSDLC template v1.0
