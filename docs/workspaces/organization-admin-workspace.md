# Organization Administrator Hospital Workspace Specification

## 1. Identity & Hospital Governance Scope

```text
Person
  ↓
User (Role = ORGANIZATION_ADMIN)
  ↓
Organization Membership (Hospital / Clinic e.g. AIIMS Delhi, AIIMS Gorakhpur)
  ↓
Hospital Governance Scope:
  ├── Hospital Details, Address, Phone, Email & Timezone
  ├── Clinical Staff Roster & Practitioner Licensing
  ├── Spatial Ward, Room & Inpatient Bed Topology
  ├── Hospital MPI Patient Deduplication Governance
  └── Departmental Consultation Schedule Analytics
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`organizations`** | `tenancy` | Hospital Context | Full Update Settings | Root Tenant PK |
| **`departments`** | `tenancy` | Hospital Context | Full Create & Update | `organization_id` $\rightarrow$ `organizations.id` |
| **`users`** | `identity` | Hospital Staff | Full Provision, Edit, Reset Password | `organization_id` $\rightarrow$ `organizations.id` |
| **`practitioners`** | `identity` | Hospital Clinicians | Full Credentialing (License #, Specialty) | `user_id` $\rightarrow$ `users.id` |
| **`wards`** | `tenancy` | Hospital Wards | Full Create, Update Capacity | `organization_id` $\rightarrow$ `organizations.id`, `department_id` $\rightarrow$ `departments.id` |
| **`rooms`** | `tenancy` | Hospital Rooms | Full Create, Edit Types | `ward_id` $\rightarrow$ `wards.id` |
| **`beds`** | `tenancy` | Hospital Beds | Full Provision, Maintenance Locks | `room_id` $\rightarrow$ `rooms.id`, `ward_id` $\rightarrow$ `wards.id`, `organization_id` $\rightarrow$ `organizations.id` |
| **`mpi_audit_records`**| `patient` | Hospital Records | Approve / Reject Merge Requests | `primary_patient_id` $\rightarrow$ `patients.id` |
| **`audit_logs`** | `audit` | Hospital Logs | Read-Only Compliance Inspection | `organization_id` $\rightarrow$ `organizations.id` |

---

## 3. Organization Administrator Lifecycle & Architecture

```text
                         ORGANIZATION ADMIN
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
HOSPITAL SETTINGS         STAFF ROSTER & CREDENTIALS   OPERATIONAL ANALYTICS
       │                         │                         │
├── Profile, Address & TZ ├── Clinician Licensing   ├── Bed Occupancy Rates
├── Departments & Wards   ├── Role Assignments      ├── Schedule Bottlenecks
└── Operating Hours       └── Shift Rostering       └── Patient Volume Trends
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Org Admin Command Center (`/organization-admin/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/organizations/{id}` $\rightarrow$ Loads Hospital / Clinic profile, address, phone, email, and timezone.
   - `GET /api/v1/audit/logs?search=...` $\rightarrow$ Displays live security and administrative activity trail.
2. **Staff Provisioning Workflow**:
   - Admin fills user creation form $\rightarrow$ Executes `POST /api/v1/users` and `POST /api/v1/practitioners`.
   - **Downstream Event**: The clinician profile is immediately active and available for departmental scheduling.

---

## 5. Dedicated Subpages & Hospital Operations

### A. Hospital Profile & Spatial Layout (`/organization-admin/facility-settings`)
- Configure hospital identity, physical address, contact email/phone, timezone, operating departments, and wards.
- Configure clinical specialties and active consultation room assignments.

### B. Hospital Staff Roster & Credentialing (`/organization-admin/users`)
- Provision and manage hospital staff accounts: Physicians, Nurses, Lab Technicians, Pharmacists, Receptionists, and Billing Staff.
- Manage clinical credentials: State Medical Board Licenses, Specialist Registrations, and NPI / National Practitioner IDs.

### C. Spatial Ward & Bed Topology (`/organization-admin/beds`)
- Configure departments, wards, rooms, and individual inpatient spatial beds (`Bed 301A`, `Bed 301B`).
- Assign bed types (ICU, General, Negative Pressure, Telemetry).

### D. Master Patient Index (MPI) Governance (`/organization-admin/patients`)
- Review duplicate patient match candidates within the hospital.
- Authorize or reject patient record merge requests submitted by receptionists.

### E. Consultation Schedule Analytics (`/organization-admin/schedule-analytics`)
- Track clinic scheduling metrics: No-show rates, average waiting times, consultation durations, and room turnover efficiency.
