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

## 2. Organization Administrator Workflow Architecture

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

## 3. Dedicated Workspace Subpages

### A. Org Admin Command Center (`/organization-admin/dashboard`)
- Facility KPI overview: Active Inpatient Occupancy %, Daily Outpatient Volume, Scheduled Surgeries, and Staffing Levels.
- Real-time departmental throughput metrics.

### B. Facility Demographics & Settings (`/organization-admin/facility-settings`)
- Configure facility address, emergency contact numbers, operating departments, and licensing affiliations.
- Configure clinical specialties and active consultation room assignments.

### C. Facility Staff Roster & Credentialing (`/organization-admin/users`)
- Provision and manage hospital staff accounts: Physicians, Nurses, Lab Technicians, Pharmacists, Receptionists, and Billing Staff.
- Manage clinical credentials: State Medical Board Licenses, Specialist Registrations, and NPI / National Practitioner IDs.

### D. Master Patient Index (MPI) Governance (`/organization-admin/patients`)
- Review duplicate patient match candidates within the facility.
- Authorize or reject patient record merge requests submitted by receptionists.

### E. Facility Schedule Analytics (`/organization-admin/schedule-analytics`)
- Track clinic scheduling metrics: No-show rates, average waiting times, consultation durations, and room turnover efficiency.
