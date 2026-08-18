# Nurse Station & Bedside Care Workspace Specification

## 1. Identity & Shift-Scoped Access Model

```text
Person
  ↓
User (Role = NURSE)
  ↓
Organization Membership
  ↓
Facility / Department / Ward (e.g. Ward 3A)
  ↓
Shift Assignment (e.g. Morning 07:00 – 15:00)
  ↓
Nursing Care Scope:
  ├── Ward Inpatient Bedside Roster (Admitted Inpatients in Ward 3A)
  └── Outpatient / ER Triage Queue (Arrived Clinic Patients)
```

> [!IMPORTANT]
> **NURSE $\neq$ ACCESS TO ALL PATIENTS IN HOSPITAL**
> A nurse gets access because they have a legitimate care relationship with the patient (Patient Assignment / Ward Assignment / Outpatient Triage Encounter / Active Shift), not merely because they have the `NURSE` role.

---

## 2. Nursing Dual Workflows

```text
                                  NURSE
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
               OUTPATIENT                       INPATIENT
                    │                               │
         Clinic Triage Queue                Ward 3A Bedside Census
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

## 3. Dedicated Workspace Subpages

### A. Nursing Station Command Desk (`/nurse/dashboard`)
- **Shift & Location Header**: Shows Nurse Name, Active Shift (`07:00 – 15:00`), Assigned Unit (`Ward 3A - Acute Internal Medicine`), Facility, and Station ID.
- **Clinical Pulse**: Real-time alerts for patients with elevated NEWS2 ($\ge$ 4) requiring immediate observation.
- **Interactive Multi-Filter Bedside Inpatient Roster**: Instant switching between `All Inpatients`, `Elevated NEWS2`, `High Fall Risk`, and `Meds Due Now`.
- **Shift Tasks Inbox & Triage Preview**: Direct task completion and quick station links.

### B. Outpatient Appointments & Triage (`/nurse/appointments`)
- **4-Stage Visual Queue**: `Total Today` $\rightarrow$ `Awaiting Check-in` $\rightarrow$ `Ready for Nurse Triage` $\rightarrow$ `Triaged for Doctor`.
- **Fast-Triage Modal**:
  - Full physiological vitals intake (BP, HR, Temp, Resp, SpO2, Blood Glucose).
  - Live **BMI** calculation and live **NEWS2 Early Warning Score** computation.
  - Interactive **0–10 Visual Pain Scale**.
  - Allergy verification and STAT priority red-flag toggle.
  - 1-Click **Complete Triage & Route to Doctor**.

### C. Spatial Ward Bed Census (`/nurse/beds`)
- **Ward Capacity & Occupancy Analytics**: Total Beds, Occupied Beds (with occupancy rate %), Available Beds, and Cleaning turnover.
- **Interactive Bed Cards Grid**: Room layout (`301A`, `301B`, `302A`, etc.) with patient details, admission diagnosis, NEWS2 acuity badges, isolation status, and quick-action buttons (**Open Bedside Chart**, **Admit Patient**, **Mark Sanitized**).

### D. Nursing Bedside EHR Chart (`/nurse/chart`)
- **Patient Safety Strip**: Prominently highlights Allergies, Code Status (`FULL CODE`), Fall Risk, and IV line status.
- **7 Responsive Multi-Row Tabs**:
  1. `Bedside Vitals`: Physiological vitals flowsheet with NEWS2 trend scoring.
  2. `eMAR & Admin Log`: 5-Rights medication administration record with 1-click **Administer Dose** or **Record Hold/Refusal**.
  3. `Intake & Output (I/O) Fluid Balance`: Enteral/IV intake vs. urine/drain output with 24h net fluid balance calculation (+/- mL).
  4. `Head-to-Toe Assessment`: Structured Neuro/GCS, Respiratory/O2, Cardiovascular, Skin/Wounds, and Pain systems.
  5. `Allergies & Risk Register`: Documented allergens, severity, and cross-reactivity warnings.
  6. `Structured SBAR Shift Handover`: Standardized Situation, Background, Assessment, Recommendation note with electronic sign-off.
  7. `Care Team Directory`: Multidisciplinary care team roster.
