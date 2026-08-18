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

## 2. Super Administrator Architecture

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

## 3. Dedicated Workspace Subpages

### A. Super Admin Command Desk (`/super-admin/dashboard`)
- **Network Overview**: Total Active Hospital Networks, Connected Medical Campuses, Active Clinical Users, and System Throughput.
- **Global Health Pulse**: System uptime, database transaction health, and security event rate.

### B. Clinic Onboarding & Network (`/super-admin/organizations`)
- Onboard new hospital networks and standalone medical facilities.
- Configure tenant isolation parameters, custom subdomains, and ABDM Health Facility Registry (HFR) IDs.
- Provision organization root administrators.

### C. Global RBAC User Management (`/super-admin/users`)
- Platform-wide identity management across all tenant networks.
- Enforce enterprise security policies: Multi-Factor Authentication (MFA), password rotation, and emergency account lockouts.

### D. Master Patient Index (MPI) (`/super-admin/patients`)
- Cross-facility patient matching and deduplication surveillance.
- Audit cross-tenant identity links and resolve identity conflicts.

### E. Facility Schedule Analytics (`/super-admin/schedule-analytics`)
- High-level capacity analytics: Consultation load across medical specialties, peak clinic hours, and doctor utilization rates.

### F. ABDM & DPDP Compliance Ledger (`/auditor/ledger`)
- Surveillance of ABDM Health Information Exchange (HIE) consent directives.
- Cryptographically sequenced WORM audit logs of cross-enterprise data transfers.
