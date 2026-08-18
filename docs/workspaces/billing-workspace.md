# Billing & Financial Management Workspace Specification

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

## 2. Revenue Cycle Management (RCM) Lifecycle

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

## 3. Dedicated Workspace Subpages

### A. Billing Command Desk (`/billing/dashboard`)
- Financial KPIs: Total Today's Revenue, Outstanding Invoices, Pending Claims, and Unbilled Charges.
- Payer mix breakdown (Cash, Private Insurance, Government / ABDM Schemes).

### B. Invoices & Charge Capture (`/billing/invoices`)
- Generate itemized invoices combining room/bed charges, doctor consultation fees, diagnostic lab tests, and medications.
- Apply organization price lists and contractual insurance discounts.

### C. Payment Processing (`/billing/payments`)
- Record split payments, deposit advance payments for inpatient admissions, and process refunds.

### D. Insurance Claims & Authorizations (`/billing/claims`)
- Submit electronic insurance claims to third-party payers.
- Track claim status: `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `PAID`.
