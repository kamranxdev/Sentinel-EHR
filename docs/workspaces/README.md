# Role-Based Workspaces Index

Sentinel-EHR provides tailored, highly optimized workspaces for every hospital role, adhering strictly to the **Principle of Least Privilege** and contextual ABAC scoping.

---

## 🏥 Clinical & Administrative Role Workspaces (All 10 Roles)

1. [**Physician Workspace**](./physician-workspace.md)
   - Encounter-driven & assignment-driven clinical desk, outpatient queue, inpatient ward census & rounds, responsive 10-subsystem EHR chart, e-Prescribing with DDI checks, and emergency break-glass override.

2. [**Nurse Station Workspace**](./nurse-workspace.md)
   - Shift-driven & ward-scoped (`Ward 3A`, `07:00 – 15:00`), 4-stage outpatient triage queue with live NEWS2 & visual pain scale, spatial bed census, 5-Rights eMAR administration, I/O fluid balance, and SBAR shift handoffs.

3. [**Laboratory Technician Workspace**](./lab-technician-workspace.md)
   - Diagnostic LIS workflow: Requisition receipt, phlebotomy & specimen collection, barcode accessioning, analyzer processing, result validation, and critical value panic alerts.

4. [**Receptionist & Front-Desk Workspace**](./receptionist-workspace.md)
   - Master Patient Index (MPI) deduplication, new patient registration with MRN issuance, appointment scheduling, and OPD arrival check-in.

5. [**Organization Administrator Workspace**](./organization-admin-workspace.md)
   - Facility demographics, clinical staff roster & credentialing, spatial ward & bed topology provisioning, MPI duplicate governance, and facility schedule analytics.

6. [**Super Administrator Platform Workspace**](./super-admin-workspace.md)
   - Multi-tenant hospital network onboarding, global cross-tenant RBAC, network-wide MPI indexing, platform analytics, and ABDM/DPDP compliance ledger.

7. [**Pharmacist Clinical Workspace**](./pharmacist-workspace.md)
   - Inpatient and outpatient prescription clinical review, unit-dose dispensing, formulary stock management, and DDI interaction audits.

8. [**Billing & Revenue Cycle Workspace**](./billing-workspace.md)
   - Revenue Cycle Management (RCM), itemized invoicing, insurance claims submission, and multi-mode payment processing.

   - Immutable WORM audit trail surveillance, emergency break-glass override registry inspection, and regulatory compliance reporting (HIPAA, DPDP, NABH).

10. [**Patient Self-Service Portal**](./patient-workspace.md)
    - Patient health timeline, validated laboratory reports, active prescriptions, refill requests, and appointment self-booking.
