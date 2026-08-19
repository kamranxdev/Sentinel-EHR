# System Architecture Specification

## 1. Executive Architectural Overview

Sentinel-EHR is designed as a high-throughput, horizontally scalable, multi-tenant Electronic Health Record (EHR) and Hospital Information System (HIS). It employs a layered service architecture with strong tenant data isolation, fine-grained Attribute-Based Access Control (ABAC), PostgreSQL Row-Level Security (RLS), and native interoperability with **HL7 FHIR R4** and **ABDM (Ayushman Bharat Digital Mission)**.

```text
                                  CLIENT TIER
  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
  │ Physician Desk  │  Nurse Station  │ Lab Technician  │ Front-Desk Desk │
  │ (Angular 19)    │  (Angular 19)   │ (Angular 19)    │ (Angular 19)    │
  └────────┬────────┴────────┬────────┴────────┬────────┴────────┬────────┘
           │                 │                 │                 │
           └─────────────────┼─────────────────┼─────────────────┘
                             │ HTTPS / REST / WSS
                             ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │                    GATEWAY & SECURITY ENFORCEMENT                     │
  │  • JWT Verification (RS256)                                           │
  │  • Multi-Tenancy Scoping (X-Tenant-ID / OrganizationContextHolder)    │
  │  • Rate Limiting & DoS Protection                                     │
  │  • WORM Audit Logging Interceptor (SentinelAuditInterceptor)          │
  └──────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │                       CORE APPLICATION SERVICES                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ Identity & Access (RBAC + ABAC + Break-Glass Leases)            │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Patient Identity & MPI Deduplication Engine                     │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Clinical Core (Encounters, Vitals, Flowsheets, Diagnoses, Notes)│  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Spatial Bed & ADT Management (Wards, Rooms, Spatial Beds)       │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Pharmacy & eMAR (eRx, 5-Rights Verification, DDI Drug Safety)   │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Laboratory Information System (LIS Accessioning, Analyzers)     │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Billing, Invoicing & Insurance Claims Engine                    │  │
  │  ├─────────────────────────────────────────────────────────────────┤  │
  │  │ Interoperability Layer (FHIR R4 Bundles & ABDM ABHA Exchange)   │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │                          DATA PERSISTENCE                             │
  │  • PostgreSQL 16 with Row-Level Security (tenant_id & org isolation)   │
  │  • Temporal Audit Logs & Break-Glass Registry                         │
  │  • Redis 7 for Session Caching & Real-time Bed Locks                  │
  │  • S3-Compatible Object Store for Diagnostic Imaging & PDFs           │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tenancy & Organization Hierarchy

Sentinel-EHR partitions data at the root organization level. Every entity is bound to an `organization_id` which is verified by both application middleware and database policies.

```text
Organization (Hospital / Clinic e.g. AIIMS Delhi, AIIMS Gorakhpur)
  │
  └── Department (e.g. Cardiology, Internal Medicine, Radiology)
        │
        └── Ward / Section (e.g. Ward 3A, ICU Step-Down)
              │
              └── Room (e.g. Room 301, Room 302)
                    │
                    └── Spatial Bed (e.g. Bed 301A, Bed 301B)
```

---

## 3. Dual Authorization Model: RBAC + ABAC

### A. Role-Based Access Control (RBAC)
RBAC defines **what operations** a user's role is allowed to perform system-wide:

| Role | Permitted Actions | Prohibited Actions |
| :--- | :--- | :--- |
| **PHYSICIAN** | Record diagnosis, order eRx, order labs, create clinical notes, discharge patients | Finalize lab results, process payments, edit role permissions |
| **NURSE** | Record bedside vitals, triage queue, administer eMAR meds, record I/O balance, SBAR notes | Write diagnosis, prescribe medications, finalize lab results |
| **LAB_TECHNICIAN** | Collect specimens, accession barcodes, enter lab test values, validate results | Prescribe medications, view billing accounts, edit diagnoses |
| **RECEPTIONIST** | Register patient identity, MPI search & merge, schedule appointments, OPD check-in | Access clinical charts, view medical notes, view lab values |
| **ORGANIZATION_ADMIN** | Manage users, configure wards/beds, view audit trails, view billing | Edit patient charts directly, write medical prescriptions |

### B. Attribute-Based Access Control (ABAC)
ABAC restricts access to specific records based on runtime context:

```text
Decision = RBAC_Allowed(Role, Action)
        && (
             HasDirectPatientAssignment(User, Patient)
          || HasActiveEncounter(User, Encounter)
          || HasWardShiftAssignment(User, Ward, Shift)
          || HasActiveBreakGlassLease(User, Patient)
        )
```

---

## 4. Emergency Break-Glass Architecture

When an unassigned clinician encounters an emergency:

```text
Clinician Requests Access -> Selects Emergency Reason -> Enters Justification -> System Grants 4-Hour Lease -> WORM Audit Log Triggered -> Alerts Security Officers
```

1. **Lease Duration**: Exactly 4 hours (`expires_at = now() + interval '4 hours'`).
2. **Immutable Audit Record**: Logged to `break_glass_records` and `audit_logs` with client IP, timestamp, user ID, patient ID, and clinical justification.
3. **Post-Lease Expiry**: Access automatically reverts to default scoping; subsequent access requires a fresh justified lease or standard assignment.
