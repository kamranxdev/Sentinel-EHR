# MedVault Backend - Modular Monolith Architecture & Implementation Guide

This document defines the architectural specification, directory organization, domain module boundaries, authorization engine layout, and implementation roadmap for the **MedVault** Electronic Health Record (EHR) backend built with **Spring Boot 3** and **Java 17**.

---

## 🏛️ Architectural Overview & Design Rationale

MedVault uses a **Modular Monolith** architecture based on **Package-by-Feature / Bounded Contexts** (Domain-Driven Design). 

### Why Modular Monolith Over Package-by-Layer?

In a traditional **Package-by-Layer** architecture (`controller/`, `service/`, `model/`, `repository/`), all application components are grouped by technical role. As an EHR system grows to include dozens of clinical features, these layer directories become monolithic dumping grounds:
- Editing a single feature (e.g. `Patient`) requires navigating 5+ distant directories.
- Technical layers encourage implicit, uncontrolled coupling between unrelated features.
- Enforcing domain boundaries and access control policies becomes difficult.

By contrast, the **Modular Monolith** approach organizes code into self-contained business modules (`patients/`, `encounters/`, `prescriptions/`, `authorization/`, `fhir/`). Each module encapsulates its own controllers, services, entities, DTOs, and repositories.

```text
EHR Modular Backend Architecture
│
├── API Layer
│   ├── REST Controllers (/api/v1/*)
│   ├── Request/Response DTOs & Validation
│   └── Global Exception Handling
│
├── Application Layer
│   ├── Use Case Orchestration
│   ├── Application Services
│   └── Declarative Transaction Management (@Transactional)
│
├── Domain Layer
│   ├── JPA Entities (@Entity)
│   ├── Domain Rules & Invariants
│   └── Business Policies & Safety Checks
│
├── Infrastructure Layer
│   ├── Spring Data JPA Repositories
│   ├── Hybrid RBAC + ABAC Security Engine
│   ├── HL7 FHIR R4 Interoperability Mappers
│   ├── File & Document Storage Systems
│   └── External Integrations (Email, SMS, Identity)
│
└── Persistence & Storage
    ├── PostgreSQL / H2 Database
    └── HIPAA § 164.312 WORM Audit Ledger
```

---

## 📁 1. Target Spring Boot Folder Structure

Below is the complete target package layout for `com.medvault`:

```text
src/main/java/com/medvault/
│
├── MedVaultApplication.java
│
├── config/                         # Infrastructure & Framework Configuration
│   ├── SecurityConfig.java
│   ├── JpaConfig.java
│   ├── JacksonConfig.java
│   ├── OpenApiConfig.java
│   └── StorageConfig.java
│
├── common/                         # Shared Utilities & Cross-Cutting Concerns
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── AccessDeniedException.java
│   │   └── ContraindicationException.java
│   ├── response/
│   │   ├── ApiResponse.java
│   │   └── PageResponse.java
│   ├── validation/
│   ├── constants/
│   └── enums/
│
├── auth/                           # Authentication & Identity Subsystem
│   ├── controller/
│   │   └── AuthController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   └── CustomUserDetailsService.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── JwtAuthResponse.java
│   ├── entity/
│   └── security/
│       ├── JwtTokenProvider.java
│       └── JwtAuthenticationFilter.java
│
├── users/                          # User & Staff Management Bounded Context
│   ├── controller/
│   │   └── UserController.java
│   ├── service/
│   │   └── UserService.java
│   ├── dto/
│   │   ├── UserResponse.java
│   │   └── UserCreateDTO.java
│   ├── entity/
│   │   └── User.java
│   └── repository/
│       └── UserRepository.java
│
├── patients/                       # Master Patient Index (MPI) Context
│   ├── controller/
│   │   └── PatientController.java
│   ├── service/
│   │   └── PatientService.java
│   ├── dto/
│   │   ├── PatientDTO.java
│   │   └── PatientSearchQuery.java
│   ├── entity/
│   │   └── Patient.java
│   └── repository/
│       └── PatientRepository.java
│
├── appointments/                   # Scheduling & Calendar Management
│   ├── controller/
│   │   └── AppointmentController.java
│   ├── service/
│   │   └── AppointmentService.java
│   ├── dto/
│   │   └── AppointmentDTO.java
│   ├── entity/
│   │   └── Appointment.java
│   └── repository/
│       └── AppointmentRepository.java
│
├── encounters/                     # Central Clinical Visit Bounded Context
│   ├── controller/
│   │   └── EncounterController.java
│   ├── service/
│   │   └── EncounterService.java
│   ├── dto/
│   │   └── EncounterDTO.java
│   ├── entity/
│   │   └── Encounter.java
│   └── repository/
│       └── EncounterRepository.java
│
├── clinical-records/               # General Progress & Clinical Notes
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   │   └── MedicalRecord.java
│   └── repository/
│
├── diagnoses/                      # ICD-10 / SNOMED CT Problem List
│   ├── controller/
│   │   └── DiagnosisController.java
│   ├── service/
│   │   └── DiagnosisService.java
│   ├── dto/
│   ├── entity/
│   │   └── Diagnosis.java
│   └── repository/
│       └── DiagnosisRepository.java
│
├── allergies/                      # Patient Allergens & Sensitivity Registry
│   ├── controller/
│   │   └── AllergyController.java
│   ├── service/
│   │   └── AllergyService.java
│   ├── dto/
│   ├── entity/
│   │   └── Allergy.java
│   └── repository/
│       └── AllergyRepository.java
│
├── vitals/                         # Longitudinal Vitals Flowsheets
│   ├── controller/
│   │   └── VitalSignController.java
│   ├── service/
│   │   └── VitalSignService.java
│   ├── dto/
│   │   └── VitalSignDTO.java
│   ├── entity/
│   │   └── VitalSign.java
│   └── repository/
│       └── VitalSignRepository.java
│
├── nursing/                        # Nursing Triage & Care Flowsheets
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── medications/                    # Medication Master Catalog & RxNorm Lookup
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── prescriptions/                  # eRx Ordering & Smart Safety Engine
│   ├── controller/
│   │   └── PrescriptionController.java
│   ├── service/
│   │   ├── PrescriptionService.java
│   │   └── SmartSafetyService.java
│   ├── dto/
│   │   ├── PrescriptionDTO.java
│   │   └── SafetyCheckResult.java
│   ├── entity/
│   │   └── Prescription.java
│   └── repository/
│       └── PrescriptionRepository.java
│
├── laboratory/                     # Lab Orders & Test Results Subsystem
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── pharmacy/                       # Medication Reconciliation & MAR Dispensing
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── billing/                        # Invoicing, Claims & Revenue Cycle (RCM)
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── insurance/                      # Coverage, Payer Contracts & Eligibility
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── documents/                      # Clinical Attachments & Scanned Reports
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── entity/
│   └── repository/
│
├── notifications/                  # Alerts, Email, SMS & Portal Messages
│   ├── controller/
│   ├── service/
│   ├── dto/
│   └── entity/
│
├── authorization/                  # Dedicated Hybrid RBAC + ABAC Engine
│   ├── rbac/
│   │   ├── Role.java
│   │   ├── Permission.java
│   │   ├── RolePermission.java
│   │   └── RbacService.java
│   ├── abac/
│   │   ├── AttributePolicy.java
│   │   ├── AccessPolicy.java
│   │   ├── BreakGlassRequest.java
│   │   └── AbacService.java
│   ├── evaluator/
│   │   ├── MedVaultPermissionEvaluator.java
│   │   └── ABACEvaluator.java
│   └── security/
│       ├── SecurityContextUtils.java
│       └── UserPrincipal.java
│
├── audit/                          # HIPAA § 164.312 Immutable WORM Ledger
│   ├── controller/
│   │   └── AuditController.java
│   ├── service/
│   │   └── AuditTrailService.java
│   ├── entity/
│   │   └── AuditLog.java
│   └── repository/
│       └── AuditLogRepository.java
│
├── fhir/                           # HL7 FHIR R4 Interoperability Subsystem
│   ├── controller/
│   │   └── FhirController.java
│   ├── service/
│   │   └── FhirService.java
│   ├── mapper/
│   │   ├── PatientFhirMapper.java
│   │   ├── ObservationFhirMapper.java
│   │   ├── EncounterFhirMapper.java
│   │   └── MedicationFhirMapper.java
│   └── resource/
│       ├── FhirPatientResource.java
│       └── FhirEncounterResource.java
│
└── integrations/                   # External Provider & Gateway Adapters
    ├── email/
    ├── sms/
    ├── payment/
    └── identity/
```

---

## 🧱 2. Core Business Modules & Responsibilities

| Module | Primary Responsibility | Primary Entities Owned | Key Public API Endpoints |
| :--- | :--- | :--- | :--- |
| `auth` | Authentication, JWT token issuance, session refresh, MFA | User Credentials, Tokens | `POST /api/v1/auth/login` |
| `users` | Healthcare staff directory, role assignments, department linkage | `User`, `Role`, `Department` | `GET /api/v1/users`, `GET /api/v1/users/doctors` |
| `patients` | Master Patient Index (MPI), demographics, contact info | `Patient` | `GET /api/v1/patients`, `POST /api/v1/patients` |
| `appointments` | Outpatient/inpatient scheduling, calendar slots | `Appointment` | `GET /api/v1/appointments`, `POST /api/v1/appointments` |
| `encounters` | **Central clinical visit anchor** (SOAP notes, visit state) | `Encounter` | `GET /api/v1/encounters/patient/{id}`, `POST /api/v1/encounters` |
| `clinical-records` | Progress notes, discharge summaries, history | `MedicalRecord` | `GET /api/v1/clinical-records` |
| `diagnoses` | Problem list management (ICD-10 / SNOMED CT) | `Diagnosis` | `GET /api/v1/diagnoses/patient/{id}` |
| `allergies` | Allergen registry, reaction severity, RxNorm coding | `Allergy` | `GET /api/v1/allergies/patient/{id}` |
| `vitals` | Vital sign flowsheets (BP, HR, SpO2, Temp, Resp Rate) | `VitalSign` | `GET /api/v1/vitals/patient/{id}` |
| `nursing` | Nursing assessments, shift notes, intake/output | `NursingNote` | `GET /api/v1/nursing` |
| `medications` | Master drug formulary, RxNorm code cross-reference | `Medication` | `GET /api/v1/medications` |
| `prescriptions` | eRx creation & Smart Safety Engine contraindication check | `Prescription` | `POST /api/v1/prescriptions`, `POST /api/v1/prescriptions/safety-check` |
| `laboratory` | Lab order entry, specimen tracking, LOINC test results | `LabOrder`, `LabResult` | `GET /api/v1/lab/orders`, `POST /api/v1/lab/results` |
| `pharmacy` | Drug dispensing, Medication Administration Record (MAR) | `DispensaryRecord` | `GET /api/v1/pharmacy` |
| `billing` | Financial ledger, patient invoicing, payments | `Invoice`, `Payment` | `GET /api/v1/billing` |
| `insurance` | Primary/secondary insurance policies, claims | `InsuranceClaim` | `GET /api/v1/insurance` |
| `documents` | Scanned records, PDF attachments, file uploads | `Document` | `GET /api/v1/documents` |
| `notifications` | System alerts, email/SMS appointment reminders | `Notification` | `GET /api/v1/notifications` |
| `authorization` | **Hybrid RBAC + ABAC security policy engine** | `Role`, `Permission`, `AccessPolicy` | `@PreAuthorize`, `@ABACPermission` |
| `audit` | **HIPAA § 164.312 WORM immutable audit trail** | `AuditLog` | `GET /api/v1/admin/audit-logs` |
| `fhir` | **HL7 FHIR R4 JSON interoperability export & import** | FHIR Bundle Mappers | `GET /api/v1/fhir/Patient`, `GET /api/v1/fhir/Encounter` |

---

## 🔒 3. Dedicated Authorization Subsystem Architecture

Security in MedVault is treated as a **first-class business module** (`com.medvault.authorization`), rather than being scattered across generic utilities or controllers.

```text
HTTP Request
     │
     ▼
JwtAuthenticationFilter
     │ (Validates Bearer Token & Populates SecurityContext)
     ▼
RBAC Evaluator (@PreAuthorize)
"Does the user's role possess the baseline Permission?"
     │
     ├── NO ──► 403 FORBIDDEN (RBAC Access Denied)
     │
     ▼ YES
ABAC Policy Evaluator (ABACEvaluator)
"Does the user satisfy contextual attributes?"
 - User Department == Patient Department?
 - Active Care Team assignment?
 - Active Break-Glass override?
     │
     ├── NO ──► Log Violation ──► 403 FORBIDDEN (ABAC Context Denied)
     │
     ▼ YES
Business Service Execution
     │
     ▼
WORM Audit Trail Logging (AuditTrailService)
     │
     ▼
200 OK Response
```

### Code Example: Nurse Accessing Patient Vitals

```java
// Controller Endpoints use explicit REST API versioning and authorization annotations
@RestController
@RequestMapping("/api/v1/vitals")
@RequiredArgsConstructor
public class VitalSignController {

    private final VitalSignService vitalSignService;
    private final ABACEvaluator abacEvaluator;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('VITALS_READ')")
    public ResponseEntity<List<VitalSignDTO>> getPatientVitals(
            @PathVariable Long patientId,
            Authentication authentication) {
        
        // 1. Evaluate ABAC contextual policy rules
        if (!abacEvaluator.canAccessPatientData(authentication, patientId, "READ_VITALS")) {
            throw new AccessDeniedException("ABAC Policy Violation: Department mismatch or no active care relationship.");
        }

        // 2. Execute business service
        List<VitalSignDTO> vitals = vitalSignService.getVitalsByPatientId(patientId);
        return ResponseEntity.ok(vitals);
    }
}
```

---

## 🩺 4. Encounter-Centric Clinical Data Architecture

A common architectural flaw in early EHR designs is attaching every medical record directly to a `Patient` without visit context. In MedVault, the **`Encounter`** entity serves as the central anchor for clinical events:

```text
               ┌────────────────┐
               │    Patient     │
               └───────┬────────┘
                       │ 1
                       │
                       │ *
               ┌───────▼────────┐
               │   Encounter    │  (Visit Context: Inpatient / Outpatient / Emergency)
               └───────┬────────┘
                       │
     ┌─────────────────┼─────────────────┬─────────────────┐
     │ *               │ *               │ *               │ *
┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
│ Vitals  │      │ Diagnoses │     │    eRx    │     │Lab Orders │
└─────────┘      └───────────┘     └───────────┘     └───────────┘
```

```java
@Entity
@Table(name = "encounters")
@Data
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @Enumerated(EnumType.STRING)
    private EncounterType type; // AMBULATORY, INPATIENT, EMERGENCY, TELEHEALTH

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @OneToMany(mappedBy = "encounter", cascade = CascadeType.ALL)
    private List<VitalSign> vitals = new ArrayList<>();

    @OneToMany(mappedBy = "encounter", cascade = CascadeType.ALL)
    private List<Diagnosis> diagnoses = new ArrayList<>();

    @OneToMany(mappedBy = "encounter", cascade = CascadeType.ALL)
    private List<Prescription> prescriptions = new ArrayList<>();
}
```

---

## 🌐 5. FHIR Interoperability Subsystem (`fhir/`)

The `fhir/` module translates MedVault internal JPA entities into standard HL7 FHIR R4 JSON resources. This keeps internal database models decoupled from external interoperability standards.

```text
Internal Domain Entity (e.g. Patient)
                 │
                 ▼
     PatientFhirMapper.java
                 │
                 ▼
Standard FHIR R4 JSON Resource (org.hl7.fhir.r4.model.Patient)
                 │
                 ▼
GET /api/v1/fhir/Patient/{id}
```

---

## 🛣️ 6. API Routing Standard (`/api/v1/*`)

All REST endpoints follow consistent versioned path naming:

```http
POST /api/v1/auth/login
GET  /api/v1/users
GET  /api/v1/patients
GET  /api/v1/patients/{id}
GET  /api/v1/appointments
GET  /api/v1/encounters/patient/{patientId}
POST /api/v1/encounters
GET  /api/v1/vitals/patient/{patientId}
POST /api/v1/vitals
GET  /api/v1/diagnoses/patient/{patientId}
GET  /api/v1/allergies/patient/{patientId}
GET  /api/v1/prescriptions/patient/{patientId}
POST /api/v1/prescriptions/safety-check
POST /api/v1/prescriptions
GET  /api/v1/lab/orders
GET  /api/v1/billing
GET  /api/v1/admin/audit-logs
GET  /api/v1/fhir/Patient
```

---

## 🔄 7. Refactoring & Migration Roadmap

To migrate from the legacy layered layout (`com.medvault.controller/service/model`) to this modular structure cleanly:

### Phase 1: Core Packaging & Shared Common
1. Create `com.medvault.common` and move global exception handlers, response wrappers, and shared constants.
2. Create `com.medvault.config` for framework configurations.

### Phase 2: Security & Authorization Extraction
1. Create `com.medvault.auth` and move `AuthController`, `AuthService`, and JWT filters.
2. Create `com.medvault.authorization` and migrate `Role`, `AccessPolicy`, `RBACService`, and `ABACEvaluator`.

### Phase 3: Core Domain Modules Migration
1. Move `Patient`, `PatientController`, `PatientService`, `PatientRepository` to `com.medvault.patients`.
2. Move `User`, `UserController`, `UserService`, `UserRepository` to `com.medvault.users`.
3. Create `com.medvault.encounters` and encapsulate visit logic.

### Phase 4: Clinical Subsystems Migration
1. Package `vitals`, `diagnoses`, `allergies`, `prescriptions`, `nursing`, `medications`, `laboratory`.
2. Update imports across packages and run `./mvnw test` to ensure zero compilation or runtime breaks.

### Phase 5: Interoperability & Compliance Extraction
1. Move `FhirController` and FHIR mappers into `com.medvault.fhir`.
2. Move `AuditLog`, `AuditController`, and `AuditTrailService` into `com.medvault.audit`.

---

## 📊 Summary

Adopting this **Modular Monolith** architecture equips MedVault with:
- **Clean Bounded Contexts** matching clinical domain boundaries.
- **Enterprise-Grade Security** via a dedicated hybrid RBAC + ABAC authorization module.
- **Encounter-Centric** medical record management for HIPAA compliance.
- **Seamless Interoperability** using an isolated FHIR R4 module.
- **Future Microservices Readiness** without initial deployment complexity.
