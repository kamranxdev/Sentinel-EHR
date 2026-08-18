# System & Organization Administrator Workspace Specification

## 1. Identity & Governance Scope

```text
Person
  ↓
User (Role = ORGANIZATION_ADMIN or SUPER_ADMIN)
  ↓
Organization Membership / Multi-Tenant Root
  ↓
Administrative Governance Scope:
  ├── Tenant & Facility Infrastructure
  ├── Spatial Ward, Room & Bed Configuration
  ├── User Accounts & Practitioner Licensing
  ├── RBAC & ABAC Policy Management
  └── Security Compliance, WORM Audit Logs & Break-Glass Inspection
```

---

## 2. Administrator Responsibilities & Architecture

```text
                             ADMINISTRATOR
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
ORGANIZATION SETUP          SPATIAL TOPOLOGY            SECURITY & AUDIT
       │                           │                           │
├── Organization Details    ├── Facilities / Buildings  ├── User Provisioning
├── ABDM / FHIR Gateway     ├── Clinical Departments    ├── Role & License Mgmt
└── Billing & Payers        ├── Wards & Rooms           ├── Break-Glass Audits
                            └── Inpatient Beds          └── WORM Audit Trail
```

---

## 3. Dedicated Workspace Subpages

### A. Administration Command Desk (`/admin/dashboard`)
- Executive system metrics: Total Active Users, Bed Occupancy %, System Throughput, and Security Incident Alerts.
- Multi-facility selector for network-wide oversight.

### B. User & Practitioner Management (`/admin/users`)
- User account creation, password resets, and role assignments (`PHYSICIAN`, `NURSE`, `LAB_TECHNICIAN`, `RECEPTIONIST`, etc.).
- Practitioner credentialing (License Number, Medical Specialty, Department Affiliation).

### C. Spatial Ward & Bed Topology (`/admin/beds`)
- Configure hospital campuses, buildings, departments, and wards.
- Provision rooms and individual inpatient spatial beds (`Bed 301A`, `Bed 301B`).
- Assign bed types (ICU, General, Negative Pressure, Telemetry).

### D. Security, WORM Audit & Break-Glass Inspection (`/admin/audit`)
- Real-time immutable **WORM Audit Trail** viewer with multi-attribute filtering (User, Patient, Action, IP, Time Range).
- **Emergency Break-Glass Audit Registry**:
  - Review all active and expired 4-hour emergency overrides.
  - Inspect requesting clinician, patient accessed, emergency category, and written clinical justification.
  - Export compliance audit reports for regulatory bodies (HIPAA, DPDP, NABH).
