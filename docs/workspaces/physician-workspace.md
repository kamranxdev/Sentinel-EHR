# Physician Practice Workspace Specification

## 1. Identity & Scoped Access Model

```text
Person
  ↓
User (Role = PHYSICIAN)
  ↓
Practitioner (Specialty, License #, Hospital / Organization)
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

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`practitioners`** | `identity` | Full (Self) | None (Admin managed) | `user_id` $\rightarrow$ `users.id`, `organization_id` $\rightarrow$ `organizations.id` |
| **`encounters`** | `clinical` | Assigned / Ward | Create & Close (`DISCHARGED`) | `patient_id` $\rightarrow$ `patients.id`, `primary_practitioner_id` $\rightarrow$ `practitioners.id` |
| **`appointments`** | `scheduling` | Self / Specialty | Update Stage (`IN_CONSULTATION`, `COMPLETED`) | `patient_id` $\rightarrow$ `patients.id`, `doctorId` $\rightarrow$ `users.id` |
| **`diagnoses`** | `clinical` | Assigned Patients | Full Create, Update, Resolve (ICD-10) | `encounter_id` $\rightarrow$ `encounters.id`, `diagnosed_by` $\rightarrow$ `practitioners.id` |
| **`vitals`** | `clinical` | Assigned Patients | Full Create (Record vitals during consultation) | `encounter_id` $\rightarrow$ `encounters.id`, `recorded_by` $\rightarrow$ `users.id` |
| **`prescriptions`** | `pharmacy` | Assigned Patients | Full Authoring (eRx), Discontinue | `encounter_id` $\rightarrow$ `encounters.id`, `prescribing_doctor_id` $\rightarrow$ `practitioners.id` |
| **`lab_orders`** | `laboratory` | Assigned Patients | Create Test Requisitions (`ORDERED`) | `encounter_id` $\rightarrow$ `encounters.id`, `ordering_physician_id` $\rightarrow$ `practitioners.id` |
| **`clinical_documents`** | `clinical` | Assigned Patients | Full Create & Sign (SOAP Notes) | `encounter_id` $\rightarrow$ `encounters.id`, `author_id` $\rightarrow$ `users.id` |
| **`break_glass_records`**| `consent` | Self (History) | Full Create (Request 4h Emergency Lease) | `patient_id` $\rightarrow$ `patients.id`, `user_id` $\rightarrow$ `users.id` |
| **`audit_logs`** | `audit` | None | Auto-Appended by Interceptor | `user_id` $\rightarrow$ `users.id`, `organization_id` $\rightarrow$ `organizations.id` |

---

## 3. Physician Practice Workflows & Lifecycle

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

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Physician Command Desk (`/physician/dashboard`)
1. **Initial Rendering & Data Queries**:
   - On load, executes parallel API requests:
     - `GET /api/v1/appointments?doctorId={id}&date=today` $\rightarrow$ Populates Today's Outpatient Appointments KPI & Snapshot.
     - `GET /api/v1/encounters?practitionerId={id}&type=INPATIENT&status=IN_PROGRESS` $\rightarrow$ Populates My Inpatient Census KPI.
     - `GET /api/v1/tasks/physician?status=PENDING` $\rightarrow$ Populates Action Tasks Inbox (abnormal labs, unsigned SOAP notes).
2. **Real-Time Data Ingestion & Alerts**:
   - WebSockets listener subscribes to `/topic/physician.{id}.alerts`.
   - When a Lab Technician finalizes a critical lab result (e.g. Potassium > 6.0 mEq/L), an instant banner alert is rendered in the Command Desk.
3. **Action Execution & Downstream Updates**:
   - Clicking **Consultation** on an arrived patient opens `/physician/chart?patientId={id}`, updating appointment stage to `IN_CONSULTATION`.
   - Clicking **Sign Note** on an inbox task updates `clinical_documents.status` to `SIGNED`, removing the task from the inbox.

---

## 5. Dedicated Subpages & Clinical Subsystems

### A. Outpatient Appointments & Queue (`/physician/appointments`)
- Real-time consultation queue of booked and checked-in patients.
- Displays patient arrival status, triage state (`Awaiting Check-in`, `Ready for Triage`, `Triaged for Doctor`), and vital signs recorded by the nurse.
- 1-Click **Open Consultation** initiates the clinical consultation chart.

### B. Inpatient Ward Census & Rounds (`/physician/inpatients`)
- Ward census roster for patients admitted under the physician's care (as **Attending** or **Consultant**).
- Displays Bed Location (`301A`, `301B`), Demographics, Admission Diagnosis (ICD-10), Length of Stay, and NEWS2 Acuity Score.
- 1-Click **Inpatient Rounds** launches the bedside chart.

### C. Active Clinical EHR Chart (`/physician/chart`)
- **10 Responsive Clinical Subsystems**:
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

### D. Emergency Break-Glass Override (`/physician/break-glass`)
- Search portal for unassigned emergency arrivals.
- Mandatory selection of emergency category (`LIFE_THREATENING_EMERGENCY`, `TRAUMA_RESUSCITATION`) and written clinical justification.
- Grants a **4-Hour Time-Bounded Access Lease** with immutable WORM audit logging.
