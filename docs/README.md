# Sentinel-EHR Enterprise Documentation

Welcome to the comprehensive technical and operational documentation for **Sentinel-EHR**, a modern, multi-tenant, FHIR R4-aligned, enterprise-grade Electronic Health Record (EHR) and Hospital Information System (HIS).

---

## 📚 Documentation Structure

### 1. Architecture & Data Model
- [**System Architecture Specification**](./architecture/system-architecture.md)
  - Multi-tenant cloud architecture, PostgreSQL Row-Level Security (RLS), RBAC/ABAC authorization engine, FHIR R4 & ABDM interoperability layer.
- [**Database Schema & Entities Specification**](./architecture/database-schema-entities.md)
  - Full relational schema specifications covering Identity, Tenancy, Spatial ADT Beds, Encounters, Clinical Observations, Pharmacy & eMAR, Laboratory & Accessioning, Imaging, Billing, and WORM Auditing.
- [**Backend Domain Packages & Architecture**](./architecture/backend-packages-architecture.md)
  - Deep-dive into backend domain packages (`identity`, `security`, `patient`, `scheduling`, `clinical`, `pharmacy`, `laboratory`, `billing`, `consent`, `audit`, `abdm`), request lifecycles, and cross-package data flows.

### 2. API & Security
- [**REST API Endpoint Specification**](./api/rest-api-specification.md)
  - Comprehensive API catalog with path schemas, request/response models, JWT authentication, and error codes.
- [**Access Control, ABAC & Emergency Break-Glass**](./security/access-control-abac-break-glass.md)
  - Scoping principles (`ROLE ≠ UNRESTRICTED ACCESS`), encounter & assignment-based authorization, 4-hour emergency break-glass leases, and WORM compliance auditing.

### 3. Role-Based Workspaces (`/docs/workspaces`)
- [**Workspaces Master Index**](./workspaces/README.md)
- [**Physician Workspace**](./workspaces/physician-workspace.md)
  - Attending & Consultant rounds, outpatient queues, bedside EHR charting, e-Prescribing with safety checks, and emergency patient access.
- [**Nurse Station Workspace**](./workspaces/nurse-workspace.md)
  - Shift management, ward-scoped patient assignments, outpatient/ER triage intake, bedside vitals, 5-Rights eMAR administration, I/O fluid balance, and SBAR shift handoffs.
- [**Laboratory Technician Workspace**](./workspaces/lab-technician-workspace.md)
  - End-to-end specimen collection, accessioning, barcode tracking, analyzer processing, result validation, and critical alert routing.
- [**Receptionist & Front-Desk Workspace**](./workspaces/receptionist-workspace.md)
  - Patient registration, Master Patient Index (MPI) deduplication, appointment scheduling, and OPD arrival check-in.
- [**Organization Administrator Workspace**](./workspaces/organization-admin-workspace.md)
  - Hospital profile & details, clinical staff roster & credentialing, spatial ward & bed topology provisioning, MPI duplicate governance, and consultation schedule analytics.
- [**Super Administrator Platform Workspace**](./workspaces/super-admin-workspace.md)
  - Multi-tenant hospital network onboarding, global cross-tenant RBAC, network-wide MPI indexing, platform analytics, and ABDM/DPDP compliance ledger.
- [**Pharmacist Clinical Workspace**](./workspaces/pharmacist-workspace.md)
  - eRx clinical review, unit-dose dispensing, drug-drug interaction alerts, and formulary inventory.
- [**Billing & Revenue Cycle Workspace**](./workspaces/billing-workspace.md)
  - Itemized invoicing, insurance claims adjudication, fee schedules, and payment processing.
- [**Auditor & Compliance Workspace**](./workspaces/auditor-workspace.md)
  - Cryptographically sequenced WORM audit logs and emergency break-glass override surveillance.
- [**Patient Self-Service Portal**](./workspaces/patient-workspace.md)
  - Patient self-registration, timeline history, lab result access, active prescriptions, and consent management.

---

## 🛡️ Core Architectural Principles

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        SENTINEL-EHR CORE PRINCIPLES                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. PRINCIPLE OF LEAST PRIVILEGE                                         │
│    Having a role (PHYSICIAN, NURSE) does NOT grant access to all        │
│    patients. Access is derived from active care relationships,          │
│    encounters, ward assignments, and shifts.                            │
│                                                                         │
│ 2. DUAL RBAC + ABAC AUTHORIZATION                                       │
│    RBAC defines functional actions (Can user write vitals?);            │
│    ABAC enforces contextual scoping (Is patient assigned to this unit?).│
│                                                                         │
│ 3. IMMUTABLE WORM AUDITING                                              │
│    Every clinical read, write, and emergency override generates an      │
│    immutable Write-Once-Read-Many audit log with IP and timestamp.      │
│                                                                         │
│ 4. STANDARDS-BASED INTEROPERABILITY                                     │
│    Fully mapped to HL7 FHIR R4 resources and ABDM (Ayushman Bharat      │
│    Digital Mission) schemas for nationwide digital health exchanges.    │
└─────────────────────────────────────────────────────────────────────────┘
```
