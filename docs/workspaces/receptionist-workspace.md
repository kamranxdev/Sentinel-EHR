# Receptionist & Front-Desk Workspace Specification

## 1. Identity & Administrative Scope

```text
Person
  ↓
User (Role = RECEPTIONIST)
  ↓
Organization Membership (Hospital / Clinic)
  ↓
Hospital Front-Desk Reception
  ↓
Administrative Scope:
  ├── Patient Demographic Registration (New MRN issuance)
  ├── Master Patient Index (MPI) Search & Deduplication
  ├── Appointment Booking & Scheduling
  └── OPD Arrival Check-in & Queue Routing
```

> [!IMPORTANT]
> **RECEPTIONIST DOES NOT HAVE ACCESS TO CLINICAL EHR CHARTS**
> Receptionists manage demographics, MPI identity, and appointment scheduling. They cannot read or write medical diagnoses, physician clinical notes, or laboratory test results.

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`patients`** | `patient` | All Org Patients | Full Create & Update Demographics | `organization_id` $\rightarrow$ `organizations.id` |
| **`patient_demographics`**| `patient` | All Org Patients | Full Create & Update | `patient_id` $\rightarrow$ `patients.id` |
| **`patient_contacts`** | `patient` | All Org Patients | Full Create & Update | `patient_id` $\rightarrow$ `patients.id` |
| **`appointments`** | `scheduling` | Hospital Roster | Full Create, Reschedule, Check-in (`CHECKED_IN`) | `patient_id` $\rightarrow$ `patients.id`, `doctorId` $\rightarrow$ `users.id`, `organization_id` $\rightarrow$ `organizations.id` |
| **`mpi_audit_records`**| `patient` | Hospital Records | Create Merge Requests (with justification) | `primary_patient_id` $\rightarrow$ `patients.id`, `duplicate_patient_id` $\rightarrow$ `patients.id` |
| **`clinical_documents`**| `clinical` | **DENIED** | **DENIED** | Clinical confidentiality protection |

---

## 3. Front-Desk Patient Intake Lifecycle

```text
Patient Arrives at Hospital Front-Desk
  │
  ├── 1. Existing Patient?
  │     ├── YES -> Search MPI by Name / Phone / National ID / ABHA
  │     └── NO  -> Register New Patient Profile (Issues unique MRN)
  │
  ├── 2. Appointment Status:
  │     ├── Pre-Booked -> Verify details & perform Check-in (`CHECKED_IN`)
  │     └── Walk-in    -> Book appointment with available specialty/doctor
  │
  ├── 3. Insurance & Eligibility Verification (Payer card, copay, policy ID)
  │
  └── 4. Route to Nursing Triage Station (Appears in Nurse Triage Queue)
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Reception Command Center (`/receptionist/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/appointments/today` $\rightarrow$ Calculates Today's Total Appointments, Checked-In Count, and Pending Arrivals.
   - `GET /api/v1/appointments/waiting-room` $\rightarrow$ Displays live waiting room occupancy across outpatient departments.
2. **Patient Arrival & Check-In Trigger**:
   - Receptionist searches patient by name or scans barcode/ABHA card.
   - Clicking **Check-In** calls `POST /api/v1/appointments/{id}/check-in`, updating status to `CHECKED_IN` and recording `arrivedAt = now()`.
   - **Downstream Event**: The patient instantly appears in the Nurse's **Outpatient Appointments & Triage** workstation under `Ready for Nurse Triage`.

---

## 5. Dedicated Subpages & Front-Desk Operations

### A. Master Patient Index (MPI) Search & Deduplication (`/receptionist/mpi`)
- Multi-field fuzzy matching (Legal Name, DOB, Phone, National ID, ABHA).
- Candidate scoring with confidence thresholds to prevent duplicate patient file creation.
- Submit record merge requests with mandatory justification to maintain a clean single source of truth.

### B. Appointments & Scheduling Roster (`/receptionist/appointments`)
- Calendar and tabular view of booked outpatient consultations.
- Filter by Doctor, Specialty, Department, or Time Slot.
- Schedule walk-in appointments, reschedule existing visits, or record patient cancellations.

### C. Patient Registration Portal (`/receptionist/patients`)
- Capture demographic profile: Full Legal Name, DOB, Gender, Blood Type, Phone, Email, National ID, Address.
- System validates fields and generates an immutable Medical Record Number (`MRN-XXXXXX`).
