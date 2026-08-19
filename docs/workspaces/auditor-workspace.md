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

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`audit_logs`** | `audit` | All Platform Logs | **NONE** (WORM Immutable) | Cryptographically Sequenced Ledger |
| **`break_glass_records`**| `consent` | All Emergency Leases | **NONE** (Surveillance Only) | `user_id` $\rightarrow$ `users.id`, `patient_id` $\rightarrow$ `patients.id` |
| **`mpi_audit_records`**| `patient` | All Merge Logs | **NONE** (Forensic Inspection) | `primary_patient_id` $\rightarrow$ `patients.id` |
| **`patient_consents`** | `consent` | All Directives | **NONE** (Consent Compliance Review) | `patient_id` $\rightarrow$ `patients.id` |
| **`clinical_documents`**| `clinical` | **DENIED** (Without Audit Mandate) | **DENIED** | Patient privacy protection |

---

## 3. Security Surveillance Lifecycle

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

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Auditor Command Center (`/auditor/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/audit/metrics/24h` $\rightarrow$ Total Audit Events, Emergency Break-Glass Overrides Count, Failed Authorization Attempts, and High-Risk Data Access Patterns.
   - `GET /api/v1/security/break-glass/recent` $\rightarrow$ Displays recent emergency overrides requiring medical justification review.
2. **Forensic Audit Flow**:
   - Auditor investigates suspicious access by filtering logs by Patient MRN and Clinician User ID.
   - Generates tamper-evident cryptographic verification report for regulatory bodies (HIPAA, DPDP).

---

## 5. Dedicated Subpages & Compliance Operations

### A. WORM Audit Trail Inspector (`/auditor/logs`)
- Searchable and exportable audit trail with cryptographically sequenced records.
- Inspect exact user identity, IP address, user agent, action type, resource affected, and outcome (`SUCCESS` / `DENIED`).

### B. Break-Glass Emergency Override Registry (`/auditor/break-glass`)
- Comprehensive audit of all 4-hour emergency overrides executed across the organization.
- Review clinician name, patient MRN, emergency category, and written clinical rationale.
- Flag non-compliant overrides for administrative and medical board disciplinary review.

### C. Regulatory Compliance Export (`/auditor/ledger`)
- Generate compliant audit bundles for NABH, HIPAA, and DPDP regulatory inspections.
