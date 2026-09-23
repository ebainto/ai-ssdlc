# Encryption Policy
# [System name] | Version: v1 | Date: [YYYY-MM-DD]
# Owner: Security Engineer / Security Architect
# Status: Draft | Approved | Superseded

> **How to use this template:**
> Fill in the approved algorithms and key lengths for your project. Every rule must reference the compliance control that requires it. Delete this notice when approved.


> **Two rules that must stay in step with the configuration that implements
> them.** A permitted-suite list naming only TLS 1.3 suites while the minimum
> version is 1.2 forbids every suite a 1.2 client can actually negotiate — the
> policy and the server config then disagree by construction. Likewise, "mTLS
> for all service-to-service calls" is unachievable for a reverse proxy talking
> to an app container on the same host, so it gets quietly ignored, which is
> worse than a narrower rule that is actually enforced. If you change the
> minimum version or the topology, revisit both rows.

---

## Purpose

This policy defines the minimum encryption standards for [system name] — covering data in transit, data at rest, key management, and prohibited algorithms. All layers must align to these standards. Layer-specific implementation is documented in each layer's `CLAUDE.md` Security Architecture section.

---

## Data in Transit

| Requirement | Standard | Control ref |
|---|---|---|
| Minimum TLS version | TLS 1.2 — TLS 1.0 and 1.1 disabled | ASVS V9.1.1 |
| Preferred TLS version | TLS 1.3 where supported | ASVS V9.1.1 |
| Certificate authority | [Internal CA / Let's Encrypt / DigiCert — specify] | ASVS V9.2.1 |
| Certificate minimum key length | RSA 2048-bit minimum; RSA 4096-bit preferred | ASVS V9.1.2 |
| Cipher suites — permitted (TLS 1.3) | `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`, `TLS_AES_128_GCM_SHA256` | ASVS V9.1.3 |
| Cipher suites — permitted (TLS 1.2) | `ECDHE-ECDSA-AES256-GCM-SHA384`, `ECDHE-RSA-AES256-GCM-SHA384`, `ECDHE-ECDSA-AES128-GCM-SHA256`, `ECDHE-RSA-AES128-GCM-SHA256` | ASVS V9.1.3 |
| Cipher suites — prohibited | RC4, 3DES, NULL, EXPORT ciphers | ASVS V9.1.3 |
| Internal service-to-service — crossing a host or trust boundary | mTLS required | ASVS V9.2.2 |
| Internal service-to-service — same host, private container network | TLS or plain HTTP permitted, provided the hop cannot leave the host and the exception is recorded in that layer's `CLAUDE.md` | ASVS V9.2.2 |

---

## Data at Rest

| Data classification | Encryption requirement | Algorithm | Key management | Control ref |
|---|---|---|---|---|
| PII — Confidential | Encrypted at column level | AES-256 (Always Encrypted / AES-GCM) | HashiCorp Vault | ASVS V6.2.1 / GDPR Art 32 |
| Financial — Confidential | Encrypted at column level | AES-256 | HashiCorp Vault | PCI Req 3.4 |
| Internal | Encrypted at rest via disk/volume encryption | AES-256 (platform managed) | Platform key store | ISO A.10.1 |
| Database backups | Encrypted before storage | AES-256 | Vault or KMS | ISO A.12.3 |
| Log files | No encryption required; PII must not appear in logs | — | — | GDPR Art 32 |

---

## Hashing and Key Derivation

| Use case | Approved algorithm | Prohibited | Control ref |
|---|---|---|---|
| Password hashing | bcrypt (cost ≥ 12) or Argon2id | MD5, SHA-1, SHA-256 for passwords | ASVS V2.4.1 |
| Digital signatures | RSA-PSS (2048-bit min) or ECDSA (P-256 min) | RSA PKCS#1 v1.5 | ASVS V6.2.5 |
| General hashing / integrity | SHA-256 minimum | MD5, SHA-1 | ASVS V6.2.2 |
| Key derivation | PBKDF2 (100,000+ iterations), bcrypt, or Argon2 | Custom key derivation | ASVS V6.2.3 |
| Random number generation | Cryptographically secure PRNG (platform-provided) | Math.random(), java.util.Random | ASVS V6.3.1 |

---

## Key Management

| Requirement | Standard | Control ref |
|---|---|---|
| Key storage | HashiCorp Vault — no static keys in config files or environment variables | ASVS V6.4.1 / ISO A.10.1 |
| Key rotation | Encryption keys rotated every [90 / 180 / 365 days — specify] | ASVS V6.4.2 |
| Key access | Least privilege — services access only the keys they need via Vault policies | ASVS V6.4.1 |
| Compromised key procedure | Revoke immediately via Vault, rotate all encrypted data, notify security lead | ISO A.10.1 |
| Key backup | Vault HA with encrypted Raft snapshots — no key export to plaintext | ISO A.12.3 |

---

## Prohibited Algorithms

The following must never be used for any cryptographic purpose in this project:

| Algorithm | Reason |
|---|---|
| MD5 | Collision attacks — not cryptographically secure |
| SHA-1 | Deprecated — collision attacks demonstrated |
| DES / 3DES | Insufficient key length; SWEET32 vulnerability |
| RC4 | Multiple vulnerabilities; prohibited by RFC 7465 |
| RSA with key length < 2048-bit | Insufficient for current threat landscape |
| HS256 JWT signing | Shared secret — use RS256 asymmetric signing instead |

---

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
| v1 | [YYYY-MM-DD] | Initial draft | [Name / Role] |
