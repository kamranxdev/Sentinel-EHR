# REST API Endpoint Specification

## 1. Authentication & Global Headers

All API requests must include:
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`
- `X-Tenant-ID: <ORGANIZATION_UUID>` (optional if encoded in JWT claim)

---

## 2. Core API Catalog by Domain

### A. Authentication & User Profile
```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

---

### B. Patient Management & MPI
```http
# Patient Demographics & Records
GET    /api/v1/patients                  # Scoped list of active patients
POST   /api/v1/patients                  # Register new patient
GET    /api/v1/patients/{id}             # Get patient profile by ID
PUT    /api/v1/patients/{id}             # Update patient demographics
GET    /api/v1/patients/{id}/summary     # Get patient executive clinical summary
GET    /api/v1/patients/{id}/timeline    # Get patient longitudinal event timeline

# Master Patient Index (MPI)
POST   /api/v1/mpi/search                # Search MPI with fuzzy deduplication scoring
POST   /api/v1/mpi/merge                 # Merge duplicate patient records (with audit)
```

---

### C. Clinical Core & Encounters
```http
# Encounters & ADT
GET    /api/v1/encounters                # List clinical encounters
POST   /api/v1/encounters                # Create/start new encounter
GET    /api/v1/encounters/{id}           # Get encounter details
PUT    /api/v1/encounters/{id}/discharge # Discharge patient from encounter

# Physiological Vitals
GET    /api/v1/patients/{id}/vitals      # Get patient vitals history
POST   /api/v1/encounters/{id}/vitals    # Log vitals under active encounter
GET    /api/v1/patients/{id}/vitals/latest # Get most recent vitals

# Diagnoses & Problem List
GET    /api/v1/patients/{id}/diagnoses   # List active diagnoses
POST   /api/v1/diagnoses                 # Add diagnosis (ICD-10)
PATCH  /api/v1/diagnoses/{id}            # Resolve/update diagnosis status

# Allergies & ADRs
GET    /api/v1/patients/{id}/allergies   # List documented allergies
POST   /api/v1/patients/{id}/allergies   # Record new allergy
PATCH  /api/v1/allergies/{id}            # Update allergy status
```

---

### D. Pharmacy & eMAR
```http
# Electronic Prescriptions (eRx)
GET    /api/v1/patients/{id}/prescriptions # List patient prescriptions
POST   /api/v1/prescriptions               # Create eRx prescription
POST   /api/v1/prescriptions/safety-check  # Pre-sign Drug-Drug/Allergy safety check
PATCH  /api/v1/prescriptions/{id}          # Discontinue/update prescription

# Bedside eMAR (Nursing)
POST   /api/v1/prescriptions/{id}/administer # Mark dose given (eMAR 5-rights)
POST   /api/v1/prescriptions/{id}/hold       # Mark dose refused/held with clinical reason
```

---

### E. Laboratory Information System (LIS)
```http
GET    /api/v1/lab-orders                # List lab orders (filter by status/urgency)
POST   /api/v1/lab-orders                # Doctor orders diagnostic lab test
POST   /api/v1/lab-orders/{id}/collect   # Collect specimen & generate barcode
POST   /api/v1/lab-orders/{id}/accession # Accession specimen in lab
POST   /api/v1/lab-orders/{id}/results   # Enter test parameters & measured values
POST   /api/v1/lab-orders/{id}/validate  # Validate and finalize lab results (triggers doctor alert)
```

---

### F. Spatial Bed & Ward Management
```http
GET    /api/v1/beds                      # List spatial beds with occupancy status
POST   /api/v1/beds                      # Provision new hospital bed
GET    /api/v1/wards                     # List hospital wards and capacities
POST   /api/v1/beds/{id}/status          # Update bed status (OCCUPIED, AVAILABLE, CLEANING)
POST   /api/v1/beds/{id}/assign          # Assign admitted patient to bed
POST   /api/v1/beds/{id}/transfer        # Transfer patient between beds/wards
```

---

### G. Security, Break-Glass & Auditing
```http
# Emergency Break-Glass
POST   /api/v1/security/break-glass      # Request 4h emergency override lease
GET    /api/v1/security/break-glass/audit# List historical break-glass leases (Admins/Auditors)

# WORM Audit Logs
GET    /api/v1/audit/logs                # Query immutable audit events by time/user/resource
```
