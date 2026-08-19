# Backend Domain Packages & Architecture Specification

## 1. Architectural Overview & Request Lifecycle

Sentinel-EHR is structured into modular domain packages within Spring Boot 3 / Java 21, enforcing clean boundaries, multi-tenancy, Row-Level Security (RLS), and comprehensive WORM auditing.

```text
                               HTTP Request
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             1. SECURITY & TENANCY LAYER                │
       │  • JwtAuthenticationFilter (Token & Claims Validation) │
       │  • TenantContextHolder (Organization Scoping)          │
       │  • SentinelAuditInterceptor (Request Pre-Capture)      │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │              2. CONTROLLER LAYER (REST)                │
       │  • Request DTO Validation (@Valid)                     │
       │  • PreAuthorize Checks (@PreAuthorize("hasRole(...)")) │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │           3. DOMAIN SERVICE LAYER (Business)           │
       │  • ABAC Authorization Evaluator (Relationship Check)   │
       │  • Domain Business Rules & State Transitions           │
       │  • Cross-Package Events & Notifications                │
       └────────────────────────────┬───────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │            4. DATA PERSISTENCE & AUDIT LAYER           │
       │  • Spring Data JPA Repositories                        │
       │  • PostgreSQL RLS (tenant_id = current_tenant())       │
       │  • AuditLogAspect (Asynchronous WORM Event Capture)    │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Package-by-Package Deep Dive

### 1. `com.sentinel.identity` & `com.sentinel.tenancy`
* **Purpose**: Manages enterprise user identity, clinical practitioner credentials, and multi-tenant organizational structure.
* **Key Entities**:
  - `Organization`: Root tenant entity (Hospital / Clinic e.g. AIIMS Delhi, AIIMS Gorakhpur).
  - `Department`: Clinical unit (e.g. Cardiology, Emergency, Pathology).
  - `Ward`, `Room`, `Bed`: Spatial inpatient infrastructure.
  - `User`: Global login credentials, password hashes, email, and assigned roles.
  - `Practitioner`: Licensed clinician details (State license #, specialty, NPI, affiliations).
  - `UserOrganization`: Bridges users to organizations with tenant-scoped roles.
* **Key Services & Controllers**:
  - `UserService`, `UserController`: User account lifecycle, status updates, password resets.
  - `PractitionerService`, `PractitionerController`: Clinician credentialing and specialty assignments.
  - `OrganizationService`, `DepartmentService`, `BedService`: Tenant and spatial infrastructure provisioning.
* **Internal Data Flow**:
  1. `User` logs in $\rightarrow$ `AuthService` verifies credentials.
  2. `UserOrganization` resolves active tenant membership and roles.
  3. If user is a clinician, `Practitioner` record is loaded to attach licensing and specialty metadata to the session.

---

### 2. `com.sentinel.security` & `com.sentinel.tenancy`
* **Purpose**: Enforces authentication, authorization, multi-tenant context propagation, and emergency break-glass leases.
* **Key Components**:
  - `JwtAuthenticationFilter`: Extracts JWT, validates signature (RS256), extracts `userId`, `roles`, and `organizationId`.
  - `TenantContextHolder`: ThreadLocal storage of `tenantId` used by JPA and database connection pools.
  - `SentinelPermissionEvaluator`: Evaluates runtime ABAC permissions (e.g. `hasEncounterAccess(userId, encounterId)`).
  - `BreakGlassService`: Manages 4-hour emergency overrides with mandatory clinical justification and audit logging.
* **Internal Data Flow**:
  1. Request arrives $\rightarrow$ Filter validates token $\rightarrow$ Populates `SecurityContext` & `TenantContextHolder`.
  2. Controller method invokes `@PreAuthorize("hasPermission(#patientId, 'Patient', 'READ')")`.
  3. `SentinelPermissionEvaluator` evaluates direct care assignment, active ward shift, or active break-glass lease.

---

### 3. `com.sentinel.patient`
* **Purpose**: Master Patient Index (MPI), patient registration, demographics, contact info, and medical history.
* **Key Entities**:
  - `Patient`: Master record containing MRN, legal name, DOB, gender, blood type, ABHA ID.
  - `PatientDemographics`: Detailed residential, marital, and demographic attributes.
  - `PatientContact`: Next of kin, emergency contacts, legal guardians.
  - `PatientHistory`: Family history, past surgical history, social habits.
  - `MpiAuditRecord`: Audit log of duplicate detection scores and record merge operations.
* **Key Services & Controllers**:
  - `PatientService`, `PatientController`: Patient CRUD, clinical summary timeline.
  - `MpiService`, `MPIController`: Fuzzy matching algorithms (Levenshtein, Jaro-Winkler) and merge processing.
* **Internal Data Flow**:
  1. Receptionist inputs patient details $\rightarrow$ `MpiService.searchCandidates()` checks for existing duplicates.
  2. If clear, `PatientService.createPatient()` generates unique `patient_code` (MRN) scoped to tenant.

---

### 4. `com.sentinel.scheduling`
* **Purpose**: Manages doctor consultation schedules, appointments, time slot generation, and arrival queues.
* **Key Entities**:
  - `Appointment`: Consultation record with date, time, specialty, assigned doctor, status (`SCHEDULED`, `CHECKED_IN`, `TRIAGED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`).
  - `ScheduleSlot`: Available practitioner availability blocks.
* **Key Services & Controllers**:
  - `AppointmentService`, `AppointmentController`: Booking, cancellation, rescheduling, check-in.
  - `DoctorRecommendationService`: Matches patients with optimal doctors based on specialty and workload.
* **Internal Data Flow**:
  1. Receptionist books appointment $\rightarrow$ `Appointment` created with status `SCHEDULED`.
  2. Patient arrives at hospital $\rightarrow$ Receptionist marks `CHECKED_IN`.
  3. Appointment status updates $\rightarrow$ Appears in Nurse's triage queue.

---

### 5. `com.sentinel.clinical`
* **Purpose**: Core EHR engine handling encounters, admissions, discharges, transfers (ADT), diagnoses, vitals, clinical observations, nursing flowsheets, and clinical notes.
* **Key Entities**:
  - `Encounter`: Clinical episode (Outpatient, Inpatient, Emergency).
  - `Admission` & `Discharge`: Inpatient hospitalization lifecycle.
  - `CareTeam`: Multidisciplinary clinicians assigned to an encounter (Attending, Consultant, Primary Nurse).
  - `Vitals`: Physiological readings (BP, HR, Temp, Resp, SpO2, Glucose, BMI, NEWS2 score).
  - `Diagnosis`: ICD-10 coded problems (Primary, Secondary, Differential).
  - `ClinicalObservation`: Serial flowsheets (GCS, pain, pupil reactivity).
  - `ClinicalDocument`: SOAP notes, consultation summaries, discharge notes.
* **Key Services & Controllers**:
  - `EncounterService`, `EncounterController`: Episode management and active clinical context.
  - `VitalsService`, `VitalsController`: Vitals logging and automated NEWS2 calculation.
  - `DiagnosisService`, `DiagnosisController`: Problem list updates and ICD-10 search.
  - `TriageService`, `TriageController`: Outpatient and ER acuity scoring.

---

### 6. `com.sentinel.pharmacy`
* **Purpose**: Electronic prescribing (eRx), Drug-Drug Interaction (DDI) safety checks, and bedside Electronic Medication Administration Record (eMAR).
* **Key Entities**:
  - `Medication`: Master formulary drug catalog (Generic name, brand name, form, strength, ATC code).
  - `Prescription`: Physician order (Dosage, frequency, route, duration, instructions).
  - `MedicationAdministration`: eMAR record (Administered by nurse, timestamp, dose given, status: `GIVEN`, `REFUSED`, `HELD`, reason).
  - `SafetyCheckResult`: Pre-signing interaction evaluation.
* **Key Services & Controllers**:
  - `PrescriptionService`, `PrescriptionController`: eRx authoring, safety validation, status updates.
  - `MedicationAdministrationService`, `MedicationAdministrationController`: Nurse 5-rights bedside dose administration.
* **Internal Data Flow**:
  1. Physician creates eRx $\rightarrow$ `SafetyCheckService` evaluates DDI against active medications and patient allergies.
  2. If warnings confirmed/overridden $\rightarrow$ Prescription status `ACTIVE`.
  3. Medication appears on Nurse's bedside eMAR $\rightarrow$ Nurse verifies 5-rights and records dose `GIVEN`.

---

### 7. `com.sentinel.laboratory`
* **Purpose**: Laboratory Information System (LIS) handling orders, specimen collection, accessioning barcodes, analyzer interfaces, result entry, and critical panic alerts.
* **Key Entities**:
  - `LabOrder`: Doctor test requisition (Order number, test type, priority: `STAT`, `URGENT`, `ROUTINE`).
  - `Specimen`: Collected biological sample (Tube type, volume, barcode identifier).
  - `LabResult`: Measured parameters (Parameter name, measured value, units, reference range, critical flag).
* **Key Services & Controllers**:
  - `LabOrderService`, `LabOrderController`: Order creation and status tracking.
  - `SpecimenService`, `SpecimenController`: Phlebotomy collection and barcode generation.
  - `LabResultService`, `LabResultController`: Parameter entry, validation, and critical alert notification.
* **Internal Data Flow**:
  1. Doctor orders CBC $\rightarrow$ Lab tech receives requisition $\rightarrow$ Collects specimen (`SPECIMEN_COLLECTED`).
  2. Specimen scanned at lab (`ACCESSIONED`) $\rightarrow$ Analyzed on hematology counter (`PROCESSING`).
  3. Results entered $\rightarrow$ Pathologist validates $\rightarrow$ Status `COMPLETED` $\rightarrow$ Physician notified.

---

### 8. `com.sentinel.imaging` & `com.sentinel.procedure`
* **Purpose**: Radiology orders, imaging studies, PACS integration, surgical procedure scheduling, and operative notes.
* **Key Entities**:
  - `ImagingOrder`, `ImagingStudy`, `ImagingReport`: DICOM study links, modality (X-Ray, CT, MRI, US), radiologist report.
  - `ProcedureOrder`, `ProcedurePerformance`, `ProcedureNote`: Surgical procedure logs, anesthesia records, postoperative notes.
* **Key Services & Controllers**:
  - `ImagingOrderController`, `ImagingReportController`: Radiology lifecycle management.
  - `ProcedureOrderController`, `ProcedureNoteController`: Operative workflows.

---

### 9. `com.sentinel.billing` & `com.sentinel.insurance`
* **Purpose**: Revenue Cycle Management (RCM), itemized invoicing, insurance eligibility, pre-authorizations, and claims adjudication.
* **Key Entities**:
  - `BillingAccount`: Patient or encounter financial account.
  - `ChargeItem`: Automatically posted fee items (Room charges, doctor fees, lab fees, medication charges).
  - `Invoice` & `InvoiceItem`: Consolidated itemized billing statements.
  - `Payment` & `PaymentAllocation`: Split payments (Cash, Card, UPI, Insurance).
  - `InsuranceClaim` & `InsuranceAuthorization`: Third-party payer claims and pre-authorizations.
* **Key Services & Controllers**:
  - `BillingController`, `InvoiceController`: Invoicing and fee calculations.
  - `PaymentController`: Payment gateway integrations and receipt generation.
  - `InsuranceClaimController`: Electronic claim submission and status tracking.

---

### 10. `com.sentinel.consent` & `com.sentinel.audit`
* **Purpose**: Patient consent directives, ABDM health data sharing authorizations, emergency break-glass records, and immutable WORM auditing.
* **Key Entities**:
  - `PatientConsent`: Consent directive (Permitted data types, validity period, authorized third parties).
  - `BreakGlassRecord`: Audited emergency access override (Clinician, Patient, Category, Justification, Lease time).
  - `AuditLog`: Immutable audit trail (User ID, Client IP, Action, Resource Type, Resource ID, Timestamp).
* **Key Services & Interceptors**:
  - `SentinelAuditInterceptor`: Intercepts REST requests to capture user IP, HTTP verb, and target resource.
  - `AuditLogAspect`: AOP aspect logging method-level mutations.
  - `AuditService`, `AuditEventController`: Immutable audit queries for compliance officers.

---

### 11. `com.sentinel.abdm`, `com.sentinel.fhir` & `com.sentinel.terminology`
* **Purpose**: National digital health standards compliance (ABHA / ABDM) and HL7 FHIR R4 resource conversion.
* **Key Components**:
  - `AbhaIdentifierService`: Verification and linking of 14-digit ABHA IDs.
  - `AbdmBundleExporterService`: Converts encounters, diagnostic reports, and prescriptions into signed FHIR R4 Bundles.
  - `AbdmTerminologyService`: Maps internal hospital codes to LOINC, SNOMED CT, and ICD-10 terminologies.
