# Sentinel EHR Role-Based & Attribute-Based Access Control (RBAC + ABAC) Specification

This document defines the production-grade **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** matrix and security architecture operating across the **Sentinel EHR Platform**.

---

## 🎯 Dual-Model Security Architecture Overview

Sentinel implements a **Dual-Scope Security Architecture** designed for two distinct operational models:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SENTINEL SECURITY ENGINE                                  │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│   MODEL 1: OUTPATIENT APPOINTMENT SCOPE   │     MODEL 2: INPATIENT HOSPITALCARE SCOPE  │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Applies to Appointment Queue & OPD      │ • Applies to Inpatient Wards & ICUs        │
│ • Role-Based Clinic Staff Authorization   │ • Strict Attribute-Based Access Control    │
│ • Allows on-duty Doctors, Nurses, &      │ • Requires Care Team Assignment OR         │
│   Receptionists to process queue visits   │   Matching Ward Department OR Break-Glass  │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

1. **Model 1: Outpatient Clinic Appointment Scope**:
   - Authorized on-duty clinical staff (`ROLE_DOCTOR`, `ROLE_NURSE`, `ROLE_RECEPTIONIST`, `ROLE_ADMIN`, `ROLE_SYS_ADMIN`) are granted access to process outpatient appointment queues, conduct desk check-ins, record triage vitals, document consultation progress notes, order eRx/labs, and finalize billing.
2. **Model 2: Inpatient Hospitalization Care Scope (ABAC)**:
   - Evaluates **runtime contextual attributes** (care team assignment in `PatientAssignmentRepository`, ward department matching `currentUser.getDepartment() == patient.getDepartment()`, or emergency break-glass override) before granting access to inpatient Protected Health Information (PHI) and FHIR resources.

---

## 👥 The 10 Baseline System Roles

1. **System Administrator (`ROLE_SYS_ADMIN`)**: Platform-level infrastructure, tenant provisioning, system configurations, and cross-site audit monitoring.
2. **Organization / Clinic Administrator (`ROLE_ORG_ADMIN`)**: Hospital or clinic facility administrator. Manages clinic users, provider schedules, facility departments, and billing configurations.
3. **Doctor / Physician (`ROLE_DOCTOR`)**: Attending/consulting physician. Full clinical authority over diagnoses, clinical notes, order entry (multi-eRx, multi-lab orders), care plans, and medical history.
4. **Nurse (`ROLE_NURSE`)**: Registered nurse or clinical care provider. Responsible for desk check-in intake, triage vitals flowsheets (`CHECKED_IN` $\rightarrow$ `TRIAGED`), nursing progress notes, eMAR medication administration, and care plans.
5. **Receptionist (`ROLE_RECEPTIONIST`)**: Patient intake and front-desk coordinator. Manages demographics, desk check-in (`SCHEDULED` $\rightarrow$ `CHECKED_IN`), appointment scheduling, insurance verification, and billing.
6. **Lab Technician (`ROLE_LAB_TECH`)**: Laboratory specialist. Processes diagnostic specimens, enters lab test results, and manages lab equipment orders.
7. **Pharmacist (`ROLE_PHARMACIST`)**: Clinical pharmacist. Reviews eRx orders, performs drug-allergy & drug-drug reconciliation, and dispenses medications.
8. **Billing Officer (`ROLE_BILLING`)**: Financial and revenue cycle specialist. Creates invoices, processes insurance claims, records patient payments, and generates financial compliance reports.
9. **Patient (`ROLE_PATIENT`)**: Individual health recipient. Accesses self-service portal to view personal medical history, vitals, lab reports, eRx history, and manage appointments/consent.
10. **Auditor / Compliance Officer (`ROLE_AUDITOR`)**: Independent HIPAA compliance auditor. Read-only inspection access to immutable WORM audit logs, security reports, and access logs.

---

## 1. Permission Legend

| Symbol | Meaning | Description |
| :--- | :--- | :--- |
| **C** | Create | Permission to create new records (e.g., issue new prescription). |
| **R** | Read | Permission to view or retrieve record details. |
| **U** | Update | Permission to modify existing non-locked record fields. |
| **D** | Delete | Hard deletion (generally restricted in EHRs; soft-deletion or amendment preferred). |
| **CRU** | Create + Read + Update | Standard workflow authority without permanent hard delete privileges. |
| **CRUD** | Full CRUD | Complete CRUD privileges (reserved for non-clinical setup metadata). |
| **—** | No Access | Explicitly forbidden / blocked. |

---

## 2. Appointment & Consultation Matrix (Model 1)

| Action / Endpoint | Sys Admin | Org Admin | Doctor | Nurse | Receptionist | Lab Tech | Pharmacist | Billing | Patient | Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Schedule Appointment | CRU | CRU | CRU | CRU | **CRU** | — | — | — | **C (Self)** | R |
| Desk Check-In (`CHECKED_IN`) | U | U | U | U | **U** | — | — | — | — | R |
| Nurse Triage Vitals (`TRIAGED`) | U | U | U | **CRU** | — | — | — | — | — | R |
| Start Consultation (`IN_CONSULTATION`) | U | U | **U** | — | — | — | — | — | — | R |
| Record Doctor Consultation (Notes, eRx, Labs) | U | U | **CRU** | — | — | — | — | — | — | R |
| Generate Visit Billing Invoice | CRU | CRU | **CRU** | — | CRU | — | — | **CRU** | — | R |

---

## 3. Inpatient Clinical Record Matrix (Model 2 ABAC)

| Clinical Resource | Sys Admin | Org Admin | Doctor | Nurse | Receptionist | Lab Tech | Pharmacist | Billing | Patient | Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Medical History | — | L | **CRU (ABAC)** | R | — | L | L | — | R | R |
| Documented Allergies | — | L | **CRU (ABAC)** | R/U | — | L | R | — | R/U | R |
| Active Diagnoses | — | — | **CRU (ABAC)** | R | — | L | R | — | R | R |
| Physician Notes (SOAP) | — | — | **CRU (ABAC)** | CRU | — | — | — | — | R | R |
| Nursing Flowsheets | — | — | R | **CRU (ABAC)** | — | — | — | — | R | R |
| Prescriptions (eRx) | — | — | **CRU (ABAC)** | R | — | — | **CRU** | — | R | R |

---

## 4. Security Evaluator Implementation (Spring Security SpEL)

```java
@Component("patientSecurityService")
public class PatientSecurityService {

    // Model 1: Outpatient Clinic Appointment Evaluator
    public boolean canAccessAppointment(Authentication authentication, Long appointmentId) {
        if (authentication == null || !authentication.isAuthenticated() || appointmentId == null) return false;

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // On-duty clinical and administrative staff access outpatient clinic appointment queue
        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_DOCTOR") ||
            authorities.contains("ROLE_NURSE") || authorities.contains("ROLE_RECEPTIONIST") ||
            authorities.contains("ROLE_AUDITOR")) {
            return true;
        }

        return canAccessPatient(authentication, patientId);
    }

    // Model 2: Inpatient Hospitalization Care ABAC Evaluator
    public boolean canAccessPatient(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) return false;
        return abacEvaluator.hasTreatmentRelationship(authentication, patientId);
    }
}
```

---

## 🔗 Related Documentation

- [System Architecture](file:///mnt/workspace/Sentinel-EHR/docs/architecture/system-architecture-spec.md)
- [Clinical Workflows Specification](file:///mnt/workspace/Sentinel-EHR/docs/clinical/clinical-workflows-spec.md)
- [Security & Compliance Specification](file:///mnt/workspace/Sentinel-EHR/docs/security-compliance/security-compliance-spec.md)
- [Doctor Workspace Specification](file:///mnt/workspace/Sentinel-EHR/docs/workspaces/doctor-workspace-spec.md)
