# Receptionist & Front-Desk Workspace Specification

## 1. Identity & Administrative Scope

```text
Person
  ↓
User (Role = RECEPTIONIST)
  ↓
Organization Membership
  ↓
Facility / Front-Desk Reception
  ↓
Administrative Scope:
  ├── Patient Demographic Registration (New MRN issuance)
  ├── Master Patient Index (MPI) Search & Deduplication
  ├── Appointment Booking & Scheduling
  └── OPD Arrival Check-in & Queue Routing
```

---

## 2. Front-Desk Patient Intake Lifecycle

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

## 3. Dedicated Workspace Subpages

### A. Reception Command Center (`/receptionist/dashboard`)
- **Queue Overview**: Total Today's Appointments, Arrived/Checked-in Patients, Pending Check-ins, and Walk-in Capacity.
- **Waiting Room Monitor**: Live visibility into clinic waiting area load.

### B. Master Patient Index (MPI) Search & Deduplication (`/receptionist/mpi`)
- Multi-field fuzzy matching (Legal Name, DOB, Phone, National ID, ABHA).
- Candidate scoring with confidence thresholds.
- Initiate patient record merge requests to maintain single source of truth without data loss.

### C. Appointments & Scheduling Roster (`/receptionist/appointments`)
- Calendar & tabular views of booked appointments.
- Filter by Doctor, Specialty, Department, or Time Slot.
- 1-Click **Check-In** updates appointment status to `CHECKED_IN`, notifying the triage nurse.

### D. Patient Registration Portal (`/receptionist/patients`)
- Register new patient identities with full demographic validation.
- Auto-generates organization-scoped Medical Record Number (`MRN-XXXXXX`).
- Links emergency contacts, insurance policies, and ABHA credentials.
