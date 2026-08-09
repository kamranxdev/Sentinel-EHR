# Target Architecture Specification: Pharmacist Workspace (`ROLE_PHARMACIST`)

This document defines how the **Pharmacist Workspace** should be architected in an enterprise Electronic Health Record (EHR) platform, establishing gold-standard specifications for Computerized eRx Verification, Dose Adjustment based on Renal Function (eGFR / CrCl) and Body Surface Area (BSA), DEA Schedule II-V Controlled Substance Tracking (EPCS), Inpatient/Outpatient Formulary Reconciliation, and Automated Dispensing Cabinet (ADC) sync.

---

## 💊 1. Ideal Workspace Functional Architecture

The Pharmacist Workspace provides clinical pharmacy tools for hospital pharmacists, clinical specialists, and pharmacy directors (`ROLE_PHARMACIST`, `ROLE_PHARMACY_DIR`).

```mermaid
flowchart TD
    subgraph Pharmacy_Desk ["💊 Clinical Pharmacy Desk (/pharmacist)"]
        eRxQueue["Computerized eRx Verification Queue"]
        DoseCalc["Renal Function & BSA Dose Adjustment Calculator (CrCl / eGFR)"]
        ControlledSubstance["DEA Schedule II-V EPCS Controlled Substance Vault"]
        FormularyMgmt["Inpatient / Outpatient Formulary & Therapeutic Substitution"]
        DispenseADC["Automated Dispensing Cabinet (Omnicell/Pyxis) Sync Portal"]
    end

    subgraph Clinical_Reconciliation ["🧪 Safety Reconciliation Engine"]
        DrugAllergy["RxNorm Allergen Cross-Match"]
        DrugInteraction["Multi-Tier Drug-Drug Interaction Matrix"]
        OrganToxicity["Hepatic / Renal Toxicity Alerts"]
        DrugAllergy & DrugInteraction & OrganToxicity --> VerificationDecision{Approve eRx?}
    end

    subgraph Target_Security ["🛡️ Hybrid RBAC + ABAC Engine"]
        RBAC["RBAC: PRESCRIPTION_DISPENSE, EPCS_VERIFY, MAR_READ"]
        ABAC["ABAC: Active eRx Order OR Inpatient Pharmacy Assignment"]
    end

    Pharmacy_Desk --> Target_Security
    eRxQueue --> Clinical_Reconciliation
```

---

## 🎨 2. Target Component Breakdown & Capabilities

| Component Name | Route Path | Ideal Feature Scope & Specifications |
| :--- | :--- | :--- |
| `PharmacistDashboardComponent` | `/pharmacist/dashboard` | Pharmacy Command Center: Pending eRx verification queue by urgency, critical renal dose adjustments due, DEA controlled substance logs, ADC inventory alerts. |
| `PharmacistVerificationComponent` | `/pharmacist/erx-verification` | eRx Verification Queue: Review doctor eRx orders, dosage, route, frequency, prescribing doctor credentials (NPI/DEA); evaluates real-time lab metrics (Serum Creatinine, eGFR, CrCl, LFTs) for dose adjustment. |
| `PharmacistControlledSubstanceComponent` | `/pharmacist/epcs-vault` | DEA Controlled Substance Tracking: EPCS Schedule II-V validation, perpetual vault inventory tracking, electronic 222 form logging, waste & disposal witness co-signatures. |
| `PharmacistDispensingComponent` | `/pharmacist/dispense` | Dispensing & ADC Sync Desk: Execute drug dispensing, print barcode prescription labels, sync unit-dose orders with Automated Dispensing Cabinets (Omnicell/Pyxis), update eMAR status. |

---

## 🔐 3. Ideal RBAC & ABAC Security Specification

### A. Role-Based Access Control (RBAC Permissions)

Baseline role permissions assigned to `ROLE_PHARMACIST` / `ROLE_PHARMACY_DIR`:

- `PRESCRIPTION_READ`, `PRESCRIPTION_VERIFY`, `PRESCRIPTION_DISPENSE`
- `EPCS_VERIFY` (Controlled substance verification)
- `ALLERGY_READ`
- `DIAGNOSIS_READ` (Read-only view for clinical context)
- `LAB_RESULT_READ` (Read-only view of eGFR, CrCl, LFTs, drug blood levels)
- `MAR_READ`, `MAR_UPDATE`
- `FORMULARY_MANAGE`

> [!NOTE]
> **Clinical Pharmacy Scope**: Pharmacists have full read access to patient diagnostic labs, allergies, diagnoses, and MAR history for safety reconciliation, but **cannot** write physician SOAP progress notes (`CLINICAL_NOTE_CREATE` blocked) or issue new eRx orders (`PRESCRIPTION_CREATE` blocked).

### B. Attribute-Based Access Control (ABAC Contextual Rules)

1. **Prescription Linkage**: Access to patient clinical records is granted when an active eRx order exists in `prescriptions` for that patient.
2. **Pharmacy Unit Bound**: Operations are scoped to the assigned hospital inpatient pharmacy or outpatient facility unit.

---

## ⚡ 4. Clinical Verification & Dispensing Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Doc as Physician (ROLE_DOCTOR)
    actor Pharm as Clinical Pharmacist (ROLE_PHARMACIST)
    participant Queue as eRx Verification Queue
    participant LabService as Clinical Lab Subsystem
    participant ADC as Automated Dispensing Cabinet (ADC)
    participant Audit as WORM Audit Ledger

    Doc->>Queue: Issue eRx Order (e.g. Gentamicin 120mg IV Q8H)
    Pharm->>Queue: Select eRx Order in 'pharmacist/erx-verification'
    Pharm->>LabService: Fetch Patient Lab Profile (Serum Creatinine, eGFR)
    LabService-->>Pharm: eGFR = 35 mL/min (Impaired Renal Function)

    alt Renal Dose Adjustment Required
        Pharm->>Pharm: Calculate Adjusted Dose (Gentamicin 80mg Q12H)
        Pharm->>Doc: Submit Therapeutic Adjustment Request
        Doc-->>Pharm: Approve Therapeutic Adjustment
    end

    Pharm->>Queue: Click "Verify & Release to Dispense"
    Pharm->>ADC: Send Dispense Command to ADC Unit (Pyxis / Omnicell)
    ADC-->>Pharm: Unit-Dose Drug Released
    Queue->>Audit: Append SHA-256 Block Entry (PRESCRIPTION_DISPENSED_EPCS)
```

---

## 📡 5. Target REST API Endpoint Mapping

| Method | REST API Endpoint | Required RBAC Permission | ABAC Policy Rule |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pharmacy/erx/queue` | `PRESCRIPTION_READ` | Scoped to pharmacy facility unit |
| `POST` | `/api/v1/pharmacy/erx/{id}/verify` | `PRESCRIPTION_VERIFY` | Valid Pharmacist License Required |
| `POST` | `/api/v1/pharmacy/dispense/adc` | `PRESCRIPTION_DISPENSE` | Must pass eRx verification check |
| `POST` | `/api/v1/pharmacy/epcs/vault` | `EPCS_VERIFY` | Dual-Factor Auth + DEA License Verified |
