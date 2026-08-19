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
  ├── Multi-Tenant Onboarding & Hospital Organizations
  ├── Global RBAC & Identity Lifecycle
  ├── Master Patient Index (MPI) Global Indexing
  ├── Hospital Consultation & Capacity Analytics
  └── ABDM / DPDP Compliance Ledger Surveillance
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`organizations`** | `tenancy` | All Tenants | Full Create, Suspend, Upgrade | Global Tenant Root |
| **`users`** | `identity` | All Platform Users| Full Global Provision, Disable | Global Identity Registry |
| **`mpi_audit_records`**| `patient` | All Tenants | Global Merge Audit Surveillance | Global Patient Identity Mapping |
| **`audit_logs`** | `audit` | All Platform Logs | Read-Only Cryptographic Ledger Inspection | WORM Immutable Audit Vault |

---

## 3. Platform Administration Mechanics

### A. Clinic & Hospital Onboarding (`/super-admin/organizations`)
- Onboard new hospital organizations and standalone clinics.
- Configure tenant isolation parameters, custom subdomains, and ABDM Health Facility Registry (HFR) IDs.
- Set tenant storage quotas and active subscription tiers.

### B. Global RBAC User Management (`/super-admin/users`)
- Platform-wide identity management across all tenant networks.
- Enforce enterprise security policies: Multi-Factor Authentication (MFA), password rotation, and emergency account lockouts.

### C. Master Patient Index (MPI) (`/super-admin/patients`)
- Cross-hospital patient matching and deduplication surveillance.
- Audit cross-tenant identity links and resolve identity conflicts.

### D. Consultation Schedule Analytics (`/super-admin/schedule-analytics`)
- High-level capacity analytics: Consultation load across medical specialties, peak clinic hours, and doctor utilization rates.

### E. ABDM & DPDP Compliance Ledger (`/super-admin/audit`)
- Surveillance of ABDM Health Information Exchange (HIE) consent directives.
- Cryptographically sequenced WORM audit logs of cross-enterprise data transfers.
