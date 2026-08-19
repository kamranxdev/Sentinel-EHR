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

> [!IMPORTANT]
> **PATIENT DATA IS STRICTLY SELF-SCOPED**
> Patients can only access records where `patient_id == currentUser.patientId`. All external health data exchanges require explicit patient consent directives.

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`patients`** | `patient` | Own Record Only | Update Contact / Address Info | Self Patient Boundary |
| **`encounters`** | `clinical` | Own Encounters | None | `patient_id` $\rightarrow$ `patients.id` |
| **`vitals`** | `clinical` | Own Vitals History | None | `patient_id` $\rightarrow$ `patients.id` |
| **`diagnoses`** | `clinical` | Own Problem List | None | `patient_id` $\rightarrow$ `patients.id` |
| **`prescriptions`** | `pharmacy` | Own Active eRx | Request Refills | `patient_id` $\rightarrow$ `patients.id` |
| **`lab_results`** | `laboratory` | Own Finalized Labs | None | `lab_order_id` $\rightarrow$ `lab_orders.id` |
| **`appointments`** | `scheduling` | Own Appointments | Full Book, Cancel, Reschedule | `patient_id` $\rightarrow$ `patients.id` |
| **`patient_consents`** | `consent` | Own Directives | Full Authorize, Revoke Consent | `patient_id` $\rightarrow$ `patients.id` |

---

## 3. Patient Self-Service Lifecycle

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
  │     ├── Select Hospital / Clinic, Specialty, Doctor & Preferred Time
  │     └── Instant Confirmation & SMS/Email Reminders
  │
  └── 4. Health Data Consent Directives
        └── Authorize or revoke data exchange with external ABDM providers
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Patient Dashboard (`/patient/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/patient-portal/summary` $\rightarrow$ Returns next scheduled appointment, active medication schedule, latest vitals, and recent lab results.
2. **Self-Service Appointment Booking Flow**:
   - Patient searches available doctors by specialty $\rightarrow$ Selects date and time slot $\rightarrow$ Executes `POST /api/v1/appointments/book`.
   - **Downstream Event**: Confirmation SMS/email sent, appointment created in hospital schedule with status `SCHEDULED`.

---

## 5. Dedicated Subpages & Patient Self-Service

### A. Longitudinal Medical Records & Timeline (`/patient/records`)
- Chronological timeline of all past hospital visits, admissions, diagnoses, and medical notes.
- Downloadable PDF summaries and discharge notes.

### B. Diagnostic Lab Reports (`/patient/lab-results`)
- View finalized laboratory results (e.g. Complete Blood Count, Lipid Panel, HbA1c).
- Clear visual indicators of parameters within normal limits or requiring doctor consultation.

### C. Active Prescriptions (`/patient/prescriptions`)
- View active medications prescribed by attending doctors, dosage schedules, routes, and instructions.
- 1-Click medication refill request.

### D. Health Data Consent Directives (`/patient/consent`)
- Authorize or revoke health data sharing with external ABDM-connected hospitals and clinics.
