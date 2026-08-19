# Billing & Revenue Cycle Workspace Specification

## 1. Identity & Financial Scope

```text
Person
  ↓
User (Role = BILLING_CLERK or FINANCIAL_ADMIN)
  ↓
Organization Membership
  ↓
Department = Revenue Cycle & Patient Accounts
  ↓
Financial Scope:
  ├── Patient Billing Accounts & Fee Schedules
  ├── Itemized Invoicing & Charge Capture
  ├── Payment Processing & Receipt Generation
  └── Insurance Pre-Authorizations & Claims Adjudication
```

---

## 2. Related Database Entities & Access Privileges

| Entity / Table | Backend Package | Read Privileges | Write / Mutation Privileges | Relationships & Foreign Keys |
| :--- | :--- | :---: | :---: | :--- |
| **`billing_accounts`** | `billing` | All Org Accounts | Full Create & Balance Adjustments | `patient_id` $\rightarrow$ `patients.id`, `encounter_id` $\rightarrow$ `encounters.id` |
| **`charge_items`** | `billing` | All Posted Charges| Full Create, Void, Discount | `encounter_id` $\rightarrow$ `encounters.id`, `billing_account_id` $\rightarrow$ `billing_accounts.id` |
| **`invoices`** | `billing` | All Org Invoices | Full Generate, Finalize, Void | `billing_account_id` $\rightarrow$ `billing_accounts.id` |
| **`payments`** | `billing` | All Transactions | Full Record Payment, Process Refund | `invoice_id` $\rightarrow$ `invoices.id`, `recorded_by` $\rightarrow$ `users.id` |
| **`insurance_claims`** | `insurance` | All Claims | Full Submit, Track Adjudication | `invoice_id` $\rightarrow$ `invoices.id`, `payer_id` $\rightarrow$ `insurance_payers.id` |
| **`clinical_documents`**| `clinical` | **DENIED** | **DENIED** | Clinical confidentiality protection |

---

## 3. Revenue Cycle Management (RCM) Lifecycle

```text
Clinical Encounter Occurs (Consultation, Lab, Bed, Procedure, Medication)
  │
  ▼
Charge Items Captured Automatically (`POSTED`)
  │
  ├── 1. Itemized Invoice Generated (`PENDING`)
  │
  ├── 2. Insurance Payer Verification & Adjudication (`CLAIM_SUBMITTED`)
  │     ├── Copay / Deductible calculated
  │     └── Primary/Secondary payer coverage applied
  │
  ├── 3. Patient Payment Collection (Cash, Card, UPI, Insurance)
  │
  └── 4. Invoice Finalized & Receipt Issued (`PAID`)
```

---

## 4. Dashboard Mechanics & Step-by-Step Flow

### A. Billing Command Desk (`/billing/dashboard`)
1. **Initial Rendering & Data Queries**:
   - `GET /api/v1/billing/summary/today` $\rightarrow$ Calculates Today's Total Collections, Pending Invoices, Unbilled Clinical Encounters, and Insurance Claim Approval Rate.
   - `GET /api/v1/billing/payer-mix` $\rightarrow$ Visualizes cash vs. private insurance vs. government scheme breakdowns.
2. **Invoicing & Checkout Flow**:
   - Patient arrives at billing desk upon discharge $\rightarrow$ Billing staff reviews auto-posted charges (bed stay, medications, lab tests, doctor fees).
   - Clicking **Generate Invoice** executes `POST /api/v1/invoices` and applies insurance policy coverage.
   - Recording payment via `POST /api/v1/payments` updates `invoice.status = PAID` and clears the discharge financial hold.

---

## 5. Dedicated Subpages & Financial Operations

### A. Invoices & Charge Capture (`/billing/invoices`)
- Generate itemized invoices combining room/bed charges, doctor consultation fees, diagnostic lab tests, and medications.
- Apply organization price lists and contractual insurance discounts.

### B. Payment Processing (`/billing/payments`)
- Record split payments, deposit advance payments for inpatient admissions, and process authorized refunds.
- Generate and print official receipts with tax breakdown.

### C. Insurance Claims & Authorizations (`/billing/claims`)
- Submit electronic insurance claims to third-party payers and government schemes (e.g. PM-JAY).
- Track claim status: `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `PAID`.
