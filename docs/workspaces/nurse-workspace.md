# Nurse Station & Bedside Care Workspace Specification

## 1. Identity & Shift-Scoped Access Model

```text
Person
  ↓
User (Role = NURSE)
  ↓
Organization Membership (Hospital / Clinic)
  ↓
Department / Ward (e.g. Ward 3A)
  ↓
Shift Assignment (e.g. Morning 07:00 – 15:00)
  ↓
Nursing Care Scope:
  ├── Ward Inpatient Bedside Roster (Admitted Inpatients in Ward 3A)
  └── Outpatient Appointments & Triage (Arrived Clinic Patients)
```

> [!IMPORTANT]
> **NURSE $\neq$ ACCESS TO ALL PATIENTS IN HOSPITAL**
> A nurse gets access because they have a legitimate care relationship with the patient (Patient Assignment / Ward Assignment / Outpatient Triage Encounter / Active Shift), not merely because they have the `NURSE` role.

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`wards`** | `spatial` / `adt` | Hospital Wards | None (Admin managed) | `organization_id` $\rightarrow$ `organizations.id`, `department_id` $\rightarrow$ `departments.id` |
| **`beds`** | `spatial` / `adt` | Assigned Ward | Update Status (`AVAILABLE`, `CLEANING`, `OCCUPIED`) | `room_id` $\rightarrow$ `rooms.id`, `ward_id` $\rightarrow$ `wards.id`, `organization_id` $\rightarrow$ `organizations.id` |
| **`encounters`** | `clinical` | Ward / Triage | Update Vitals, Stage, & Flowsheet | `patient_id` $\rightarrow$ `patients.id`, `organization_id` $\rightarrow$ `organizations.id` |
| **`appointments`** | `scheduling` | Clinic Queue | Update Stage (`TRIAGED`) | `patient_id` $\rightarrow$ `patients.id`, `departmentId` $\rightarrow$ `departments.id` |
| **`vitals`** | `clinical` | Ward / Triage | Full Create (Log BP, HR, Temp, Resp, SpO2, BMI) | `encounter_id` $\rightarrow$ `encounters.id`, `recorded_by` $\rightarrow$ `users.id` |
| **`prescriptions`** | `pharmacy` | Ward Inpatients | Read Active Orders | `encounter_id` $\rightarrow$ `encounters.id`, `patient_id` $\rightarrow$ `patients.id` |
| **`medication_administrations`**| `pharmacy` | Ward Inpatients | Full Create (Log dose given, hold/refusal with reason) | `prescription_id` $\rightarrow$ `prescriptions.id`, `administered_by` $\rightarrow$ `users.id` |
| **`nursing_flowsheets`** | `clinical` | Ward Inpatients | Full Create (I/O balance, GCS, wound checks, pain) | `encounter_id` $\rightarrow$ `encounters.id`, `nurse_id` $\rightarrow$ `users.id` |
| **`clinical_documents`** | `clinical` | Ward Inpatients | Full Create (SBAR Shift Handover Notes) | `encounter_id` $\rightarrow$ `encounters.id`, `author_id` $\rightarrow$ `users.id` |

---

## 3. Nursing Dual Workflows & Lifecycle

```text
                                  NURSE
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
               OUTPATIENT                       INPATIENT
                    │                               │
       Outpatient Appointments & Triage     Ward 3A Bedside Census
                    │                               │
            Triage Intake Form              Bedside Nursing Chart
                    │                               │
         ├── BP, Pulse, Temp, SpO2, RR      ├── Physiological Vitals Log
         ├── Visual Pain Scale (0-10)       ├── 5-Rights eMAR Admin
         ├── Height, Weight & BMI Calc      ├── Intake & Output (I/O) Balance
         ├── Allergy Verification           ├── Head-to-Toe Assessment
         └── Send to Doctor (`TRIAGED`)     └── SBAR Shift Handoff
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Nursing Command Station (`/nurse/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/wards/current/census` $\rightarrow$ Loads admitted inpatient list in assigned ward (Ward 3A).
   - `GET /api/v1/appointments/triage-queue?departmentId={dept}` $\rightarrow$ Loads arriving clinic patients needing triage.
   - `GET /api/v1/prescriptions/due?wardId={ward}` $\rightarrow$ Calculates eMAR medications due this shift.
   - `GET /api/v1/tasks/nurse/shift` $\rightarrow$ Loads active shift action tasks.
2. **Clinical Pulse & High-Acuity Monitoring**:
   - Automated computed signal evaluates all admitted patients' latest NEWS2 scores.
   - Any patient with **NEWS2 $\ge$ 4** is surfaced in a high-visibility amber alert strip at the top of the command desk.
3. **Action Execution & Downstream Updates**:
   - Clicking **Bedside Chart** navigates to `/nurse/chart?patientId={id}` with active patient safety banner.
   - Marking a shift task as done immediately updates `task.status = COMPLETED` and increments completed shift task counts.

---

## 5. Dedicated Subpages & Nursing Subsystems

### A. Outpatient Appointments & Triage (`/nurse/appointments`)
- **4-Stage Visual Pipeline**: `Total Today` $\rightarrow$ `Awaiting Check-in` $\rightarrow$ `Ready for Nurse Triage` $\rightarrow$ `Triaged for Doctor`.
- **Fast-Triage Modal**:
  - Full physiological vitals capture: Blood Pressure (Systolic/Diastolic), Heart Rate, Respiratory Rate, Body Temperature, SpO2, and Blood Glucose.
  - Live calculated **BMI** and **NEWS2 Early Warning Score**.
  - Interactive **0–10 Visual Pain Scale** with color-coded severity.
  - Allergy screening verification.
  - 1-Click **Complete Triage & Route to Doctor** updates appointment stage to `TRIAGED`, moving the patient to the physician's active consultation queue.

### B. Spatial Bed & Ward Census (`/nurse/beds`)
- **Ward Analytics Banner**: Total Ward Beds, Occupied Beds (with occupancy rate %), Available Beds, and Cleaning turnover.
- **Interactive Spatial Bed Grid**: Visual layout (`Bed 301A`, `Bed 301B`, `Bed 302A`, etc.) displaying patient name, MRN, admission diagnosis, attending doctor, NEWS2 score badge, fall risk, and isolation status.
- Quick actions: **Open Bedside Chart**, **Admit Patient**, and **Mark Sanitized & Ready**.

### C. Bedside Nursing EHR Chart (`/nurse/chart`)
- **Patient Safety Banner**: Prominently highlights Allergies, Code Status (`FULL CODE`), Fall Risk (`HIGH`), and Active IV Lines.
- **7 Responsive Clinical Subsystems**:
  1. `Bedside Vitals`: Serial vitals logging with NEWS2 acuity trend scoring.
  2. `eMAR & Admin Log`: 5-Rights medication administration record with 1-click **Administer Dose** or **Record Hold/Refusal** with mandatory reason.
  3. `Intake & Output (I/O) Fluid Balance`: Enteral/IV intake vs. urine/drain/emesis output with live 24h Net Fluid Balance calculation (+/- mL).
  4. `Head-to-Toe Assessment`: Structured Neuro/GCS, Respiratory/O2, Cardiovascular, Skin/Wounds, and Pain evaluation.
  5. `Allergies & Risk Register`: Documented allergens, severity, and cross-reactivity warnings.
  6. `Structured SBAR Shift Handover`: Standardized Situation, Background, Assessment, Recommendation note with electronic sign-off.
  7. `Care Team Directory`: Multidisciplinary care team roster.
