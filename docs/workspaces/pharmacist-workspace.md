# Pharmacist Clinical Workspace Specification

## 1. Identity & Pharmacy Scope

```text
Person
  ↓
User (Role = PHARMACIST)
  ↓
Organization Membership
  ↓
Department = Inpatient & Outpatient Pharmacy
  ↓
Pharmacy Scope:
  ├── Medication Order Verification & Dispensing
  ├── Drug-Drug Interaction (DDI) & Allergy Safety Audits
  ├── Formulary & Inventory Stock Management
  └── Medication Return & Waste Tracking
```

---

## 2. Inpatient & Outpatient Pharmacy Lifecycle

```text
Physician e-Prescribes (`ACTIVE`)
  │
  ▼
Pharmacist Queue (`PENDING_VERIFICATION`)
  │
  ├── 1. Clinical Review (Indication, Dosage, Renal adjustment, DDI, Allergies)
  │
  ├── 2. Verification / Approval (`VERIFIED`)
  │
  ├── 3. Dispensing & Unit-Dose Packaging (`DISPENSED`)
  │     ├── Outpatient -> Dispense to patient at pharmacy counter
  │     └── Inpatient  -> Send to Ward 3A medication cart / automated dispensing cabinet
  │
  └── 4. Nurse Administers via eMAR (`GIVEN`)
```

---

## 3. Dedicated Workspace Subpages

### A. Pharmacy Command Desk (`/pharmacist/dashboard`)
- **Queue Overview**: Total Active eRx Orders, Pending Clinical Verifications, Ready for Dispensing, and Stock Alerts.
- **DDI Safety Alerts**: Highlights high-risk drug interactions flagged by the automated safety engine.

### B. Prescription Verification Queue (`/pharmacist/prescriptions`)
- Review physician medication orders.
- Access patient allergy list, current vitals, and renal function lab results.
- Verify, adjust, or contact prescriber with clinical recommendations.

### C. Dispensing & Inventory Management (`/pharmacist/inventory`)
- Real-time formulary stock levels across pharmacy storage locations.
- Barcode verification during unit-dose packaging.
