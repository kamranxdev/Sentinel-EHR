# Compliance & Security Auditor Workspace Specification

## 1. Identity & Compliance Scope

```text
Person
  ↓
User (Role = AUDITOR or COMPLIANCE_OFFICER)
  ↓
Organization Membership
  ↓
Department = Clinical Quality, Legal & Information Security
  ↓
Auditing Scope:
  ├── Read-Only Inspection of Immutable WORM Audit Logs
  ├── Emergency Break-Glass Override Surveillance
  ├── MPI Merge Request Reviews & Forensic Audits
  └── Regulatory Compliance Reporting (HIPAA, DPDP, NABH, ISO 27001)
```

---

## 2. Security Surveillance Lifecycle

```text
Every System Action (Read, Write, Update, Delete, Export, Break-Glass)
  │
  ▼
Sentinel Audit Interceptor & AOP Logger
  │
  ▼
Immutable WORM Audit Trail (`audit_logs`)
  │
  ├── 1. Automated Real-Time Anomaly Detection (e.g. VIP record access, bulk exports)
  │
  ├── 2. Compliance Auditor Review (`/auditor/dashboard`)
  │     ├── Filter by User, Patient, Action, IP, Time Range
  │     └── Review Break-Glass Emergency Justifications
  │
  └── 3. Incident Investigation & Compliance Export
```

---

## 3. Dedicated Workspace Subpages

### A. Auditor Command Center (`/auditor/dashboard`)
- Security metrics: Total Audit Events (24h), Break-Glass Overrides Count, Failed Authorization Attempts, and High-Risk Data Access Patterns.

### B. WORM Audit Trail Inspector (`/auditor/logs`)
- Searchable and exportable audit trail with cryptographically sequenced records.
- Inspect exact user identity, IP address, user agent, action type, resource affected, and outcome (`SUCCESS` / `DENIED`).

### C. Break-Glass Emergency Override Registry (`/auditor/break-glass`)
- Comprehensive audit of all 4-hour emergency overrides executed across the organization.
- Review clinician name, patient MRN, emergency category, and written clinical rationale.
- Flag non-compliant overrides for administrative and medical board review.
