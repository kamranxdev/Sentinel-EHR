# Organization Administrator Facility Workspace Specification

## 1. Identity & Facility Governance Scope

```text
Person
  ↓
User (Role = ORGANIZATION_ADMIN)
  ↓
Organization Membership (Single Hospital / Network Boundary)
  ↓
Facility Governance Scope:
  ├── Facility Demographics & Clinical Operating Parameters
  ├── Facility Staff Roster & Practitioner Licensing
  ├── Spatial Ward, Room & Inpatient Bed Topology
  ├── Facility MPI Patient Deduplication Governance
  └── Departmental Consultation Schedule Analytics
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`facilities`** | `identity` | Facility Context | Full Update Settings | `organization_id` $\rightarrow$ `organizations.id` |
| **`departments`** | `identity` | Facility Context | Full Create & Update | `facility_id` $\rightarrow$ `facilities.id` |
| **`users`** | `identity` | Facility Staff | Full Provision, Edit, Reset Password | `organization_id` $\rightarrow$ `organizations.id` |
| **`practitioners`** | `identity` | Facility Clinicians | Full Credentialing (License #, Specialty) | `user_id` $\rightarrow$ `users.id` |
| **`wards`** | `spatial` / `adt` | Facility Wards | Full Create, Update Capacity | `department_id` $\rightarrow$ `departments.id` |
| **`rooms`** | `spatial` / `adt` | Facility Rooms | Full Create, Edit Types | `ward_id` $\rightarrow$ `wards.id` |
| **`beds`** | `spatial` / `adt` | Facility Beds | Full Provision, Maintenance Locks | `room_id` $\rightarrow$ `rooms.id`, `ward_id` $\rightarrow$ `wards.id` |
| **`mpi_audit_records`**| `patient` | Facility Records | Approve / Reject Merge Requests | `primary_patient_id` $\rightarrow$ `patients.id` |
| **`audit_logs`** | `audit` | Facility Logs | Read-Only Compliance Inspection | `organization_id` $\rightarrow$ `organizations.id` |

---

## 3. Organization Administrator Lifecycle & Architecture

```text
                         ORGANIZATION ADMIN
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
FACILITY SETTINGS         STAFF ROSTER & CREDENTIALS   OPERATIONAL ANALYTICS
       │                         │                         │
├── Campuses & Buildings  ├── Clinician Licensing   ├── Bed Occupancy Rates
├── Departments & Wards   ├── Role Assignments      ├── Schedule Bottlenecks
└── Operating Hours       └── Shift Rostering       └── Patient Volume Trends
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Org Admin Command Center (`/organization-admin/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/facilities/{id}/analytics` $\rightarrow$ Calculates Inpatient Bed Occupancy %, Daily Outpatient Volume, Scheduled Surgeries, and Active Clinical Staff.
   - `GET /api/v1/audit/logs/recent?limit=10` $\rightarrow$ Displays live security and administrative activity trail.
2. **Staff Provisioning Workflow**:
   - Admin fills user creation form $\rightarrow$ Executes `POST /api/v1/users` and `POST /api/v1/practitioners`.
   - **Downstream Event**: The clinician receives an activation email, and their profile is immediately available in the scheduling slot generator.

---

## 5. Dedicated Subpages & Facility Operations

### A. Facility Demographics & Settings (`/organization-admin/facility-settings`)
- Configure facility address, emergency contact numbers, operating departments, and licensing affiliations.
- Configure clinical specialties and active consultation room assignments.

### B. Facility Staff Roster & Credentialing (`/organization-admin/users`)
- Provision and manage hospital staff accounts: Physicians, Nurses, Lab Technicians, Pharmacists, Receptionists, and Billing Staff.
- Manage clinical credentials: State Medical Board Licenses, Specialist Registrations, and NPI / National Practitioner IDs.

### C. Spatial Ward & Bed Topology (`/organization-admin/beds`)
- Configure hospital campuses, buildings, departments, and wards.
- Provision rooms and individual inpatient spatial beds (`Bed 301A`, `Bed 301B`).
- Assign bed types (ICU, General, Negative Pressure, Telemetry).

### D. Master Patient Index (MPI) Governance (`/organization-admin/patients`)
- Review duplicate patient match candidates within the facility.
- Authorize or reject patient record merge requests submitted by receptionists.

### E. Facility Schedule Analytics (`/organization-admin/schedule-analytics`)
- Track clinic scheduling metrics: No-show rates, average waiting times, consultation durations, and room turnover efficiency.
