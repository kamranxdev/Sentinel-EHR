# Laboratory Technician Workspace Specification

## 1. Identity & Diagnostic Scope

```text
Person
  ↓
User (Role = LAB_TECHNICIAN)
  ↓
Organization Membership
  ↓
Department = Central Diagnostic Laboratory
  ↓
Diagnostic Care Scope:
  └── Diagnostic Orders Placed by Clinicians (Blood, Urine, Microbiology, Pathology)
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`lab_orders`** | `laboratory` | All Department Orders | Update Status (`ACCESSIONED`, `PROCESSING`, `COMPLETED`) | `encounter_id` $\rightarrow$ `encounters.id`, `patient_id` $\rightarrow$ `patients.id` |
| **`specimens`** | `laboratory` | Department Specimens | Full Create (Collect specimen, generate barcode) | `lab_order_id` $\rightarrow$ `lab_orders.id`, `collected_by` $\rightarrow$ `users.id` |
| **`lab_results`** | `laboratory` | Department Orders | Full Create & Validate (Enter values, flag critical) | `lab_order_id` $\rightarrow$ `lab_orders.id`, `validated_by` $\rightarrow$ `users.id` |
| **`patients`** | `patient` | Order-Linked Only | None | Read-only demographic context for tube labeling |
| **`audit_logs`** | `audit` | None | Auto-Appended by Interceptor | `user_id` $\rightarrow$ `users.id`, `organization_id` $\rightarrow$ `organizations.id` |

---

## 3. End-to-End LIS Diagnostic Lifecycle

```text
Doctor
  │
  ▼
Lab Order Placed (`ORDERED`)
  │
  ▼
Lab Department / Technician Workstation
  │
  ├── 1. Receive Order (Review test requisitions & urgency: STAT / URGENT / ROUTINE)
  ├── 2. Collect / Receive Specimen (Phlebotomy, verify tubes, generate barcode)
  ├── 3. Accession Specimen (Scan barcode into LIS accession log: `ACCESSIONED`)
  ├── 4. Process Test (Automated analyzers / manual microscopy: `PROCESSING`)
  └── 5. Enter & Validate Results (Check reference ranges, flag critical values)
             │
             ▼
        Lab Result Finalized (`COMPLETED`)
             │
             ▼
      Doctor Notified (Critical alerts pushed directly to Physician Command Desk)
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Laboratory Command Desk (`/lab-technician/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/lab-orders?status=ACTIVE` $\rightarrow$ Loads incoming orders categorized by urgency (`STAT`, `URGENT`, `ROUTINE`).
   - `GET /api/v1/specimens/pending-collection` $\rightarrow$ Populates Phlebotomy Collection Queue.
   - `GET /api/v1/lab-results/critical-alerts` $\rightarrow$ Loads active critical panic value notifications.
2. **STAT Priority Flagging**:
   - `STAT` orders (e.g. Troponin-I for suspected MI) are elevated to the top of the worklist with glowing red borders and audible tone alerts.
3. **Action Execution & Downstream Updates**:
   - Scanning a barcode at the accessioning station executes `POST /api/v1/lab-orders/{id}/accession`, updating status to `ACCESSIONED`.
   - Finalizing test results executes `POST /api/v1/lab-orders/{id}/validate`, marking `status = COMPLETED`. This immediately publishes an event to `/topic/physician.{id}.alerts` and writes a WORM audit event.

---

## 5. Dedicated Subpages & Laboratory Operations

### A. Specimen Collection & Barcode Generation (`/lab-technician/specimens`)
- Phlebotomy queue for outpatient and inpatient orders.
- 2-Identifier patient identity verification (Full Name, MRN).
- Generate and print unique 1D/2D barcodes (`SPEC-XXXXXX`).
- Confirm collection timestamp, tube container type (EDTA, Serum, Heparin), and volume adequacy.

### B. Accessioning & Analyzer Ingest (`/lab-technician/accessioning`)
- Rapid barcode scanner input to verify sample physical receipt.
- Route samples to automated analyzers (Hematology, Biochemistry, Coagulation, Immunoassay).

### C. Result Entry & Validation (`/lab-technician/results`)
- Structured parameter entry with physiological reference range validation (e.g. Hemoglobin 13.5 - 17.5 g/dL).
- Automated critical value alerting mechanism (flags extreme high/low panic values in red).
- Electronic signature and sign-off by Lab Technician / Pathologist.
- Finalized results instantly sync to the patient's EHR Chart.
