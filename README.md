# Sentinel Enterprise EHR Platform

> **HL7 FHIR R4, ABDM & DISHA Compliant Electronic Health Record (EHR) & Clinical Management System**

Sentinel is an enterprise-scale Electronic Health Record (EHR) platform tailored for healthcare ecosystems. It features multi-persona clinical workspaces, Ayushman Bharat Health Account (ABHA ID) integration, a Smart Allergy Safety Engine, immutable DISHA & ABDM WORM audit logging, HL7 FHIR R4 interoperability, and synthetic patient generation.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **🔒 Scoped Patient Portal** | Patients see strictly their own health summary — vitals, conditions, prescriptions, allergies, and ABHA ID details |
| **🩺 Physician Desk** | SOAP progress notes, ICD-10 & SNOMED-CT problem lists, eRx orders with smart allergy safety checks |
| **💉 Bedside Nurse Flowsheet** | Longitudinal vitals tracking (BP, HR, Temp, SpO2, Glucose, BMI) with trend visualization |
| **⚙️ Admin Command Center** | Master Patient Index (MPI) probabilistic identity matching, staff directory, synthetic patient generation pipeline |
| **🛡️ ABDM & DISHA WORM Audit Vault** | Immutable append-only audit ledger for regulatory compliance under DISHA, DPDP Act 2023, and ISO 27001 |
| **⚠️ Smart Allergy Safety Engine** | Real-time RxNorm & SNOMED contraindication cross-checking before prescription issuance |
| **🌐 HL7 FHIR R4 & ABDM API** | Standard FHIR endpoints (`Patient`, `Encounter`, `Observation`, `$everything` bundles) with ABHA profile support |
| **🧬 Cohort Pipeline** | Generate realistic synthetic patient cohorts with Indian and international demographic fidelity |

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 19+ (Standalone Components, Signals, Reactive Forms) |
| **Backend** | Java 17+ / Spring Boot 3.2, Spring Security 6 (Stateless JWT, Method-Level RBAC) |
| **ORM** | Spring Data JPA / Hibernate 6.4 (Dialect-Abstracted, DB-Agnostic) |
| **Database** | H2 In-Memory (Dev) · PostgreSQL 16 Docker (Local) · Cloud PostgreSQL (Prod) |
| **Interoperability** | HL7 FHIR R4, LOINC, ICD-10, SNOMED-CT, RxNorm |

---

## 🚀 Quick Start

```bash
# 1. Start Backend (Port 8080) — uses embedded H2 by default, zero setup
cd backend
./mvnw spring-boot:run

# 2. Start Frontend (Port 4200)
cd frontend
npm install
npm start
```

Open **http://localhost:4200** and sign in with any demo credential below.

### Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Patient** | `user_kamran` | `patient123` |
| **Doctor** | `doctor_mahtab` | `doctor123` |
| **Nurse** | `nurse_priya` | `nurse123` |
| **Admin** | `admin` | `admin123` |
| **Auditor** | `auditor` | `auditor123` |

> For the full credentials matrix with user profiles and scopes, see [Getting Started Guide](docs/developer-setup-guide.md).

---

## 📚 Domain-Driven Documentation Suite

All documentation is organized in domain subdirectories within [`docs/`](docs/):

| Domain | Document | Description |
| :--- | :--- | :--- |
| **Quickstart** | **[Getting Started](docs/developer-setup-guide.md)** | Setup guide, execution modes, demo credentials matrix, build & test commands |
| **Architecture** | **[System Architecture](docs/architecture/system-architecture-spec.md)** | High-level system architecture, package-by-feature modular design, multi-tier diagrams |
| **Clinical** | **[Clinical Workflows](docs/clinical/clinical-workflows-spec.md)** | Encounter lifecycle, eRx safety engine, SOAP notes, triage & flowsheets |
| **Clinical** | **[EHR Database Schema](docs/clinical/relational-database-schema.md)** | ER diagram, JPA entities, patient care assignments, security tables |
| **Security** | **[Security & Compliance](docs/security-compliance/security-compliance-spec.md)** | Stateless JWT authentication, security filter chain, WORM audit ledger, Indian & International compliance (ABDM, DPDP Act 2023, DISHA, ISO 27001, GDPR, HIPAA) |
| **Security** | **[RBAC & ABAC Matrix](docs/security-compliance/rbac-abac-security-matrix.md)** | 10 baseline roles, resource permission matrices, SpEL contextual rules |
| **Interoperability**| **[REST API Reference](docs/interoperability/rest-api-specification.md)** | REST endpoints catalog, JSON payload formats, FHIR R4 exporter APIs |
| **Interoperability**| **[Synthea Pipeline](docs/interoperability/synthea-pipeline-integration.md)** | Synthetic patient generator setup, FHIR-to-entity mapping, CLI execution |
| **Workspaces** | **[Workspaces Overview](docs/workspaces/README.md)** | Guides for 9 role-specific clinical workspaces |

---

## 📁 Repository Structure

```
Sentinel/
├── backend/                  # Spring Boot REST API & Security Engine
│   ├── src/main/java/        # Controllers, Services, Models, Security
│   ├── src/main/resources/   # schema.sql, seed.sql, application.properties
│   └── pom.xml
│
├── frontend/                 # Angular 19+ Standalone Enterprise UI
│   ├── src/app/              # Components, Services, Guards, Routes
│   └── package.json
│
├── docs/                     # 📚 Domain-Driven Documentation Hierarchy
│   ├── developer-setup-guide.md    # Developer setup & quickstart guide
│   ├── architecture/         # System architecture & modular monolith design
│   ├── clinical/             # Clinical workflows & EHR database schema
│   ├── security-compliance/  # Security, HIPAA compliance & RBAC/ABAC matrix
│   ├── interoperability/    # REST API specification & Synthea pipeline
│   └── workspaces/           # 9 Role-based clinical workspace manuals
│
├── scripts/                  # Data pipeline execution scripts
└── docker-compose.yml        # PostgreSQL 16 local container configuration
```
