# Target Architecture Specification: Doctor / Physician Workspace (`ROLE_DOCTOR`)

This document defines how the **Doctor / Physician Workspace** should be architected in a enterprise Electronic Health Record (EHR) platform, establishing gold-standard specifications for Computerized Provider Order Entry (CPOE), Clinical Decision Support (CDS Hooks), Problem-Oriented Medical Records (POMR), Emergency Break-Glass protocols, and hybrid RBAC+ABAC authorization.

---

## 👨‍⚕️ 1. Ideal Workspace Functional Architecture

The Physician Workspace must function as an intelligent clinical command desk for attending, consulting, and resident physicians (`ROLE_DOCTOR`, `ROLE_ATTENDING_PHYSICIAN`, `ROLE_SURGEON`).

```mermaid
flowchart TD
    subgraph Physician_Desk ["👨‍⚕️ Physician Desk Dashboard (/doctor)"]
        MyRoster["Active Patient Roster (Inpatient Ward / Outpatient Schedule)"]
        PreVisit["Pre-Visit Clinical Summary & Longitudinal Timeline"]
        POMR_Notes["Problem-Oriented SOAP Note Editor (ICD-10 / SNOMED CT)"]
        CPOE_Engine["Computerized Provider Order Entry (CPOE) Desk"]
        BreakGlassUI["Emergency Break-Glass Authorization Portal"]
    end

    subgraph Decision_Support ["🧠 Clinical Decision Support System (CDS Hooks)"]
        RxSafety["RxNorm / NDF-RT Drug Interaction Engine"]
        AllergyCheck["Allergen Cross-Reference & Contraindication Alert"]
        LabCheck["Renal Function & Organ Toxicity Warning (eGFR / CrCl)"]
        RxSafety & AllergyCheck & LabCheck --> SafetyDecision{Contraindication?}
    end

    subgraph Target_Security ["🛡️ Hybrid RBAC + ABAC Engine"]
        RBAC["RBAC: CPOE_CREATE, CLINICAL_NOTE_CREATE, BREAK_GLASS_EXECUTE"]
        ABAC["ABAC: Active Care Team Roster OR Dept Match OR Active Break-Glass"]
    end

    Physician_Desk --> Target_Security
    CPOE_Engine --> Decision_Support
```

---

## 🎨 2. Target Component Breakdown & Capabilities

| Component Name | Route Path | Ideal Feature Scope & Specifications |
| :--- | :--- | :--- |
| `DoctorDashboardComponent` | `/doctor/dashboard` | Physician Command Center: Patient census by acuity, critical lab alerts, pending co-signatures, telehealth queue, eCQM compliance indicators. |
| `DoctorPatientsComponent` | `/doctor/patients` | Scoped Patient Roster: Master Patient Index lookup constrained by ABAC care team relationships; displays longitudinal timeline, problem list, active meds, and vitals telemetry. |
| `DoctorEncountersComponent` | `/doctor/encounters` | POMR SOAP Note Desk: Structured Subjective, Objective, Assessment, Plan documentation; auto-populates objective vitals/labs; integrates ICD-10-CM / SNOMED CT diagnostic problem list; supports voice dictation & macro templates. |
| `DoctorPrescriptionsComponent` | `/doctor/prescriptions` | CPOE eRx Safety Engine: Electronic prescribing with real-time CDS Hooks checking (drug-drug, drug-allergy, drug-lab contraindications); e-Prescribing of Controlled Substances (EPCS) with dual-factor authentication (FIPS 140-2). |
| `DoctorDiagnosesComponent` | `/doctor/diagnoses` | Problem List Manager: Active, chronic, and resolved problem lists with ICD-10-CM and SNOMED CT terminology encoding, onset dating, and primary/secondary diagnosis mapping. |
| `DoctorOrdersComponent` | `/doctor/orders` | CPOE Laboratory & Imaging Desk: Order laboratory panels (LOINC) and radiology/imaging (PACS DICOM integration) with clinical indication requirements. |
| `DoctorBreakGlassComponent` | `/doctor/break-glass` | Emergency Break-Glass Override Portal: Dual-factor re-authentication portal enabling temporary PHI access during life-threatening emergencies for unassigned patients. |

---

## 🔐 3. Ideal RBAC & ABAC Security Specification

### A. Role-Based Access Control (RBAC Permissions)

Baseline role permissions assigned to `ROLE_DOCTOR` / `ROLE_ATTENDING_PHYSICIAN`:

- `CPOE_ORDER_CREATE`, `CPOE_ORDER_READ`, `CPOE_ORDER_UPDATE`, `CPOE_ORDER_CANCEL`
- `CLINICAL_NOTE_CREATE`, `CLINICAL_NOTE_READ`, `CLINICAL_NOTE_UPDATE`
- `DIAGNOSIS_CREATE`, `DIAGNOSIS_READ`, `DIAGNOSIS_UPDATE`
- `PRESCRIPTION_CREATE`, `PRESCRIPTION_READ`, `PRESCRIPTION_UPDATE`, `PRESCRIPTION_DISCONTINUE`
- `EPCS_EXECUTE` (Electronic Prescription of Controlled Substances)
- `LAB_ORDER_CREATE`, `LAB_ORDER_READ`
- `VITALS_READ`, `VITALS_UPDATE`
- `BREAK_GLASS_EXECUTE`

### B. Attribute-Based Access Control (ABAC Contextual Rules)

$$\text{AllowAccess} = \text{HasRole}(\text{ROLE\_DOCTOR}) \land (\text{IsCareTeamMember} \lor \text{IsDeptMatch} \lor \text{IsBreakGlassActive})$$

1. **Care Team Assignment**: Checked via `patient_assignments` table (`assignment_type IN ('ATTENDING_PHYSICIAN', 'CONSULTING_PHYSICIAN')` and `endDate IS NULL`).
2. **Department / Unit Match**: Checked if doctor's assigned department matches patient's current department (e.g. Emergency Department physician on duty).
3. **Purpose of Use (PoU)**: Must equal `TREATMENT` or `EMERGENCY`.
4. **Emergency Break-Glass Protocol**:
   - Requires dual-factor re-authentication (Password + TOTP/Hardware Key).
   - Mandatory structured reason selection (e.g., `IMMINENT_CARDIAC_ARREST`, `UNCONSCIOUS_TRAUMA_PATIENT`).
   - Automatically provisions a 4-hour temporary access window.
   - Triggers an immediate high-priority audit event to the Chief Privacy Officer (`ROLE_AUDITOR`).

---

## ⚡ 4. Computerized Provider Order Entry (CPOE) & CDS Hooks Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Doc as Physician (ROLE_DOCTOR)
    participant CPOE as CPOE Desk UI
    participant CDS as CDS Hooks Safety Engine
    participant DB as EHR Database Core
    participant Audit as WORM Audit Ledger

    Doc->>CPOE: Select Patient & Select Medication (e.g. Warfarin 5mg)
    CPOE->>CDS: Trigger CDS Hook: med-select (Patient ID, Medication RxNorm, Active Meds, Allergies, Labs)
    CDS->>CDS: Check Drug-Drug (Warfarin + Aspirin), Drug-Allergy, and Drug-Lab (INR Level)
    
    alt Critical Contraindication Found (e.g. Severe Bleeding Risk)
        CDS-->>CPOE: Return CDS Card { summary: "CRITICAL CONTRAINDICATION", indicator: "critical", suggestion: "Consider alternative or adjust dose" }
        CPOE->>Doc: Display Red Alert Modal with Clinical Rationale & Alternative Suggestions
        
        alt Doctor Aborts Order
            Doc->>CPOE: Click "Cancel Order"
        else Doctor Executes Hard Override
            Doc->>CPOE: Click "Override Safety Warning" & Input Required Clinical Rationale
            CPOE->>DB: POST /api/v1/prescriptions { overrideWarning: true, rationale: "..." }
            DB->>Audit: Append SHA-256 Block Entry (CPOE_SAFETY_OVERRIDE)
            DB-->>CPOE: 201 Created (Order Issued)
        end
    else Safe Order
        CDS-->>CPOE: Return CDS Card { summary: "No Contraindications Detected", indicator: "info" }
        CPOE->>DB: POST /api/v1/prescriptions
        DB->>Audit: Append SHA-256 Block Entry (CPOE_ORDER_CREATED)
        DB-->>CPOE: 201 Created
    end
```

---

## 📡 5. Target REST API Endpoint Mapping

| Method | REST API Endpoint | Required RBAC Permission | ABAC Policy Rule |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/patients/{id}/chart` | `PATIENT_READ` | `isCareTeamMember(#id)` OR `isDeptMatch(#id)` OR `isBreakGlassActive(#id)` |
| `POST` | `/api/v1/encounters/soap` | `CLINICAL_NOTE_CREATE` | `isCareTeamMember(#request.patientId)` |
| `POST` | `/api/v1/orders/cpoe` | `CPOE_ORDER_CREATE` | `isCareTeamMember(#request.patientId)` |
| `POST` | `/api/v1/orders/epcs` | `EPCS_EXECUTE` | Dual-Factor Auth + Active DEA Registration |
| `POST` | `/api/v1/security/break-glass` | `BREAK_GLASS_EXECUTE` | Dual-Factor Auth + Mandatory Reason |
