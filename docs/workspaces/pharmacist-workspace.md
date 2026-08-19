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

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`medications`** | `pharmacy` | Master Formulary | Full Create & Update Catalog | Master Drug Catalog |
| **`prescriptions`** | `pharmacy` | All Org Orders | Update Status (`VERIFIED`, `DISPENSED`, `REJECTED`) | `encounter_id` $\rightarrow$ `encounters.id`, `patient_id` $\rightarrow$ `patients.id` |
| **`medication_administrations`**| `pharmacy` | Inpatient eMAR | Read-Only Surveillance of Admin Log | `prescription_id` $\rightarrow$ `prescriptions.id` |
| **`allergies`** | `clinical` | Order Patients | Read-Only (Safety evaluation) | `patient_id` $\rightarrow$ `patients.id` |
| **`audit_logs`** | `audit` | None | Auto-Appended by Interceptor | `user_id` $\rightarrow$ `users.id` |

---

## 3. Inpatient & Outpatient Pharmacy Lifecycle

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
  │     └── Inpatient  -> Send to Ward 3A medication cart / automated cabinet
  │
  └── 4. Nurse Administers via eMAR (`GIVEN`)
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Pharmacy Command Desk (`/pharmacist/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/prescriptions?status=PENDING_VERIFICATION` $\rightarrow$ Loads physician orders requiring clinical pharmacist review.
   - `GET /api/v1/pharmacy/alerts/ddi` $\rightarrow$ Surfaces high-risk drug-drug interaction flags.
   - `GET /api/v1/pharmacy/inventory/low-stock` $\rightarrow$ Lists formulary drugs nearing replenishment thresholds.
2. **Order Verification Flow**:
   - Pharmacist reviews order dosage against patient age, weight, and renal eGFR labs.
   - Clicking **Verify & Dispense** executes `POST /api/v1/prescriptions/{id}/verify`.
   - **Downstream Event**: Inpatient medication immediately appears on the Nurse's bedside eMAR worklist as due for administration.

---

## 5. Dedicated Subpages & Pharmacy Operations

### A. Prescription Verification Queue (`/pharmacist/prescriptions`)
- Review physician medication orders across outpatient and inpatient wards.
- Automated safety evaluation alerts (Allergies, Dosage range checks, Contraindications).

### B. Dispensing & Unit-Dose Packaging (`/pharmacist/dispense`)
- Barcode verification during unit-dose packaging to eliminate medication dispensing errors.
- Print prescription labels with instructions, route, and warning stickers.

### C. Formulary & Inventory Stock Management (`/pharmacist/inventory`)
- Real-time stock levels across central pharmacy and ward satellite medication rooms.
- Track lot numbers, expiration dates, and controlled substance registries.
