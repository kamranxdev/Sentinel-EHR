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

## 2. End-to-End LIS Diagnostic Lifecycle

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

## 3. Dedicated Workspace Subpages

### A. Laboratory Command Desk (`/lab-technician/dashboard`)
- **LIS Metrics**: Total Active Orders, Pending Specimen Collections, In-Processing Analyzers, and Validated Tests.
- **Urgency Pipeline**: Filter orders by priority (`STAT`, `URGENT`, `ROUTINE`).
- **Critical Alerts Feed**: Immediate notification of abnormal panic values requiring verbal readback.

### B. Specimen Collection & Barcode Generation (`/lab-technician/specimens`)
- Phlebotomy queue for outpatient and inpatient orders.
- Generate and print unique 1D/2D barcodes (`SPEC-XXXXXX`).
- Confirm collection time, specimen container type, and volume adequacy.

### C. Accessioning & Analyzer Ingest (`/lab-technician/accessioning`)
- Rapid barcode scanner input to verify sample receipt.
- Route samples to automated analyzers (Hematology, Biochemistry, Coagulation, Immunoassay).

### D. Result Entry & Validation (`/lab-technician/results`)
- Structured parameter entry with physiological reference range validation.
- Critical value alerting mechanism (auto-highlights high/low panic values in red).
- Electronic signature and sign-off by Lab Technician / Pathologist.
- Finalized results instantly sync to the patient's EHR Chart and notify the ordering physician.
