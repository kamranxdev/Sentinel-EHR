# Access Control, ABAC & Emergency Break-Glass Specification

## 1. Core Scoping Principle

In Sentinel-EHR, **Role $\neq$ Unrestricted Data Access**:

> **"A clinician or staff member is granted access to a patient record because they have a legitimate, active care relationship, shift assignment, or legal emergency mandate—never solely because they possess the role title."**

---

## 2. Policy Enforcement Pipeline

When a user initiates an action (e.g. `GET /api/v1/patients/P100/summary` or `POST /api/v1/prescriptions`):

```text
1. JWT Token Authentication
   ├── Is token valid & unexpired?
   └── Does user belong to active organization?
         │
         ▼
2. RBAC Policy Check (Role Capabilities)
   ├── Can role perform this functional action? (e.g. Can NURSE write diagnosis? -> DENY)
         │
         ▼
3. ABAC Contextual Scoping Check
   ├── Direct Patient Care Assignment (Practitioner is primary attending/consultant)
   ├── Active In-Progress Encounter (Practitioner or Nurse participating in encounter)
   ├── Spatial Ward / Shift Assignment (Nurse active in Ward 3A during 07:00-15:00 shift)
   ├── Lab / Order Processing Mandate (Lab Tech assigned to active diagnostic order)
   └── Active Emergency Break-Glass Lease (< 4 hours old for this patient)
         │
         ├── ALL PASS -> ALLOW
         └── ANY FAIL -> DENY
               │
               ▼
4. PostgreSQL Row-Level Security (RLS) Filter
5. WORM Audit Trail Record Generated
```

---

## 3. Role Scoping Comparison

| Role | Default Access Scope | Scoping Criteria |
| :--- | :--- | :--- |
| **PHYSICIAN** | Encounter-driven & Assignment-driven | Assigned outpatients + Inpatients under attending/consultant rounds |
| **NURSE** | Shift-driven, Ward-scoped & Assignment-driven | Admitted patients in assigned ward + Arrived triage outpatients |
| **LAB_TECHNICIAN** | Order-driven | Patients with active lab/diagnostic orders assigned to lab |
| **RECEPTIONIST** | Organization-scoped identity only | Patient demographics & appointments (NO access to clinical EHR chart) |
| **PATIENT** | Self-scoped only | Own personal health record, lab results, and appointments |

---

## 4. Emergency Break-Glass Protocol

In critical, life-threatening scenarios where a patient arrives unconscious or without pre-existing physician assignment:

```text
Clinician Discovers Patient -> Clicks Break-Glass Access -> Selects Category -> Enters Clinical Justification -> 4-Hour Time-Bounded Lease Granted -> Immutable Audit Log Recorded
```

### Technical Implementation:
- **Lease Duration**: Hard-coded 4-hour lease window.
- **Audit Logging**: Recorded in `break_glass_records` table with:
  - `user_id`, `patient_id`, `organization_id`
  - `category` (`LIFE_THREATENING_EMERGENCY`, `TRAUMA_RESUSCITATION`, `DIRECT_CONSULT_UNASSIGNED`)
  - `justification` (Mandatory min 20-character text)
  - `client_ip` and `requested_at`
- **Revocation**: Automatically expires after 240 minutes.
