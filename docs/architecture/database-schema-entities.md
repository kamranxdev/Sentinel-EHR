# Database Schema & Entity Specification

## 1. Entity-Relationship Overview

Sentinel-EHR uses a normalized relational PostgreSQL 16 schema designed for high transactional consistency, auditability, and multi-tenant partitioning.

```text
┌──────────────────┐       ┌────────────────────────┐       ┌────────────────────┐
│  organizations   │◄──────┤       facilities       │◄──────┤    departments     │
└────────┬─────────┘       └───────────┬────────────┘       └─────────┬──────────┘
         │                             │                              │
         │                             │                              ▼
         │                             │                    ┌────────────────────┐
         │                             │                    │       wards        │
         │                             │                    └─────────┬──────────┘
         │                             │                              │
         │                             │                              ▼
         │                             │                    ┌────────────────────┐
         │                             │                    │       rooms        │
         │                             │                    └─────────┬──────────┘
         │                             │                              │
         │                             │                              ▼
         │                             │                    ┌────────────────────┐
         │                             │                    │       beds         │
         │                             │                    └─────────┬──────────┘
         │                             │                              │
         ▼                             ▼                              ▼
┌──────────────────┐       ┌────────────────────────┐       ┌────────────────────┐
│      users       │       │        patients        │◄──────┤   encounters       │
└────────┬─────────┘       └───────────┬────────────┘       └─────────┬──────────┘
         │                             │                              │
         ▼                             │                              ▼
┌──────────────────┐                   │                    ┌────────────────────┐
│  practitioners   │                   │                    │     vitals         │
└──────────────────┘                   │                    ├────────────────────┤
                                       │                    │   prescriptions    │
                                       │                    ├────────────────────┤
                                       │                    │     lab_orders     │
                                       │                    ├────────────────────┤
                                       │                    │   diagnoses        │
                                       │                    └────────────────────┘
                                       ▼
                           ┌────────────────────────┐
                           │   break_glass_records  │
                           ├────────────────────────┤
                           │      audit_logs        │
                           └────────────────────────┘
```

---

## 2. Core Domain Tables & Fields

### A. Identity & Tenancy
1. **`organizations`**: Root tenant boundary.
   - `id` (UUID PK), `code` (VARCHAR unique), `name` (VARCHAR), `status` (ACTIVE/SUSPENDED), `created_at`, `updated_at`.
2. **`facilities`**: Hospital campus or physical branch.
   - `id` (UUID PK), `organization_id` (FK), `code` (VARCHAR), `name` (VARCHAR), `address` (TEXT), `phone` (VARCHAR).
3. **`users`**: Login credentials and global identity.
   - `id` (UUID PK), `organization_id` (FK), `username` (VARCHAR unique), `email` (VARCHAR unique), `password_hash` (VARCHAR), `full_name` (VARCHAR), `role` (VARCHAR: PHYSICIAN, NURSE, LAB_TECHNICIAN, RECEPTIONIST, ORGANIZATION_ADMIN, SUPER_ADMIN), `is_active` (BOOLEAN).
4. **`practitioners`**: Clinical credentials and license.
   - `id` (UUID PK), `user_id` (FK unique), `organization_id` (FK), `license_number` (VARCHAR), `specialty` (VARCHAR), `qualification` (VARCHAR), `status` (ACTIVE/INACTIVE).

---

### B. Patient Identity & MPI
1. **`patients`**: Master patient identity.
   - `id` (UUID PK), `organization_id` (FK), `patient_code` / MRN (VARCHAR unique per org), `first_name` (VARCHAR), `last_name` (VARCHAR), `date_of_birth` (DATE), `gender` (MALE/FEMALE/OTHER), `blood_type` (A+, B+, O+, AB+, etc.), `national_id` (VARCHAR), `abha_number` (VARCHAR), `phone` (VARCHAR), `email` (VARCHAR), `address` (TEXT), `status` (ACTIVE/DECEASED/MERGED).
2. **`mpi_audit_records`**: Record of Master Patient Index deduplication and merges.
   - `id` (UUID PK), `primary_patient_id` (FK), `duplicate_patient_id` (FK), `merge_reason` (TEXT), `merged_by` (FK users), `created_at` (TIMESTAMP).

---

### C. Spatial Ward & Bed Management (ADT)
1. **`wards`**: Clinical wards (e.g. Ward 3A, ICU).
   - `id` (UUID PK), `organization_id` (FK), `department_id` (FK), `ward_name` (VARCHAR), `ward_type` (GENERAL, ICU, SURGICAL, MATERNITY), `capacity` (INT).
2. **`rooms`**: Physical rooms within a ward.
   - `id` (UUID PK), `ward_id` (FK), `room_number` (VARCHAR), `room_type` (SINGLE, DOUBLE, QUAD, NEGATIVE_PRESSURE).
3. **`beds`**: Individual spatial inpatient beds.
   - `id` (UUID PK), `organization_id` (FK), `room_id` (FK), `ward_id` (FK), `bed_number` / `bed_code` (VARCHAR), `status` (AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE), `current_encounter_id` (FK encounters nullable).

---

### D. Encounters & Clinical Core
1. **`encounters`**: Clinical care episodes.
   - `id` (UUID PK), `patient_id` (FK), `organization_id` (FK), `encounter_type` (OUTPATIENT, INPATIENT, EMERGENCY), `status` (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED), `chief_complaint` (TEXT), `admit_date` (TIMESTAMP), `discharge_date` (TIMESTAMP nullable), `primary_practitioner_id` (FK practitioners).
2. **`vitals`**: Physiological measurements.
   - `id` (UUID PK), `encounter_id` (FK), `patient_id` (FK), `systolic_bp` (INT), `diastolic_bp` (INT), `heart_rate` (INT), `temperature` (DECIMAL), `respiratory_rate` (INT), `oxygen_saturation` (INT), `blood_glucose` (INT), `pain_score` (INT 0-10), `bmi` (DECIMAL), `news2_score` (INT), `recorded_by` (FK users), `recorded_at` (TIMESTAMP).
3. **`diagnoses`**: Problem list & encounter diagnoses.
   - `id` (UUID PK), `encounter_id` (FK), `patient_id` (FK), `icd10_code` (VARCHAR), `description` (TEXT), `category` (PRIMARY, SECONDARY, DIFFERENTIAL), `status` (ACTIVE, RESOLVED), `diagnosed_by` (FK practitioners), `diagnosed_at` (TIMESTAMP).

---

### E. Pharmacy & eMAR
1. **`prescriptions`**: Physician medication orders.
   - `id` (UUID PK), `encounter_id` (FK), `patient_id` (FK), `prescribing_doctor_id` (FK practitioners), `medication_name` (VARCHAR), `dosage` (VARCHAR), `route` (ORAL, IV, IM, TOPICAL), `frequency` (BID, TID, QID, PRN, STAT), `start_date` (DATE), `end_date` (DATE), `status` (ACTIVE, COMPLETED, DISCONTINUED), `instructions` (TEXT).
2. **`medication_administrations`**: Nursing eMAR administration records.
   - `id` (UUID PK), `prescription_id` (FK), `encounter_id` (FK), `patient_id` (FK), `administered_by` (FK users: Nurse), `administered_at` (TIMESTAMP), `status` (GIVEN, NOT_GIVEN, REFUSED, HELD), `reason_not_given` (TEXT nullable), `dose_given` (VARCHAR).

---

### F. Laboratory Information System (LIS)
1. **`lab_orders`**: Doctor diagnostic test requests.
   - `id` (UUID PK), `encounter_id` (FK), `patient_id` (FK), `order_number` (VARCHAR unique), `test_name` (VARCHAR), `priority` (ROUTINE, URGENT, STAT), `status` (ORDERED, SPECIMEN_COLLECTED, ACCESSIONED, PROCESSING, COMPLETED, CANCELLED), `ordering_physician_id` (FK).
2. **`specimens`**: Collected patient biological samples.
   - `id` (UUID PK), `lab_order_id` (FK), `specimen_type` (BLOOD, URINE, CSF, TISSUE), `barcode` (VARCHAR unique), `collected_at` (TIMESTAMP), `collected_by` (FK users).
3. **`lab_results`**: Quantitative and qualitative test values.
   - `id` (UUID PK), `lab_order_id` (FK), `parameter_name` (VARCHAR), `measured_value` (VARCHAR), `unit` (VARCHAR), `reference_range` (VARCHAR), `is_critical` (BOOLEAN), `validated_by` (FK users: Lab Tech / Pathologist), `validated_at` (TIMESTAMP).

---

### G. Security, Break-Glass & Auditing
1. **`break_glass_records`**: Emergency clinical access overrides.
   - `id` (UUID PK), `patient_id` (FK), `user_id` (FK), `organization_id` (FK), `category` (EMERGENCY_TREATMENT, LIFE_THREATENING, DIRECT_CONSULTATION), `justification` (TEXT), `requested_at` (TIMESTAMP), `expires_at` (TIMESTAMP), `status` (ACTIVE, EXPIRED, REVOKED), `client_ip` (VARCHAR).
2. **`audit_logs`**: WORM immutable audit trail.
   - `id` (UUID PK), `organization_id` (FK), `user_id` (UUID), `action` (READ, CREATE, UPDATE, DELETE, BREAK_GLASS), `resource_type` (PATIENT, ENCOUNTER, LAB_RESULT, ERX), `resource_id` (VARCHAR), `client_ip` (VARCHAR), `timestamp` (TIMESTAMP), `status` (SUCCESS, DENIED).
