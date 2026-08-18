# Physician Practice Workspace Specification

## 1. Identity & Scoped Access Model

```text
Person
  ↓
User (Role = PHYSICIAN)
  ↓
Practitioner (Specialty, License #, Facility)
  ↓
Clinical Access Scope:
  ├── Assigned Outpatients (Appointments -> Check-in -> Encounter)
  ├── Assigned Inpatients (Admissions -> Ward/Bed -> Attending / Consultant)
  └── Emergency Overrides (Break-Glass 4-hour lease)
```

> [!IMPORTANT]
> **PHYSICIAN $\neq$ ACCESS TO ALL PATIENTS IN HOSPITAL**
> Access is encounter-driven, assignment-driven, and organization-scoped. A physician accesses patients who are actively scheduled in their outpatient queue, admitted under their inpatient care team, or accessed via an audited emergency break-glass protocol.

---

## 2. Physician Workflow Architecture

```text
                                PHYSICIAN
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
               OUTPATIENT                       INPATIENT
                    │                               │
         Clinic Queue / Appointments        Ward Census & Rounds
                    │                               │
         Open Consultation Chart            Bedside Clinical Chart
                    │                               │
         ├── Review Nurse Triage Vitals     ├── Daily Progress Note (SOAP)
         ├── Document Problem List / Dx     ├── Review Lab / Imaging Results
         ├── Order Diagnostics / Labs       ├── Adjust eRx Prescriptions
         └── e-Prescribe (eRx)              └── Plan Discharge / Transfer
```

---

## 3. Dedicated Workspace Subpages

### A. Physician Command Desk (`/physician/dashboard`)
- **Executive Header**: Displays Practitioner Name, Specialty, License Number, Active Shift, and Facility.
- **High-Impact KPI Metric Tiles**:
  - *Today's Outpatient Appointments* (with checked-in count).
  - *My Inpatient Census* (admitted ward patients under attending/consultant care).
  - *Active Patient EHR Chart* (quick resume of current patient context).
  - *Action Tasks Inbox* (pending sign-offs and critical alerts).
- **Split Workstation Layout**:
  - **Left (8 Cols)**: Today's In-Clinic Outpatient Queue snapshot (top 5) and Inpatient Ward Census snapshot (top 3) with deep links to their dedicated subpages.
  - **Right (4 Cols)**: Clinical Action Tasks Inbox (abnormal labs, unsigned progress notes with 1-click sign-off) and Quick Clinical Workspace links.

### B. Outpatient Appointments & Queue (`/physician/appointments`)
- Real-time consultation queue of booked and checked-in patients.
- Pre-consultation nurse triage vitals review (BP, Pulse, Temp, SpO2, Pain Scale 0-10, BMI).
- 1-Click **Open Consultation** initiates an active outpatient encounter and loads the patient's EHR Chart.

### C. Inpatient Ward Census & Rounds (`/physician/inpatients`)
- Ward census roster for patients admitted under the physician's care (as **Attending** or **Consultant**).
- Displays Bed Location (`301A`, `301B`), Demographics, Admission Diagnosis (ICD-10), Length of Stay, and NEWS2 Acuity Score.
- 1-Click **Inpatient Rounds** launches the bedside chart.

### D. Active Clinical EHR Chart (`/physician/chart`)
- **Responsive 10-Subsystem Multi-Row Grid**:
  1. `Vitals & Flowsheet`: Physiological vitals trends and historical readings.
  2. `Diagnoses & Problems`: ICD-10 problem list management (Primary, Secondary, Differential).
  3. `Diagnostic & Lab Orders`: Lab test and imaging study requisitions.
  4. `e-Prescriptions (eRx)`: Electronic prescriptions with automated pre-sign Drug-Drug Interaction (DDI) & allergy checks.
  5. `SOAP Notes`: Structured Subjective, Objective, Assessment, and Plan documentation.
  6. `Allergies & Contraindications`: Documented allergens and ADRs.
  7. `Encounters & History`: Longitudinal visit timeline.
  8. `Care Team`: Multidisciplinary care team directory.
  9. `Procedures`: Surgical & minor procedure documentation.
  10. `Discharge & Transfer`: Discharge summary generation and ward-to-ward transfers.

### E. Emergency Break-Glass Override (`/physician/break-glass`)
- Search portal for unassigned emergency arrivals.
- Mandatory selection of emergency category and written clinical justification.
- Grants a **4-Hour Time-Bounded Access Lease** with immutable WORM audit logging.
