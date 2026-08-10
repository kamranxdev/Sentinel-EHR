# Sentinel EHR Role-Based & Attribute-Based Access Control (RBAC + ABAC) Specification

This document defines the production-grade **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** matrix and security architecture for the **Sentinel EHR Platform**.

---

## 🎯 Architectural Overview

In a modern enterprise Electronic Health Record (EHR) system, access control cannot rely solely on simple top-level roles (e.g., `Doctor = full access`). Sentinel implements a **Hybrid RBAC + ABAC Security Model**:

1. **Role-Based Access Control (RBAC)**: Defines **what coarse-grained actions** a role is generally authorized to perform (e.g., `Doctor` can `CREATE_PRESCRIPTION`, `Nurse` can `RECORD_VITALS`).
2. **Attribute-Based Access Control (ABAC)**: Evaluates **runtime contextual attributes** (e.g., treatment relationship, care team assignment, department match, facility location, time of access, and Purpose of Use) before granting access to a specific patient's Protected Health Information (PHI).

---

## 👥 The 10 Baseline System Roles

Sentinel categorizes operations across **10 production roles**:

1. **System Administrator (`ROLE_SYS_ADMIN`)**: Platform-level infrastructure, tenant provisioning, system configurations, and cross-site audit monitoring. No direct clinical record edit access.
2. **Organization / Clinic Administrator (`ROLE_ORG_ADMIN`)**: Hospital or clinic facility administrator. Manages clinic users, provider schedules, facility departments, and billing configurations.
3. **Doctor / Physician (`ROLE_DOCTOR`)**: Attending/consulting physician. Full clinical authority over diagnosis, clinical notes, order entry (eRx, labs), care plans, and medical history.
4. **Nurse (`ROLE_NURSE`)**: Registered nurse or clinical care provider. Responsible for patient triage, vitals flowsheets, nursing progress notes, medication administration, and care plan updates.
5. **Receptionist (`ROLE_RECEPTIONIST`)**: Patient intake and front-desk coordinator. Manages demographics, check-in, appointment scheduling, insurance verification, and basic invoicing.
6. **Lab Technician (`ROLE_LAB_TECH`)**: Laboratory specialist. Processes diagnostic specimens, enters lab test results, manages lab equipment orders, and uploads clinical diagnostic documents.
7. **Pharmacist (`ROLE_PHARMACIST`)**: Clinical pharmacist. Reviews eRx orders, performs drug-allergy & drug-drug reconciliation, dispenses medications, and logs administration history.
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
| **L** | Limited Access | Access restricted to specific fields, departmental bounds, or self-service boundaries. |
| **A** | Approve / Authorize | Special authority to verify, countersign, or authorize pending actions. |

---

## 2. Patient & Demographic Matrix

| Resource / Action | Sys Admin | Org Admin | Doctor | Nurse | Receptionist | Lab Tech | Pharmacist | Billing | Patient | Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Create Patient | — | CRU | C | C | **CRU** | — | — | — | — | — |
| View Demographics | — | R | R | R | **R** | R | R | R | **R** | R |
| Update Demographics | — | U | L | L | **U** | — | — | L | U* | — |
| Delete Patient | — | — | — | — | — | — | — | — | — | — |
| Patient Identifier (MRN/ABHA/National ID) | — | R | R | R | R | R | R | R | R | R |
| Emergency Contact | — | R | R | R | R | L | L | L | U | R |
| Insurance Information | — | R | R | R | **CRU** | — | — | **CRU** | R | R |
| Patient Consent Directives | — | R | R | R | CRU | R | R | R | **CRU** | R |

---

## 3. Clinical Record Matrix

| Clinical Resource | Sys Admin | Org Admin | Doctor | Nurse | Receptionist | Lab Tech | Pharmacist | Billing | Patient | Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Medical History | — | L | **CRU** | R | — | L | L | — | R | R |
| Documented Allergies | — | L | **CRU** | R/U | — | L | R | — | R/U | R |
| Active Diagnoses | — | — | **CRU** | R | — | L | R | — | R | R |
| Physician Notes (SOAP) | — | — | **CRU** | CRU | — | — | — | — | R | R |
| Nursing Notes | — | — | R | **CRU** | — | — | — | — | R | R |
| Vital Signs | — | — | R/U | **CRU** | — | — | — | — | R | R |
| Prescriptions (eRx) | — | — | **CRU** | R | — | — | **CRU** | — | R | R |

---

## 4. Contextual ABAC SpEL Evaluator Logic

```java
@Component("abacSecurityEvaluator")
public class AbacSecurityEvaluator implements PermissionEvaluator {

    // Evaluates whether staff user has active treatment relationship or break-glass override
    public boolean hasTreatmentRelationship(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        
        // System Admin and Compliance Auditors bypass relationship check for non-clinical audit
        if (hasRole(authentication, "ROLE_SYS_ADMIN") || hasRole(authentication, "ROLE_AUDITOR")) {
            return true;
        }

        String username = authentication.getName();
        return assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(patientId, username)
               || isEmergencyBreakGlassActive(authentication, patientId);
    }
}
```

---

## 🔗 Related Documentation

- [System Architecture](file:///mnt/workspace/Sentinel/docs/architecture/system-architecture-spec.md)
- [Clinical Workflows](file:///mnt/workspace/Sentinel/docs/clinical/clinical-workflows-spec.md)
- [Security & HIPAA Compliance](file:///mnt/workspace/Sentinel/docs/security-compliance/security-hipaa-compliance-spec.md)
- [Software Audit Report](file:///mnt/workspace/Sentinel/docs/audit/software-audit-report.md)
