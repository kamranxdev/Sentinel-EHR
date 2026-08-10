# Sentinel REST API & Interoperability Specification

This document provides a reference for the **Sentinel EHR REST APIs**, HL7 FHIR R4 interoperability endpoints, authentication headers, error codes, and JSON request/response formats.

---

## 🔐 Base URL & Headers

- **Base Endpoint**: `/api/v1` (with fallback `/api/*` compatibility mappings)
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type**: `application/json`

---

## 📡 REST Endpoints Matrix

### 1. Authentication & Onboarding
| Method | Path | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT token | Public |
| `POST` | `/api/v1/auth/register` | Self-register patient portal account | Public |

### 2. Outpatient Appointment & Consultation Workflow (Model 1)
| Method | Path | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/appointments` | List appointments for user | `APPOINTMENT_READ` |
| `POST` | `/api/v1/appointments` | Schedule new outpatient appointment | `APPOINTMENT_CREATE` / `ROLE_PATIENT` |
| `POST` | `/api/v1/appointments/{id}/check-in` | Desk Check-In (`SCHEDULED` $\rightarrow$ `CHECKED_IN`) | `ROLE_RECEPTIONIST` / `ROLE_ADMIN` |
| `POST` | `/api/v1/appointments/{id}/triage-vitals` | Nurse Triage Vitals Intake (`CHECKED_IN` $\rightarrow$ `TRIAGED`) | `ROLE_NURSE` / `ROLE_ADMIN` |
| `POST` | `/api/v1/appointments/{id}/start-consultation` | Doctor Start Consultation (`TRIAGED` $\rightarrow$ `IN_CONSULTATION`) | `ROLE_DOCTOR` / `ROLE_ADMIN` |
| `POST` | `/api/v1/appointments/{id}/doctor-consultation` | Record SOAP notes, multi-diagnoses, multi-eRx, multi-lab orders | `ROLE_DOCTOR` / `ROLE_ADMIN` |
| `POST` | `/api/v1/appointments/{id}/billing` | Finalize visit invoice & complete appointment (`IN_CONSULTATION` $\rightarrow$ `COMPLETED`) | `ROLE_DOCTOR` / `ROLE_BILLING` / `ROLE_ADMIN` |
| `GET` | `/api/v1/appointments/{id}/notes` | Get appointment progress notes | Clinical / Admin Staff |

### 3. Patient EHR & Clinical History (Model 2 ABAC)
| Method | Path | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/patients` | Retrieve Master Patient Index roster | `PATIENT_READ` |
| `GET` | `/api/v1/patients/{id}` | Fetch patient demographic profile | ABAC Treatment Check |
| `GET` | `/api/v1/patients/{id}/clinical-history` | Fetch longitudinal clinical history | `CLINICAL_NOTE_READ` + ABAC |
| `POST` | `/api/v1/vitals` | Record vital signs flowsheet entry | `VITALS_CREATE` |
| `POST` | `/api/v1/prescriptions` | Issue new eRx with safety check | `PRESCRIPTION_CREATE` + ABAC |
| `POST` | `/api/v1/prescriptions/safety-check` | Validate RxNorm drug-allergy safety | `PRESCRIPTION_CREATE` |
| `GET` | `/api/v1/audit/logs` | Query WORM compliance audit vault | `ROLE_AUDITOR` / `ROLE_SYS_ADMIN` |

### 4. HL7 FHIR R4 Interoperability
| Method | Path | Description | Access Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/fhir/Patient/{id}` | Export FHIR R4 Patient Resource JSON | `PATIENT_READ` + ABAC |
| `GET` | `/api/v1/fhir/Observation` | Export FHIR R4 Vitals/Labs | `VITALS_READ` + ABAC |
| `GET` | `/api/v1/fhir/Encounter/{id}` | Export FHIR R4 Encounter Resource | `CLINICAL_NOTE_READ` + ABAC |

---

## 🔗 Related Documentation

- [System Architecture Specification](file:///mnt/workspace/Sentinel-EHR/docs/architecture/system-architecture-spec.md)
- [Clinical Workflows Specification](file:///mnt/workspace/Sentinel-EHR/docs/clinical/clinical-workflows-spec.md)
- [RBAC & ABAC Security Matrix](file:///mnt/workspace/Sentinel-EHR/docs/security-compliance/rbac-abac-security-matrix.md)
- [Synthea Pipeline Integration](file:///mnt/workspace/Sentinel-EHR/docs/interoperability/synthea-pipeline-integration.md)
