# Super Administrator Platform Workspace Specification

## 1. Identity & Multi-Tenant Governance Scope

```text
Person
  ↓
User (Role = SUPER_ADMIN)
  ↓
Global Platform Infrastructure Root
  ↓
Super Admin Governance Scope:
  ├── Multi-Tenant Onboarding & Hospital Networks
  ├── Global RBAC & Identity Lifecycle
  ├── Master Patient Index (MPI) Global Indexing
  ├── Facility Schedule & Capacity Analytics
  └── ABDM / DPDP Compliance Ledger Surveillance
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`organizations`** | `identity` | All Tenants | Full Create, Suspend, Upgrade | Global Tenant Root |
| **`facilities`** | `identity` | All Facilities | Full Create & Provision | `organization_id` $\rightarrow$ `organizations.id` |
| **`users`** | `identity` | All Platform Users| Full Global Provision, Disable | Global Identity Registry |
| **`mpi_audit_records`**| `patient` | All Tenants | Global Merge Audit Surveillance | Global Patient Identity Mapping |
| **`audit_logs`** | `audit` | All Platform Logs | Read-Only Cryptographic Ledger Inspection | WORM Immutable Audit Vault |
| **`patient_consents`** | `consent` | Global Directives | Read-Only ABDM Consent Registry | External Interoperability Layer |

---

## 3. Super Administrator Architecture & Lifecycle

```text
                           SUPER ADMINISTRATOR
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
TENANT ONBOARDING            GLOBAL RBAC & USERS          NETWORK SURVEILLANCE
       │                            │                            │
├── Hospital Networks        ├── Cross-Tenant RBAC        ├── Schedule Analytics
├── ABDM Gateway Config      ├── Global User Provisioning ├── Bed Allocation
└── Tenant Quotas & Payers   ├── MFA & Security Policies  └── WORM Compliance Ledger
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Super Admin Command Desk (`/super-admin/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/super-admin/network-summary` $\rightarrow$ Calculates Connected Hospital Networks, Active Campuses, Total Patients Registered, and Global API Throughput.
   - `GET /api/v1/super-admin/system-health` $\rightarrow$ Database connection latency, Redis cache hit ratio, and background worker queue depths.
2. **Tenant Onboarding Flow**:
   - Super Admin submits network onboarding form $\rightarrow$ Executes `POST /api/v1/organizations`.
   - **Downstream Event**: System provisions isolated tenant database RLS schema, registers ABDM HFR identifier, and provisions root Organization Admin account.

---

## 5. Dedicated Subpages & Platform Governance

### A. Clinic Onboarding & Network (`/super-admin/organizations`)
- Onboard new hospital networks and standalone medical facilities.
- Configure tenant isolation parameters, custom subdomains, and ABDM Health Facility Registry (HFR) IDs.
- Set tenant storage quotas and active subscription tiers.

### B. Global RBAC User Management (`/super-admin/users`)
- Platform-wide identity management across all tenant networks.
- Enforce enterprise security policies: Multi-Factor Authentication (MFA), password rotation, and emergency account lockouts.

### C. Master Patient Index (MPI) (`/super-admin/patients`)
- Cross-facility patient matching and deduplication surveillance.
- Audit cross-tenant identity links and resolve identity conflicts.

### D. Facility Schedule Analytics (`/super-admin/schedule-analytics`)
- High-level capacity analytics: Consultation load across medical specialties, peak clinic hours, and doctor utilization rates.

### E. ABDM & DPDP Compliance Ledger (`/auditor/ledger`)
- Surveillance of ABDM Health Information Exchange (HIE) consent directives.
- Cryptographically sequenced WORM audit logs of cross-enterprise data transfers.
