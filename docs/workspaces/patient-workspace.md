# Patient Self-Service Portal Workspace Specification

## 1. Identity & Self-Service Model

```text
Person
  ↓
User (Role = PATIENT)
  ↓
Linked Patient Identity (MRN / Patient Record / ABHA ID)
  ↓
Self-Service Access Scope:
  ├── View Personal Longitudinal Medical Timeline
  ├── Access Finalized Diagnostic Lab Reports & Imaging
  ├── Review Active Prescriptions & Medication Instructions
  ├── Self-Schedule / Reschedule Outpatient Consultations
  └── Manage Consent Directives (ABDM Health Information Exchange)
```

---

## 2. Patient Self-Service Lifecycle

```text
Patient Signs In to Patient Portal (`/patient/dashboard`)
  │
  ├── 1. Personal Health Overview
  │     ├── Next Upcoming Appointment
  │     ├── Active Medications & Dosage Schedule
  │     └── Recent Lab Reports & Vitals History
  │
  ├── 2. Medical Records & Longitudinal Timeline (`/patient/records`)
  │     ├── Consultation Notes & Discharge Summaries
  │     ├── Diagnostic Test Results (with normal/abnormal highlights)
  │     └── Immunization & Allergy Records
  │
  ├── 3. Self-Service Appointment Booking (`/patient/appointments`)
  │     ├── Select Specialty, Doctor, Facility & Preferred Time
  │     └── Instant Confirmation & SMS/Email Reminders
  │
  └── 4. Health Data Consent Directives
        └── Authorize or revoke data exchange with external ABDM providers
```

---

## 3. Dedicated Workspace Subpages

### A. Patient Dashboard (`/patient/dashboard`)
- Welcoming personal health summary.
- Highlight cards: Next Consultation date & doctor, Active Medications due, and Latest Vitals trend.

### B. Longitudinal Medical Records & Timeline (`/patient/records`)
- Chronological timeline of all past hospital visits, admissions, diagnoses, and medical notes.
- Downloadable PDF summaries and discharge notes.

### C. Diagnostic Lab Reports (`/patient/lab-results`)
- View finalized laboratory results (e.g. Complete Blood Count, Lipid Panel, HbA1c).
- Clear visual indicators of parameters within normal limits or requiring doctor consultation.

### D. Active Prescriptions (`/patient/prescriptions`)
- View active medications prescribed by attending doctors, dosage schedules, routes, and instructions.
- 1-Click medication refill request.

### E. Appointment Self-Booking (`/patient/appointments`)
- Search doctors by specialty, review credentials, check open time slots, and schedule visits.
- Reschedule or cancel appointments with automated notifications.
