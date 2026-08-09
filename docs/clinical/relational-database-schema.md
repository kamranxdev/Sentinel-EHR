# MedVault Database Schema & Entity Relationship Guide

This document provides a comprehensive reference for MedVault's relational database schema, entity relationships, security tables, and data model design decisions.

---

## 💡 Hospital Analogy Mapping

MedVault's database is organized like a large hospital's physical filing system:

- **`users` table** → Staff Directory — contains every employee (doctors, nurses, admins, auditors) and credentials.
- **`roles` & `user_roles` tables** → Badge Access List — maps staff members to assigned role definitions.
- **`permissions` & `role_permissions` tables** → Detailed Permission Matrix — fine-grained authority keys (e.g., `PRESCRIPTION_CREATE`, `VITALS_READ`).
- **`departments` & `patient_assignments` tables** → Care Roster & Facility Assignment — maps staff and patients to departments and active care teams.
- **`abac_policies` table** → Policy Rules Registry — SpEL policies enforcing context-based authorization constraints.
- **`patients` table** → Master Patient Index (MPI) — central registry of patient identity, demographics, insurance, and medical alerts.
- **`encounters` table** → Visit Log Book — records patient check-ins (outpatient, inpatient, emergency).
- **`vitals` table** → Bedside Telemetry Flowsheet — time-stamped vital sign recordings.
- **`prescriptions` table** → Pharmacy Order Pad — eRx orders with dosage, frequency, and RxNorm coding.
- **`allergies` table** → Red Wristband Register — documented allergens triggering safety alerts before orders.
- **`diagnoses` table** → Problem List Binder — active/chronic conditions coded in ICD-10 and SNOMED-CT.
- **`audit_logs` table** → Black Box Vault — immutable, append-only record of system actions for HIPAA § 164.312 compliance.

---

## 🗄️ Comprehensive Entity Relationship Diagram

```mermaid
erDiagram
    ROLES {
        BIGINT id PK
        VARCHAR name UK "ROLE_SYS_ADMIN, ROLE_DOCTOR, etc."
        VARCHAR description
    }

    PERMISSIONS {
        BIGINT id PK
        VARCHAR code UK "PATIENT_READ, PRESCRIPTION_CREATE, etc."
        VARCHAR category "PATIENT, CLINICAL, BILLING, SYSTEM"
        VARCHAR description
    }

    ROLE_PERMISSIONS {
        BIGINT role_id FK
        BIGINT permission_id FK
    }

    USERS {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password "BCrypt hashed"
        VARCHAR email UK
        VARCHAR full_name
        VARCHAR specialization
        BIGINT department_id FK
        TIMESTAMP created_at
    }

    USER_ROLES {
        BIGINT user_id FK
        BIGINT role_id FK
    }

    DEPARTMENTS {
        BIGINT id PK
        VARCHAR name UK "CARDIOLOGY, EMERGENCY, ONCOLOGY"
        VARCHAR code UK "CARD, EMG, ONC"
        BIGINT facility_id FK
    }

    PATIENT_ASSIGNMENTS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT staff_user_id FK
        VARCHAR assignment_type "ATTENDING_PHYSICIAN, ASSIGNED_NURSE"
        TIMESTAMP start_date
        TIMESTAMP end_date
    }

    ABAC_POLICIES {
        BIGINT id PK
        VARCHAR policy_name UK
        VARCHAR target_resource
        VARCHAR action
        VARCHAR spel_expression
    }

    PATIENTS {
        BIGINT id PK
        VARCHAR patient_code UK "PAT-1001"
        VARCHAR ssn
        VARCHAR abha_id
        VARCHAR full_name
        DATE date_of_birth
        VARCHAR gender
        VARCHAR blood_type
        VARCHAR phone
        VARCHAR email
        VARCHAR address
        VARCHAR emergency_contact
        VARCHAR insurance_provider
        BIGINT user_id FK
    }

    ENCOUNTERS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_user_id FK
        VARCHAR encounter_type "OUTPATIENT, INPATIENT, EMERGENCY"
        VARCHAR status "SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"
        TIMESTAMP start_time
        TIMESTAMP end_time
        VARCHAR chief_complaint
    }

    VITALS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        BIGINT recorded_by_user_id FK
        DOUBLE blood_pressure_systolic
        DOUBLE blood_pressure_diastolic
        DOUBLE heart_rate
        DOUBLE respiratory_rate
        DOUBLE body_temperature
        DOUBLE oxygen_saturation
        TIMESTAMP recorded_at
    }

    PRESCRIPTIONS {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT doctor_user_id FK
        BIGINT encounter_id FK
        VARCHAR medication_name
        VARCHAR dosage
        VARCHAR frequency
        VARCHAR status "ACTIVE, DISCONTINUED, COMPLETED"
        TIMESTAMP prescribed_at
    }

    ALLERGIES {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR allergen
        VARCHAR reaction_severity "MILD, MODERATE, SEVERE, ANAPHYLACTIC"
        VARCHAR allergy_type "DRUG, FOOD, ENVIRONMENTAL"
        TIMESTAMP recorded_at
    }

    DIAGNOSES {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        VARCHAR icd10_code
        VARCHAR description
        VARCHAR status "ACTIVE, RESOLVED, CHRONIC"
        TIMESTAMP recorded_at
    }

    AUDIT_LOGS {
        BIGINT id PK
        VARCHAR username
        VARCHAR action
        VARCHAR resource_type
        VARCHAR resource_id
        VARCHAR client_ip
        TIMESTAMP timestamp
        TEXT details
    }

    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    ROLES ||--o{ ROLE_PERMISSIONS : grants
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : linked
    DEPARTMENTS ||--o{ USERS : employs
    PATIENTS ||--o{ PATIENT_ASSIGNMENTS : assigned_to
    USERS ||--o{ PATIENT_ASSIGNMENTS : cares_for
    USERS ||--o| PATIENTS : linked_profile
    PATIENTS ||--o{ ENCOUNTERS : attends
    USERS ||--o{ ENCOUNTERS : conducts
    PATIENTS ||--o{ VITALS : has
    ENCOUNTERS ||--o{ VITALS : includes
    PATIENTS ||--o{ PRESCRIPTIONS : prescribed
    ENCOUNTERS ||--o{ PRESCRIPTIONS : contains
    PATIENTS ||--o{ ALLERGIES : records
    PATIENTS ||--o{ DIAGNOSES : diagnosed
    ENCOUNTERS ||--o{ DIAGNOSES : notes
```

---

## 🔗 Related Documentation

- [System Architecture](file:///mnt/workspace/MedVault/docs/architecture/system-architecture-spec.md)
- [Clinical Workflows](file:///mnt/workspace/MedVault/docs/clinical/clinical-workflows-spec.md)
- [Security & HIPAA Compliance](file:///mnt/workspace/MedVault/docs/security-compliance/security-hipaa-compliance-spec.md)
- [Software Audit Report](file:///mnt/workspace/MedVault/docs/audit/software-audit-report.md)
