# MedVault REST API & Interoperability Specification

This document provides a reference for the **MedVault EHR REST APIs**, HL7 FHIR R4 interoperability endpoints, authentication headers, error codes, and JSON request/response formats.

---

## 🔐 Base URL & Headers

- **Base Endpoint**: `/api/v1` (with fallback `/api/*` compatibility mappings)
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type**: `application/json`

---

## 📡 Key REST Endpoints Matrix

| Domain | Method | Path | Description | Required Role/Permission |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT token | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Self-register patient portal account | Public |
| **Patients** | `GET` | `/api/v1/patients` | Retrieve Master Patient Index roster | `PATIENT_READ` |
| **Patients** | `GET` | `/api/v1/patients/{id}` | Fetch patient demographic profile | ABAC Treatment Check |
| **Patients** | `GET` | `/api/v1/patients/{id}/clinical-history` | Fetch complete longitudinal history | `CLINICAL_NOTE_READ` + ABAC |
| **Vitals** | `POST` | `/api/v1/vitals` | Record vital signs flowsheet entry | `VITALS_CREATE` |
| **Vitals** | `GET` | `/api/v1/vitals/patient/{patientId}` | Retrieve vital sign recordings | `VITALS_READ` + ABAC |
| **Prescriptions**| `POST` | `/api/v1/prescriptions` | Issue new eRx with safety check | `PRESCRIPTION_CREATE` + ABAC |
| **Prescriptions**| `POST` | `/api/v1/prescriptions/safety-check` | Validate RxNorm drug-allergy safety | `PRESCRIPTION_CREATE` |
| **Audit** | `GET` | `/api/v1/audit/logs` | Query WORM compliance audit vault | `ROLE_AUDITOR` / `ROLE_SYS_ADMIN` |
| **FHIR R4** | `GET` | `/api/v1/fhir/Patient/{id}` | Export FHIR R4 Patient Resource JSON | `PATIENT_READ` + ABAC |
| **FHIR R4** | `GET` | `/api/v1/fhir/Observation` | Export FHIR R4 Vitals/Labs | `VITALS_READ` + ABAC |
| **Synthea** | `POST` | `/api/v1/synthea/generate` | Trigger synthetic patient generator | `ROLE_SYS_ADMIN` |

---

## 🔗 Related Documentation

- [System Architecture](file:///mnt/workspace/MedVault/docs/architecture/system-architecture-spec.md)
- [Clinical Workflows](file:///mnt/workspace/MedVault/docs/clinical/clinical-workflows-spec.md)
- [Synthea Pipeline Guide](file:///mnt/workspace/MedVault/docs/interoperability/synthea-pipeline-integration.md)
- [Software Audit Report](file:///mnt/workspace/MedVault/docs/audit/software-audit-report.md)
