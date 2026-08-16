-- ==============================================================================
-- Sentinel EHR Comprehensive Production Real-Data Seed Script
-- Compatible with Database SQL Editors (H2 PostgreSQL Mode, PostgreSQL, MySQL)
-- Real Clinical, Demographic, eMAR, Flowsheet, Triage, ABAC, and Billing Seeding
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. ORGANIZATIONS
-- ------------------------------------------------------------------------------
INSERT INTO organizations (id, org_code, name, license_number, email, phone, address, status, created_at, updated_at) VALUES 
(1, 'ORG-1001', 'Sentinel General Hospital Network', 'LIC-MH-450912', 'admin@sentinel.org', '+91 22 2490 1000', '742 Marine Drive, Mumbai, MH 400001', 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'ORG-1002', 'Sentinel Apollo Medical Center', 'LIC-KA-881920', 'contact@apollo-sentinel.org', '+91 80 4112 5500', '15 MG Road, Bengaluru, KA 560001', 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'ORG-1003', 'Sentinel Care Multi-Specialty Clinic', 'LIC-DL-339211', 'info@sentinelcare.org', '+91 11 2658 8000', '88 Ring Road, New Delhi, DL 110016', 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO departments (id, name, code, description) VALUES 
(1, 'Cardiovascular Medicine', 'CARD', 'Cardiology, ECG, Heart Failure, Echocardiography'),
(2, 'Emergency & Acute Care', 'EMG', 'Emergency Department, Triage, ICU Bedside'),
(3, 'Patient Intake & Reception Desk', 'REC', 'Front Desk, Patient Registration, Appointment Scheduling'),
(4, 'Clinical Pathology & Laboratory', 'LAB', 'Diagnostic Specimen Processing & Hematology'),
(5, 'Clinical Pharmacy Services', 'PHARM', 'Medication Reconciliation, eRx Verification, Dispensing'),
(6, 'Revenue Cycle & Patient Billing', 'BILL', 'Invoicing, Insurance Claims, Financial Audits'),
(7, 'Platform Administration & Security', 'ADM', 'System Infrastructure & Security Governance'),
(8, 'Regulatory Compliance & Forensics', 'AUD', 'ABDM / DISHA & ISO 27001 WORM Audits'),
(9, 'Neurological Sciences', 'NEURO', 'Neurology, Stroke Care, Neuro-Rehabilitation'),
(10, 'Endocrinology & Diabetes', 'ENDO', 'Diabetes Care, Metabolic Disorders, Thyroid Clinic');

-- ------------------------------------------------------------------------------
-- 2. ROLES (10 Baseline Production Roles)
-- ------------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES 
(1, 'ROLE_SYS_ADMIN', 'Platform System Administrator - Tenant Infrastructure & Security'),
(2, 'ROLE_ORG_ADMIN', 'Organization Administrator - Clinic Facilities & Staff Roster'),
(3, 'ROLE_DOCTOR', 'Physician / Attending Doctor - Diagnoses, Notes, eRx Orders'),
(4, 'ROLE_NURSE', 'Registered Nurse - Triage, Vitals, MAR Administration'),
(5, 'ROLE_RECEPTIONIST', 'Receptionist - Front Desk Intake, Scheduling, Demographics'),
(6, 'ROLE_LAB_TECH', 'Laboratory Technician - Specimen Processing & Lab Results'),
(7, 'ROLE_PHARMACIST', 'Pharmacist - Medication Reconciliation & Dispensing'),
(8, 'ROLE_BILLING', 'Billing Officer - Revenue Cycle, Invoices, Claims'),
(9, 'ROLE_PATIENT', 'Patient - Personal Health Portal Access'),
(10, 'ROLE_AUDITOR', 'Compliance Officer - WORM Audit Log & Access Reports');

-- ------------------------------------------------------------------------------
-- 3. PERMISSIONS
-- ------------------------------------------------------------------------------
INSERT INTO permissions (id, code, category, description) VALUES 
(1, 'PATIENT_CREATE', 'PATIENT', 'Create new patient profile in MPI'),
(2, 'PATIENT_READ', 'PATIENT', 'View patient demographic details'),
(3, 'PATIENT_UPDATE', 'PATIENT', 'Update patient demographic fields'),
(4, 'APPOINTMENT_CREATE', 'APPOINTMENT', 'Schedule new patient appointment'),
(5, 'APPOINTMENT_READ', 'APPOINTMENT', 'View appointment calendar'),
(6, 'APPOINTMENT_UPDATE', 'APPOINTMENT', 'Reschedule or update appointment'),
(7, 'APPOINTMENT_CANCEL', 'APPOINTMENT', 'Cancel scheduled appointment'),
(8, 'CLINICAL_NOTE_CREATE', 'CLINICAL', 'Write SOAP progress notes'),
(9, 'CLINICAL_NOTE_READ', 'CLINICAL', 'Read SOAP progress notes'),
(10, 'DIAGNOSIS_CREATE', 'CLINICAL', 'Log ICD-10/SNOMED diagnosis'),
(11, 'DIAGNOSIS_READ', 'CLINICAL', 'View patient problem list'),
(12, 'VITALS_CREATE', 'CLINICAL', 'Record patient vital signs'),
(13, 'VITALS_READ', 'CLINICAL', 'View vitals flowsheet'),
(14, 'PRESCRIPTION_CREATE', 'MEDICATION', 'Issue RxNorm eRx prescription'),
(15, 'PRESCRIPTION_READ', 'MEDICATION', 'View prescription history'),
(16, 'MEDICATION_DISPENSE', 'MEDICATION', 'Dispense prescription order'),
(17, 'LAB_ORDER_CREATE', 'LABORATORY', 'Order diagnostic lab test'),
(18, 'LAB_RESULT_CREATE', 'LABORATORY', 'Enter diagnostic lab results'),
(19, 'LAB_RESULT_READ', 'LABORATORY', 'View lab result reports'),
(20, 'INVOICE_CREATE', 'BILLING', 'Generate patient invoice'),
(21, 'INVOICE_READ', 'BILLING', 'View financial billing invoices'),
(22, 'AUDIT_LOG_READ', 'SYSTEM', 'Read ABDM / DISHA WORM audit log'),
(23, 'USER_CREATE', 'SYSTEM', 'Provision new staff user'),
(24, 'MAR_READ', 'MEDICATION', 'Read medication administration records'),
(25, 'MAR_ADMINISTER', 'MEDICATION', 'Administer bedside medication eMAR'),
(26, 'BCMA_EXECUTE', 'MEDICATION', 'Execute 5-Rights bedside barcode scanning'),
(27, 'TRIAGE_EWS_EXECUTE', 'CLINICAL', 'Calculate NEWS2 early warning score'),
(28, 'CARE_PLAN_CREATE', 'NURSING', 'Create NANDA-I care plan'),
(29, 'CARE_PLAN_READ', 'NURSING', 'View NANDA-I care plan'),
(30, 'NURSING_NOTE_CREATE', 'NURSING', 'Create SBAR nursing handoff note');

-- ------------------------------------------------------------------------------
-- 4. ROLE_PERMISSIONS MAPPING
-- ------------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13), (3, 14), (3, 15), (3, 17), (3, 19), (3, 24), (3, 27), (3, 29),
(4, 1), (4, 2), (4, 4), (4, 5), (4, 6), (4, 9), (4, 11), (4, 12), (4, 13), (4, 15), (4, 19), (4, 24), (4, 25), (4, 26), (4, 27), (4, 28), (4, 29), (4, 30),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 21),
(6, 2), (6, 5), (6, 18), (6, 19),
(7, 2), (7, 15), (7, 16),
(8, 2), (8, 20), (8, 21),
(9, 2), (9, 4), (9, 5), (9, 7), (9, 9), (9, 11), (9, 13), (9, 15), (9, 19), (9, 21),
(10, 2), (10, 5), (10, 9), (10, 11), (10, 13), (10, 15), (10, 19), (10, 21), (10, 22);
INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions;
INSERT INTO role_permissions (role_id, permission_id) SELECT 2, id FROM permissions;

-- ------------------------------------------------------------------------------
-- 5. USERS (Full Column Data Seeding)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, username, password, email, full_name, specialization, department, department_id, organization_id, license_number, qualifications, years_of_experience, medical_board_state, verification_status, created_at) VALUES 
(1, 'sysadmin.vikram', '$2a$10$rIxvNrZcsreC0tp5Ik9S4uFff/IyrYl3eiLHyH53l6IyuM5jHY67C', 'sysadmin.vikram@sentinel.org', 'Dr. Vikramaditya Gupta', 'Healthcare Informatics & Infrastructure', 'Platform Administration & Security', 7, 1, 'MCI-2005-11048', 'MD (Internal Medicine), M.Sc Healthcare IT', 20, 'Maharashtra Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(2, 'dr.mahtab.khan', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'mahtab.khan@sentinel.org', 'Dr. Mahtab Khan', 'Cardiology & Interventional Cardiology', 'Cardiovascular Medicine', 1, 1, 'MCI-2012-38491', 'DM (Cardiology), MD (Gen Med), MBBS, FACC', 14, 'Maharashtra Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(3, 'dr.mahtab.khan2', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'mahtab.khan2@sentinel.org', 'Dr. Mahtab Khan', 'Cardiology & Interventional Cardiology', 'Cardiovascular Medicine', 1, 1, 'MCI-2012-38491', 'DM (Cardiology), MD (Gen Med), MBBS, FACC', 14, 'Maharashtra Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(4, 'dr.rajesh.sharma', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'rajesh.sharma@sentinel.org', 'Dr. Rajesh Sharma', 'Neurology & Cerebrovascular Medicine', 'Neurological Sciences', 9, 1, 'MCI-2010-44912', 'DM (Neurology), MD (Internal Medicine), MBBS', 16, 'Delhi Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(5, 'nurse.priya.verma', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'priya.verma@sentinel.org', 'Nurse Priya Verma', 'Emergency Triage & Critical Care Nursing', 'Emergency & Acute Care', 2, 1, 'NNC-2018-88392', 'B.Sc Nursing, RN, ACLS/BLS Certified', 8, 'Maharashtra Nursing Council', 'VERIFIED', CURRENT_TIMESTAMP),
(6, 'nurse.priya.verma2', '$2a$10$DgGz9Ehsr5I9xvTQ/lbBQeF0AGNdBCr8C7zQgdOVScnY1fEaxXfsG', 'priya.verma2@sentinel.org', 'Nurse Priya Verma', 'Emergency Triage & Critical Care Nursing', 'Emergency & Acute Care', 2, 1, 'NNC-2018-88392', 'B.Sc Nursing, RN, ACLS/BLS Certified', 8, 'Maharashtra Nursing Council', 'VERIFIED', CURRENT_TIMESTAMP),
(7, 'auditor.suresh', '$2a$10$3Uj7vg0rhOtYROAzLYvK2.HbXLWJfNM4lfK8DNWsGCsEHLH14A3ei', 'suresh.menon@sentinel.org', 'Inspector Suresh Menon', 'Healthcare Regulatory Audit & Compliance', 'Regulatory Compliance & Forensics', 8, 1, 'AUD-2015-99201', 'LL.M (Health Law), CISA, ISO 27001 Lead Auditor', 18, 'Bar Council of India', 'VERIFIED', CURRENT_TIMESTAMP),
(8, 'dr.aditi.rao', '$2a$10$bvRrisyOUu8PQa8gPJlQjOTPxtPQDosqRBdRoW95EXlrydpL6/IvW', 'aditi.rao@sentinel.org', 'Dr. Aditi Rao', 'Endocrinology & Diabetes Mellitus', 'Endocrinology & Diabetes', 10, 1, 'MCI-2014-55102', 'DM (Endocrinology), MD (Gen Med), MBBS', 11, 'Karnataka Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(9, 'patient.kamran', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'kamrankhan.sde@gmail.com', 'Kamran Khan', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP),
(10, 'patient.aarav', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'aarav.patel@example.com', 'Aarav Patel', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP),
(11, 'patient.ananya', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'ananya.sharma@example.com', 'Ananya Sharma', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP),
(12, 'patient.rohan', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'rohan.mehta@example.com', 'Rohan Mehta', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP),
(13, 'receptionist.sarita', '$2a$10$U9LDGKztApw0TjXI3gt68.3HMfnpsCf7HlfH40w2YrrlwRMhZAIwq', 'sarita.verma@sentinel.org', 'Sarita Verma', 'Patient Scheduling & Administration', 'Patient Intake & Reception Desk', 3, 1, 'REC-2020-11029', 'B.A. Administration, Certified Medical Registrar', 6, 'Maharashtra State Board', 'VERIFIED', CURRENT_TIMESTAMP),
(14, 'labtech.roy', '$2a$10$hWfjzWpgqoy9xSFfTa.X5uTLq.RWkf4jw1qWre4K3NzV3JvT9UH7e', 'roy.dsouza@sentinel.org', 'Roy Lab Specialist', 'Clinical Pathology & Automated Blood Chemistry', 'Clinical Pathology & Laboratory', 4, 1, 'MLT-2017-77401', 'B.Sc Medical Laboratory Technology (MLT)', 9, 'Maharashtra Paramedical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(15, 'pharmacist.anita', '$2a$10$u/Xd8bxyQUr5Nqc/9xQhB.b3liUdM.MNO.SaOVkNbkKsi6EsJZPfa', 'anita.kulkarni@sentinel.org', 'PharmD Anita Desai', 'Clinical Pharmacy & Drug Interaction Screening', 'Clinical Pharmacy Services', 5, 1, 'PCI-2016-33910', 'Pharm.D, Registered Pharmacist (RPh)', 10, 'Pharmacy Council of India', 'VERIFIED', CURRENT_TIMESTAMP),
(16, 'billing.vikram', '$2a$10$JxvglMjc9cihsQTvpClZpeFA.aXuko6xiRl4zU4J3IDqcRRv.GKGS', 'vikram.patel@sentinel.org', 'Vikram Patel', 'Healthcare Revenue Cycle & Insurance Claims Processing', 'Revenue Cycle & Patient Billing', 6, 1, 'BIL-2019-22019', 'M.Com, Certified Healthcare Financial Professional (CHFP)', 7, 'Institute of Cost Accountants', 'VERIFIED', CURRENT_TIMESTAMP),
(17, 'orgadmin.anita', '$2a$10$rIxvNrZcsreC0tp5Ik9S4uFff/IyrYl3eiLHyH53l6IyuM5jHY67C', 'anita.desai@sentinel.org', 'Dr. Mahtab Patel', 'Hospital Management & Operations', 'Platform Administration & Security', 7, 1, 'MCI-2008-22849', 'MD, MHA (Hospital Administration)', 17, 'Maharashtra Medical Council', 'VERIFIED', CURRENT_TIMESTAMP),
(18, 'patient.kabir', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'kabir.rao@sentinel-health.in', 'Kabir Rao', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP),
(19, 'patient.sneha', '$2a$10$1Knu6HwyDwDWpqngg1N6nOoWKupSsqQLU0Mw/3EmTdJ.XKt4e32kC', 'sneha.rao@sentinel-health.in', 'Sneha Rao', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'VERIFIED', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 6. USER ROLES (JOIN TABLE)
-- ------------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), (2, 3), (3, 3), (4, 3), (5, 4), (6, 4), (7, 10), (8, 3),
(9, 9), (10, 9), (11, 9), (12, 9), (13, 5), (14, 6), (15, 7), (16, 8), (17, 2), (18, 9), (19, 9);

-- ------------------------------------------------------------------------------
-- 6.5. EMERGENCY CONTACTS
-- ------------------------------------------------------------------------------
INSERT INTO emergency_contacts (id, name, relationship, phone) VALUES 
(1, 'Mahtab Khan', 'Brother', '+91 98765 98765'),
(2, 'Priya Patel', 'Wife', '+91 98765 87654'),
(3, 'Rajesh Sharma', 'Father', '+91 98765 76543'),
(4, 'Neha Mehta', 'Sister', '+91 98765 11223'),
(5, 'Sneha Rao', 'Sister', '+91 75556 05154'),
(6, 'Kabir Rao', 'Brother', '+91 98805 48003');

-- ------------------------------------------------------------------------------
-- 7. PATIENTS (Comprehensive Full-Column Seeding)
-- ------------------------------------------------------------------------------
INSERT INTO patients (id, patient_code, abha_id, national_id, full_name, date_of_birth, gender, blood_type, phone, email, address, pin_code, emergency_contact_id, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, department, organization_id, medical_alerts, dietary_habits, smoking_status, alcohol_consumption, exercise_routine, food_allergies, past_medical_history, serious_conditions, surgeries_and_procedures, family_medical_history, user_id, created_at) VALUES 
(1, 'PAT-1001', '91-4590-1284-9001', 'AADHAAR-4590-1284', 'Kamran Khan', '2004-04-04', 'Male', 'A+', '+91 80979 05879', 'kamrankhan.sde@gmail.com', '742 Marine Drive, Mumbai, MH', '400001', 1, 'Star Health Insurance', 'STAR-9874102', 'GRP-55410', 'Premier Comprehensive Care Gold', 'Cardiovascular Medicine', 1, 'Type 2 Diabetes, Severe Penicillin Allergy, Mild Asthma', 'Low Sodium, Diabetic Controlled, Non-Vegetarian', 'NEVER', 'NONE', 'MODERATE', 'Peanuts, Shellfish', 'Type 2 Diabetes Mellitus (2020), Mild Asthmatic Bronchitis (2018)', 'Type 2 Diabetes Mellitus with Mild Retinopathy Risk', 'Laparoscopic Appendectomy (2019)', 'Father: Type 2 Diabetes; Mother: Essential Hypertension', 9, CURRENT_TIMESTAMP),

(2, 'PAT-1002', '91-2180-0983-1002', 'AADHAAR-2180-9831', 'Aarav Patel', '1972-09-28', 'Male', 'A+', '+91 98765 12345', 'aarav.patel@example.com', '1204 CG Road, Ahmedabad, GJ', '380009', 2, 'HDFC ERGO Health', 'HDFC-5510923', 'GRP-11092', 'Optima Secure Super Plan', 'Cardiovascular Medicine', 1, 'Essential Hypertension, Hyperlipidemia, Sulfa Allergy', 'Vegetarian, Low Fat, High Fiber', 'FORMER', 'OCCASIONAL', 'SEDENTARY', 'None', 'Essential Hypertension (2016), Hyperlipidemia (2018), Nephrolithiasis (2021)', 'Primary Essential Hypertension, Atherosclerotic Vascular Risk', 'Percutaneous Coronary Intervention with DES (2022)', 'Father: Premature CAD (MI at 52); Paternal Uncle: Stroke', 10, CURRENT_TIMESTAMP),

(3, 'PAT-1003', '91-7810-0449-1003', 'AADHAAR-7810-4491', 'Ananya Sharma', '1996-11-05', 'Female', 'B-', '+91 98765 67890', 'ananya.sharma@example.com', '45 Park Street, Kolkata, WB', '700016', 3, 'ICICI Lombard', 'ICI-7740192', 'GRP-88102', 'Health Shield Platinum Plan', 'Neurological Sciences', 1, 'Latex Allergy, Migraine with Aura', 'Gluten-Free, Mediterranean, Vegetarian', 'NEVER', 'NONE', 'ACTIVE', 'Latex, Soy', 'Migraine with Aura (2019), Contact Dermatitis (2026)', 'Refractory Episodic Migraine', 'None reported', 'Mother: Thyroiditis; Maternal Grandmother: Rheumatoid Arthritis', 11, CURRENT_TIMESTAMP),

(4, 'PAT-1004', '91-3120-0558-2004', 'AADHAAR-3120-5582', 'Rohan Mehta', '1990-07-22', 'Male', 'AB+', '+91 98765 88990', 'rohan.mehta@example.com', '88 Bandra Reclamation, Mumbai, MH', '400050', 4, 'Care Health Insurance', 'CARE-3341029', 'GRP-99401', 'Care Supreme Gold Protection', 'Neurological Sciences', 1, 'Peanut Allergy, Anaphylactic Risk', 'High Protein, Omnivore', 'NEVER', 'OCCASIONAL', 'ACTIVE', 'Peanuts, Tree Nuts', 'Tension Headache (Resolved), Seasonal Allergic Rhinitis', 'Severe Anaphylactic Peanut Hypersensitivity', 'Knee Arthroscopy (2021)', 'Father: Hyperlipidemia', 12, CURRENT_TIMESTAMP),

(5, 'PAT-1005', '91-8051-6387-5709', 'AADHAAR-8458-4689', 'Kabir Rao', '1983-03-15', 'Male', 'AB+', '+91 91474 44615', 'kabir.rao@sentinel-health.in', 'House No. 123, Block C, Mumbai, MH', '400001', 5, 'Bajaj Allianz', 'POL-500412', 'GRP-1299', 'Health Guard Platinum Plan', 'Emergency & Acute Care', 1, 'Stage 3 Chronic Kidney Disease, GFR 52 mL/min', 'Low Sodium, Low Protein, Renal Friendly', 'CURRENT_LIGHT', 'MODERATE', 'SEDENTARY', 'Lactose', 'Stage 3 Chronic Kidney Disease (2013), Gouty Arthritis (2019)', 'Stage 3A Chronic Kidney Disease', 'None', 'Father: Chronic Kidney Disease; Mother: Type 2 Diabetes', 18, CURRENT_TIMESTAMP),

(6, 'PAT-1006', '91-5521-1782-9119', 'AADHAAR-4089-9332', 'Sneha Rao', '1999-07-16', 'Female', 'A-', '+91 87995 42134', 'sneha.rao@sentinel-health.in', 'House No. 137, Block B, New Delhi, DL', '110001', 6, 'HDFC ERGO Health', 'POL-234096', 'GRP-3594', 'Optima Secure Comprehensive', 'Endocrinology & Diabetes', 1, 'Ibuprofen Life-Threatening Anaphylaxis', 'Vegetarian, Organic', 'NEVER', 'NONE', 'MODERATE', 'NSAIDs, Ibuprofen', 'Bronchial Asthma (2015), Hypothyroidism (2020)', 'Severe NSAID Hypersensitivity & Mild Bronchospasm', 'None', 'Mother: Hashimoto Thyroiditis', 19, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 8. BEDS (Spatial Location Hierarchy & Status Seeding)
-- ------------------------------------------------------------------------------
INSERT INTO beds (id, bed_code, facility_name, department_name, ward_name, room_number, bed_number, status, features, current_encounter_id, updated_at) VALUES 
(1, 'CARD-WARD-A-101-B1', 'Sentinel General Hospital Main Campus', 'Cardiovascular Medicine', 'Ward A', '101', '1', 'OCCUPIED', 'Telemetry, High-Flow Oxygen Hookup, Continuous ECG Monitor', 1, CURRENT_TIMESTAMP),
(2, 'CARD-WARD-A-101-B2', 'Sentinel General Hospital Main Campus', 'Cardiovascular Medicine', 'Ward A', '101', '2', 'AVAILABLE', 'Telemetry, Electric Care Bed', NULL, CURRENT_TIMESTAMP),
(3, 'EMG-ICU-01-B1', 'Sentinel General Hospital Main Campus', 'Emergency & Acute Care', 'ICU Unit 1', '01', '1', 'OCCUPIED', 'Telemetry, Mechanical Ventilator, Negative Pressure Isolation', 2, CURRENT_TIMESTAMP),
(4, 'EMG-ICU-01-B2', 'Sentinel General Hospital Main Campus', 'Emergency & Acute Care', 'ICU Unit 1', '01', '2', 'AVAILABLE', 'Telemetry, Bariatric Bed, Syringe Infusion Pumps', NULL, CURRENT_TIMESTAMP),
(5, 'NEURO-ICU-02-B1', 'Sentinel General Hospital Main Campus', 'Neurological Sciences', 'ICU Unit 2', '02', '1', 'AVAILABLE', 'Intracranial Pressure Monitor, Telemetry, Hypothermia Unit', NULL, CURRENT_TIMESTAMP),
(6, 'ENDO-WARD-B-204-B1', 'Sentinel General Hospital Main Campus', 'Endocrinology & Diabetes', 'Ward B', '204', '1', 'AVAILABLE', 'Standard Electric Care Bed, Continuous Glucose Sensor Sink', NULL, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 9. PATIENT CARE TEAM ASSIGNMENTS (ABAC Matrix)
-- ------------------------------------------------------------------------------
INSERT INTO patient_assignments (id, patient_id, encounter_id, staff_user_id, assignment_type, department_name, status, start_date, end_date) VALUES 
(1, 1, 1, 3, 'ATTENDING', 'Cardiovascular Medicine', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(2, 1, 1, 6, 'PRIMARY_NURSE', 'Emergency & Acute Care', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(3, 2, 2, 2, 'ATTENDING', 'Emergency & Acute Care', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(4, 3, 3, 4, 'ATTENDING', 'Neurological Sciences', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(5, 4, 4, 4, 'ATTENDING', 'Neurological Sciences', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(6, 5, 5, 2, 'ATTENDING', 'Emergency & Acute Care', 'ACTIVE', CURRENT_TIMESTAMP, NULL),
(7, 6, 6, 8, 'ATTENDING', 'Endocrinology & Diabetes', 'ACTIVE', CURRENT_TIMESTAMP, NULL);

-- ------------------------------------------------------------------------------
-- 10. ENCOUNTERS
-- ------------------------------------------------------------------------------
INSERT INTO encounters (id, patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status, admission_type, admission_source, department_name, admission_diagnosis_icd, acuity_score, assigned_bed_id, encounter_date, admission_time, discharge_time) VALUES 
(1, 1, 3, 'OUTPATIENT', 'Routine diabetes checkup and cardiovascular risk evaluation.', 'Patient reports good dietary discipline. Blood pressure reading is 128/82 mmHg. HbA1c is 6.8%. ECG reveals normal sinus rhythm without acute ischemic changes.', 'Continue current Metformin therapy. Daily 30-min walking routine. Follow up in 90 days.', 'COMPLETED', 'ELECTIVE', 'OPD', 'Cardiovascular Medicine', 'E11.9', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 2, 2, 'EMERGENCY', 'Acute morning headache and elevated home blood pressure (155/95 mmHg).', 'Evaluated in ED. ECG shows sinus tachycardia without ST elevation. Administered Lisinopril 10mg PO under observation. BP stabilized to 130/84 mmHg.', 'Discharged with prescription for Lisinopril 10mg daily and primary care follow-up in 7 days.', 'DISCHARGED', 'EMERGENCY', 'ED', 'Emergency & Acute Care', 'I10', 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 3, 4, 'TELEHEALTH', 'Follow-up for latex allergy reaction and episodic migraine evaluation.', 'Patient reports mild forearm rash after using latex gloves. Dermatitis subsiding following antihistamine therapy. Neurological exam intact.', 'Avoid all latex products. Prescribed topical hydrocortisone and oral antihistamine.', 'COMPLETED', 'ELECTIVE', 'OPD', 'Neurological Sciences', 'L23.8', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(4, 4, 4, 'OUTPATIENT', 'Annual physical and neurological screening.', 'Neurological exam normal. Cranial nerves II-XII intact. DTRs 2+ bilaterally. No focal motor or sensory deficits.', 'Screening completed without abnormalities. Maintain current physical wellness routine.', 'COMPLETED', 'ELECTIVE', 'OPD', 'Neurological Sciences', 'Z00.00', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, 5, 2, 'INPATIENT', 'Exertional dyspnea and acute retrosternal chest tightness.', 'Admitted to Acute Care. Baseline eGFR 52 mL/min. Troponin I negative x2. Continuous telemetry monitoring initiated.', 'Patient stabilized post overnight observation. Discharged on renal-adjusted anti-hypertensive regimen.', 'DISCHARGED', 'URGENT', 'ED', 'Emergency & Acute Care', 'N18.3', 2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(6, 6, 8, 'OUTPATIENT', 'Routine follow-up for thyroid control and glycemic baseline.', 'Patient doing well on low-dose Levothyroxine. Fasting glucose 95 mg/dL. TSH 2.1 uIU/mL.', 'Continue current dosage. Recheck TSH and HbA1c in 6 months.', 'COMPLETED', 'ELECTIVE', 'OPD', 'Endocrinology & Diabetes', 'E03.9', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 11. LOCATION HISTORY
-- ------------------------------------------------------------------------------
INSERT INTO location_history (id, encounter_id, bed_id, department_name, ward_name, room_number, bed_number, start_time, end_time, transfer_reason, transferred_by_id) VALUES 
(1, 1, 1, 'Cardiovascular Medicine', 'Ward A', '101', '1', CURRENT_TIMESTAMP, NULL, 'Direct outpatient cardiac observation placement', 3),
(2, 2, 3, 'Emergency & Acute Care', 'ICU Unit 1', '01', '1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Transferred from ED Triage Bay 2 to ICU Bed 1 for hypertensive emergency observation', 5),
(3, 5, 4, 'Emergency & Acute Care', 'ICU Unit 1', '01', '2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Step-down observation transfer for cardiac monitoring', 5);

-- ------------------------------------------------------------------------------
-- 12. BREAK GLASS RECORDS
-- ------------------------------------------------------------------------------
INSERT INTO break_glass_records (id, patient_id, user_id, category, justification, requested_at, expires_at, status, client_ip) VALUES 
(1, 1, 2, 'EMERGENCY_ACCESS', 'Patient presented with acute retrosternal chest tightness in ED; immediate emergency access to full eMAR & allergy history required.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'EXPIRED', '192.168.1.104'),
(2, 5, 5, 'ICU_TRAUMA_OVERRIDE', 'Urgent ICU admission for renal acute decompensation monitoring; override required for emergency bedside MAR administration.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE', '10.0.4.15');

-- ------------------------------------------------------------------------------
-- 13. ALLERGIES
-- ------------------------------------------------------------------------------
INSERT INTO allergies (id, patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id, recorded_at) VALUES 
(1, 1, 'Penicillin V Potassium', 'RxNorm-70618', 'DRUG', 'SEVERE', 'Anaphylaxis, acute bronchial constriction, severe hives.', 'ACTIVE', 2, CURRENT_TIMESTAMP),
(2, 3, 'Natural Rubber Latex', 'SNOMED-300916003', 'ENVIRONMENTAL', 'MODERATE', 'Contact dermatitis, erythema, and localized pruritus.', 'ACTIVE', 5, CURRENT_TIMESTAMP),
(3, 4, 'Peanut Protein Extract', 'SNOMED-91935009', 'FOOD', 'SEVERE', 'Facial angioedema, throat tightness, and severe dyspnea.', 'ACTIVE', 2, CURRENT_TIMESTAMP),
(4, 2, 'Sulfamethoxazole', 'RxNorm-10160', 'DRUG', 'MODERATE', 'Diffuse maculopapular cutaneous rash and localized hives.', 'ACTIVE', 2, CURRENT_TIMESTAMP),
(5, 6, 'Ibuprofen', 'RxNorm-5640', 'DRUG', 'LIFE_THREATENING', 'Anaphylactic reaction with acute hypotension and airway compromise.', 'ACTIVE', 8, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 14. DIAGNOSES
-- ------------------------------------------------------------------------------
INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes, recorded_at) VALUES 
(1, 1, 2, 'Type 2 Diabetes Mellitus without complications', 'E11.9', '44054006', '2020-03-15', 'CHRONIC', 'Managed with oral antihyperglycemic agents and quarterly glycemic monitoring.', CURRENT_TIMESTAMP),
(2, 2, 2, 'Essential (Primary) Hypertension', 'I10', '59621000', '2021-08-10', 'ACTIVE', 'Baseline blood pressure controlled with ACE inhibitor therapy.', CURRENT_TIMESTAMP),
(3, 3, 4, 'Contact Dermatitis due to Latex', 'L23.8', '4022007', '2026-07-30', 'ACTIVE', 'Allergic reaction to latex exposure.', CURRENT_TIMESTAMP),
(4, 4, 4, 'Tension Headache', 'G44.2', '398057008', '2025-11-12', 'RESOLVED', 'Stress-related tension headaches, resolved after lifestyle modifications.', CURRENT_TIMESTAMP),
(5, 5, 2, 'Chronic Kidney Disease Stage 3', 'N18.3', '43314009', '2013-03-15', 'ACTIVE', 'Moderate GFR reduction (45-59 mL/min/1.73m2). Nephrology monitoring active.', CURRENT_TIMESTAMP),
(6, 6, 8, 'Primary Hypothyroidism', 'E03.9', '40930008', '2020-05-10', 'ACTIVE', 'Euthyroid state maintained on Levothyroxine daily.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 15. MEDICAL RECORDS
-- ------------------------------------------------------------------------------
INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes, created_at) VALUES 
(1, 1, 2, 'Routine Cardiac Follow-up & Glycemic Assessment', 'E11.9', 'Mild fatigue, occasional shortness of breath after climbing stairs.', 'Continue Metformin 500mg. Start daily 30-min walking routine. Follow up in 3 months.', 'Patient reports good compliance with diet. Blood pressure slightly elevated.', CURRENT_TIMESTAMP),
(2, 2, 2, 'Hypertension Management & ED Evaluation', 'I10', 'Occasional morning headaches, elevated blood pressure.', 'Continue Lisinopril 10mg. Monitor BP daily.', 'BP is stable on current medication.', CURRENT_TIMESTAMP),
(3, 4, 4, 'Annual Neurological Check', 'Z00.00', 'None reported.', 'Maintain regular physical exercise and sleep hygiene.', 'All vitals and reflex responses within optimal baseline parameters.', CURRENT_TIMESTAMP),
(4, 5, 2, 'CKD Stage 3 Baseline Evaluation', 'N18.3', 'Mild exertional dyspnea.', 'Low sodium, renal-adjusted regimen.', 'Renal panel and electrolytes stable.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 16. VITALS
-- ------------------------------------------------------------------------------
INSERT INTO vitals (id, patient_id, recorded_by_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose, recorded_at) VALUES 
(1, 1, 5, 134, 86, 78, 36.7, 98, 16, 70.0, 165.0, 25.7, 135, CURRENT_TIMESTAMP),
(2, 1, 5, 128, 82, 74, 36.8, 98, 16, 68.5, 165.0, 25.2, 118, CURRENT_TIMESTAMP),
(3, 2, 5, 142, 90, 85, 37.1, 97, 18, 86.0, 178.0, 27.1, 105, CURRENT_TIMESTAMP),
(4, 2, 5, 130, 84, 78, 36.9, 98, 16, 84.5, 178.0, 26.7, 98, CURRENT_TIMESTAMP),
(5, 3, 5, 110, 70, 72, 36.6, 99, 14, 55.0, 160.0, 21.5, 92, CURRENT_TIMESTAMP),
(6, 3, 5, 112, 72, 74, 36.7, 98, 14, 55.0, 160.0, 21.5, 95, CURRENT_TIMESTAMP),
(7, 3, 5, 115, 75, 75, 36.8, 99, 15, 55.0, 160.0, 21.5, 96, CURRENT_TIMESTAMP),
(8, 4, 5, 120, 78, 70, 36.6, 99, 15, 75.0, 175.0, 24.5, 92, CURRENT_TIMESTAMP),
(9, 5, 5, 136, 86, 81, 36.9, 100, 20, 69.6, 184.3, 20.5, 100, CURRENT_TIMESTAMP),
(10, 6, 5, 118, 76, 68, 36.5, 99, 14, 58.0, 162.0, 22.1, 95, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 17. FLOWSHEET ENTRIES (Intensive Care & Nursing Bedside Flowsheet)
-- ------------------------------------------------------------------------------
INSERT INTO flowsheet_entries (id, patient_id, encounter_id, recorded_by_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, respiratory_rate, temperature, oxygen_saturation, mean_arterial_pressure, fluid_intake_ml, fluid_output_ml, intake_source, output_type, pain_score, glasgow_coma_scale, pupil_reactivity, oxygen_delivery_method, fio2_percent, peep_cm_h2o, nursing_interventions, sbar_handoff_note, recorded_at) VALUES 
(1, 1, 1, 5, 128.0, 82.0, 74.0, 16.0, 36.8, 98.0, 97.3, 1200.0, 1100.0, 'Oral Fluids & Normal Saline IV @ 75 mL/hr', 'Voided Urine', 1, 15, 'PERRLA - Equal, Round, Reactive to Light (3mm)', 'Room Air', 21.0, 0.0, 'Continuous ECG telemetry active. Head of bed elevated 30 degrees.', 'S: 22 y/o M with Type 2 Diabetes for routine review. B: Admitted for cardiac evaluation. A: Vitals stable, pain 1/10. R: Continue outpatient regimen.', CURRENT_TIMESTAMP),

(2, 2, 2, 5, 142.0, 90.0, 85.0, 18.0, 37.1, 97.0, 107.3, 1500.0, 1400.0, 'IV Lactated Ringers @ 100 mL/hr', 'Urine via Foley Catheter', 3, 15, 'PERRLA - Equal, Round, Reactive to Light (3mm)', 'Nasal Cannula @ 2L/min', 28.0, 0.0, 'Administered Lisinopril 10mg PO. Monitored hourly blood pressure readings.', 'S: 53 y/o M presenting with acute morning headache and BP 155/95. B: Essential hypertension. A: BP responding well to ACEi, now 130/84. R: Monitor for 2 hours prior to discharge.', CURRENT_TIMESTAMP),

(3, 5, 5, 6, 136.0, 86.0, 81.0, 20.0, 36.9, 100.0, 102.6, 800.0, 750.0, 'IV Normal Saline @ 50 mL/hr', 'Voided Urine', 2, 15, 'PERRLA - Equal, Round, Reactive to Light (3mm)', 'Room Air', 21.0, 0.0, 'Renal fluid balance strict I/O logging. Cardiac telemetry monitored continuously.', 'S: 43 y/o M with CKD Stage 3 admitted with exertional dyspnea. B: Baseline eGFR 52. A: Chest tightness resolved, troponins negative. R: Strict renal diet and daily weight monitoring.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 18. TRIAGE RECORDS (Early Warning Score & Emergency Intake)
-- ------------------------------------------------------------------------------
INSERT INTO triage_records (id, patient_id, recorded_by_id, chief_complaint, triage_priority, vitals_summary, notes, recorded_at) VALUES 
(1, 2, 5, 'Acute morning headache and elevated home blood pressure (155/95 mmHg).', 'URGENT', 'BP 155/95 mmHg, HR 85 bpm, SpO2 97% RA, Temp 37.1C, NEWS2 Score: 3', 'Patient placed on continuous ECG monitor. Stat Lisinopril 10mg administered.', CURRENT_TIMESTAMP),
(2, 5, 6, 'Exertional dyspnea and acute retrosternal chest tightness.', 'EMERGENCY', 'BP 136/86 mmHg, HR 81 bpm, SpO2 100% RA, Temp 36.9C, NEWS2 Score: 2', 'Triage Category 2. Stat Troponin I and ECG ordered. Attending physician notified.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 19. PRESCRIPTIONS
-- ------------------------------------------------------------------------------
INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status, prescribed_at) VALUES 
(1, 1, 2, 'Metformin HCl Extended-Release', '6809', '500 mg', 'Oral', 'Twice daily with meals', 90, 3, 'Take after morning and evening meals with a full glass of water.', 'ACTIVE', CURRENT_TIMESTAMP),
(2, 2, 2, 'Lisinopril Tablets', '29046', '10 mg', 'Oral', 'Once daily in the morning', 30, 2, 'Monitor blood pressure weekly. Report dry cough or swelling.', 'ACTIVE', CURRENT_TIMESTAMP),
(3, 3, 4, 'Hydroxyzine Hydrochloride', '3423', '25 mg', 'Oral', 'As needed for allergic reaction', 14, 1, 'Take 1 tablet every 6 hours as needed. May cause drowsiness.', 'ACTIVE', CURRENT_TIMESTAMP),
(4, 4, 4, 'EpiPen Auto-Injector', '314684', '0.3 mg', 'Intramuscular', 'As needed for severe allergic reaction', 365, 2, 'Use immediately upon accidental peanut exposure and call emergency services.', 'ACTIVE', CURRENT_TIMESTAMP),
(5, 5, 2, 'Pantoprazole Sodium', '40790', '40 mg', 'Oral', 'Once daily', 30, 2, 'Take 30 minutes before morning breakfast.', 'ACTIVE', CURRENT_TIMESTAMP),
(6, 6, 8, 'Levothyroxine Sodium', '10582', '50 mcg', 'Oral', 'Once daily in the morning', 90, 3, 'Take on an empty stomach with water 30-60 minutes before breakfast.', 'ACTIVE', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 20. EMAR RECORDS (Medication Administration Records)
-- ------------------------------------------------------------------------------
INSERT INTO emar_records (id, patient_id, administered_by_id, prescription_id, medication_name, dose, route, status, notes, administered_at) VALUES 
(1, 1, 5, 1, 'Metformin HCl Extended-Release 500mg', '500 mg', 'Oral', 'ADMINISTERED', 'Administered with breakfast after 5-Rights BCMA patient wristband barcode scan confirmed.', CURRENT_TIMESTAMP),
(2, 2, 5, 2, 'Lisinopril Tablets 10mg', '10 mg', 'Oral', 'ADMINISTERED', 'Administered at bedside. Pre-administration blood pressure confirmed at 142/90 mmHg.', CURRENT_TIMESTAMP),
(3, 5, 6, 5, 'Pantoprazole Sodium 40mg', '40 mg', 'Oral', 'ADMINISTERED', 'Bedside eMAR administration verified by Nurse Priya Verma.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 21. LAB ORDERS
-- ------------------------------------------------------------------------------
INSERT INTO lab_orders (id, patient_id, encounter_id, ordering_provider_id, test_name, loinc_code, category, status, specimen_barcode, ordered_at, specimen_collected_at, in_process_at, resulted_at, reviewed_at, reviewed_by_id, clinical_notes) VALUES 
(1, 1, 1, 2, 'Comprehensive Metabolic & Lipid Panel', '24331-1', 'LABORATORY', 'COMPLETED', 'SP-372437', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 'Routine baseline clinical panel evaluation for diabetes and metabolic risk assessment.'),
(2, 2, 2, 2, 'Cardiac Troponin I & Serum Electrolyte Panel', '49563-0', 'CARDIOLOGY_LAB', 'COMPLETED', 'SP-889102', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 'Urgent stat lab order for troponin clearance in patient presenting with elevated BP.'),
(3, 5, 5, 2, 'Renal Function & Serum Creatinine Panel', '2160-0', 'LABORATORY', 'COMPLETED', 'SP-449120', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 'Assess eGFR and serum creatinine stability in CKD Stage 3 patient.');

-- ------------------------------------------------------------------------------
-- 22. LAB RESULTS
-- ------------------------------------------------------------------------------
INSERT INTO lab_results (id, lab_order_id, parameter_name, loinc_code, result_value, unit, reference_range, is_critical, flag, recorded_at) VALUES 
(1, 1, 'Fasting Blood Glucose', '1558-6', '135', 'mg/dL', '70-99 mg/dL', FALSE, 'ELEVATED', CURRENT_TIMESTAMP),
(2, 1, 'HbA1c (Glycated Hemoglobin)', '4548-4', '6.8', '%', '4.0-5.6 %', FALSE, 'ELEVATED', CURRENT_TIMESTAMP),
(3, 2, 'Cardiac Troponin I', '49563-0', '0.01', 'ng/mL', '< 0.04 ng/mL', FALSE, 'NORMAL', CURRENT_TIMESTAMP),
(4, 2, 'Serum Potassium', '2823-3', '4.2', 'mEq/L', '3.5-5.0 mEq/L', FALSE, 'NORMAL', CURRENT_TIMESTAMP),
(5, 3, 'Serum Creatinine', '2160-0', '1.4', 'mg/dL', '0.7-1.3 mg/dL', FALSE, 'ELEVATED', CURRENT_TIMESTAMP),
(6, 3, 'Estimated GFR (eGFR)', '33914-3', '52', 'mL/min/1.73m2', '> 60 mL/min/1.73m2', FALSE, 'MODERATE_REDUCTION', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 23. IMAGING ORDERS (DICOM / Radiology Reports)
-- ------------------------------------------------------------------------------
INSERT INTO imaging_orders (id, patient_id, encounter_id, ordering_provider_id, modality, procedure_name, cpt_code, status, dicom_study_instance_uid, radiologist_report, radiologist_id, ordered_at, scheduled_at, performed_at, report_generated_at, reviewed_at) VALUES 
(1, 1, 1, 2, 'CT', 'CT Angiography Chest with Contrast', '71275', 'COMPLETED', '1.2.840.113619.2.55.3.283116492.481.1691029381.102', 'FINDINGS: Lung parenchyma clean without consolidation or pneumothorax. Mediastinal contours normal. Pulmonary arterial tree well-opacified without evidence of pulmonary embolism. IMPRESSION: Unremarkable CT Chest Angiogram.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 3, 3, 4, 'MRI', 'MRI Brain without Contrast (Stroke Protocol)', '70551', 'COMPLETED', '1.2.840.113619.2.55.3.283116492.481.1691029381.103', 'FINDINGS: Brain parenchyma demonstrates mild chronic microvascular ischemic changes. No acute intracranial hemorrhage or territorial infarction. Ventricles and sulci normal for age. IMPRESSION: No acute intracranial abnormality.', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 24. PROCEDURE ORDERS (Surgical & Operative Reports)
-- ------------------------------------------------------------------------------
INSERT INTO procedure_orders (id, patient_id, encounter_id, ordering_provider_id, procedure_name, snomed_code, cpt_code, status, operative_report, proceduralist_id, ordered_at, scheduled_at, performed_at, documented_at) VALUES 
(1, 2, 2, 2, 'Percutaneous Transluminal Coronary Angioplasty (PTCA)', '415070008', '92920', 'COMPLETED', 'PROCEDURE: Left anterior descending artery drug-eluting stent deployment. Access gained via right radial artery. 3.5x18mm DES deployed at 14 atm with 0% residual stenosis and TIMI 3 flow. Patient tolerated procedure well without complications.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 25. APPOINTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, stage, reason, notes, insurance_verified, insurance_details, reports_uploaded, follow_up_date, arrived_at, vitals_id, created_at) VALUES 
(1, 1, 2, '2026-08-20 10:00:00', 'SCHEDULED', 'SCHEDULED', '3-Month Diabetes & Cardiology Review', 'Patient requested morning slot. Blood glucose logs brought.', TRUE, 'Star Health Premier Care - Policy #STAR-9874102 - Pre-auth Verified', 'HbA1c_LabReport_20260801.pdf', '2026-11-20 10:00:00', NULL, 1, CURRENT_TIMESTAMP),

(2, 2, 2, '2026-08-22 14:30:00', 'SCHEDULED', 'SCHEDULED', 'Hypertension Follow-up & BP Check', 'Follow-up on Lisinopril response and home BP monitoring log.', TRUE, 'HDFC ERGO Optima Secure - Policy #HDFC-5510923 - Verified', 'BP_Log_August2026.pdf', '2026-09-22 14:30:00', NULL, 3, CURRENT_TIMESTAMP),

(3, 3, 4, '2026-08-24 11:00:00', 'SCHEDULED', 'SCHEDULED', 'Allergy & Clinical Immunology Consult', 'Evaluating recent allergic response to latex exposure.', TRUE, 'ICICI Lombard Health Shield - Policy #ICI-7740192 - Verified', 'Allergy_PatchTest_Report.pdf', '2026-11-24 11:00:00', NULL, 5, CURRENT_TIMESTAMP),

(4, 4, 4, '2026-08-26 15:00:00', 'SCHEDULED', 'SCHEDULED', 'Neurology Routine Review', 'Annual routine neurological follow-up visit.', TRUE, 'Care Health Insurance - Policy #CARE-3341029 - Verified', 'Neuro_EMG_Report_2025.pdf', '2027-08-26 15:00:00', NULL, 8, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 26. APPOINTMENT CANCELLATIONS
-- ------------------------------------------------------------------------------
INSERT INTO appointment_cancellations (id, appointment_id, cancelled_by_user_id, cancelled_by_role, cancellation_reason, additional_comment, cancelled_at, refund_status) VALUES 
(1, 4, 12, 'ROLE_PATIENT', 'Patient work schedule conflict', 'Patient requested rescheduling to late September.', CURRENT_TIMESTAMP, 'NOT_APPLICABLE');

-- ------------------------------------------------------------------------------
-- 27. APPOINTMENT NOTES
-- ------------------------------------------------------------------------------
INSERT INTO appointment_notes (id, appointment_id, author_id, author_name, author_role, note_type, content, created_at, updated_at, is_edited, edit_history_json) VALUES 
(1, 1, 2, 'Dr. Mahtab Khan', 'ROLE_DOCTOR', 'PHYSICIAN_SOAP', 'Patient reports feeling well overall. Blood pressure 128/82, HbA1c 6.8%. Compliant with Metformin 500mg BID. No signs of peripheral neuropathy or chest discomfort.', CURRENT_TIMESTAMP, NULL, FALSE, NULL),
(2, 1, 5, 'Nurse Priya Verma', 'ROLE_NURSE', 'TRIAGE_NOTE', 'Patient arrived 10 minutes prior to appointment. Triage vitals recorded: BP 128/82, HR 74, SpO2 98%. Patient denies acute distress.', CURRENT_TIMESTAMP, NULL, FALSE, NULL),
(3, 2, 13, 'Sarita Verma', 'ROLE_RECEPTIONIST', 'INTAKE_NOTE', 'Insurance pre-authorization verified with HDFC ERGO. Copay collected.', CURRENT_TIMESTAMP, NULL, FALSE, NULL);

-- ------------------------------------------------------------------------------
-- 28. APPOINTMENT LAB ORDERS
-- ------------------------------------------------------------------------------
INSERT INTO appointment_lab_orders (id, appointment_id, test_name, priority, clinical_indications, ordered_by_id, ordered_at) VALUES 
(1, 1, 'HbA1c & Fasting Lipid Panel', 'ROUTINE', 'Quarterly glycemic and lipid evaluation for diabetic patient.', 2, CURRENT_TIMESTAMP),
(2, 2, 'Serum Creatinine & Electrolyte Panel', 'ROUTINE', 'Monitor renal function during ACE inhibitor therapy titration.', 2, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 29. APPOINTMENT BILLINGS (Revenue Cycle Invoicing)
-- ------------------------------------------------------------------------------
INSERT INTO appointment_billings (id, appointment_id, consultation_fee, triage_fee, lab_fee, pharmacy_fee, insurance_coverage, net_payable, payment_status, generated_at) VALUES 
(1, 1, 150.0, 25.0, 50.0, 35.0, 200.0, 60.0, 'PAID', CURRENT_TIMESTAMP),
(2, 2, 120.0, 25.0, 40.0, 20.0, 150.0, 55.0, 'PENDING', CURRENT_TIMESTAMP),
(3, 3, 150.0, 25.0, 0.0, 15.0, 100.0, 90.0, 'INSURANCE_CLAIM_SUBMITTED', CURRENT_TIMESTAMP),
(4, 4, 200.0, 25.0, 60.0, 0.0, 225.0, 60.0, 'PAID', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 30. ABAC POLICIES (Attribute-Based Access Control Rules)
-- ------------------------------------------------------------------------------
INSERT INTO abac_policies (id, policy_name, target_resource, action, spel_expression, active) VALUES 
(1, 'DOCTOR_ATTENDING_PATIENT_READ', 'PATIENT_RECORD', 'READ', '#user.hasRole("ROLE_DOCTOR") and #assignmentService.isAttending(#user.id, #patient.id)', TRUE),
(2, 'NURSE_DEPARTMENT_PATIENT_READ', 'CLINICAL_NOTE', 'READ', '#user.hasRole("ROLE_NURSE") and #user.department == #patient.department', TRUE),
(3, 'PATIENT_OWN_RECORD_ACCESS', 'PRESCRIPTION', 'READ', '#user.id == #patient.userId', TRUE),
(4, 'AUDITOR_WORM_LOG_READ', 'AUDIT_LOG', 'READ', '#user.hasRole("ROLE_AUDITOR")', TRUE);

-- ------------------------------------------------------------------------------
-- 31. AUDIT LOGS (ABDM / DISHA Forensic Log)
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (id, username, user_role, action, entity_name, resource_id, ip_address, details, timestamp) VALUES 
(1, 'SYSTEM', 'SYSTEM', 'SEED', 'DATABASE', '0', '127.0.0.1', 'Initialized Sentinel EHR database via manual SQL seed script with 10 production roles and RBAC+ABAC matrices.', CURRENT_TIMESTAMP),
(2, 'sysadmin.vikram', 'ROLE_SYS_ADMIN', 'CREATE', 'USER', '1', '127.0.0.1', 'Provisioned RBAC clinical access credentials across 10 production roles.', CURRENT_TIMESTAMP),
(3, 'dr.mahtab.khan', 'ROLE_DOCTOR', 'VIEW', 'PATIENT', '1', '192.168.1.102', 'Accessed patient clinical records under active attending assignment.', CURRENT_TIMESTAMP),
(4, 'nurse.priya.verma', 'ROLE_NURSE', 'CREATE', 'VITALS', '1', '192.168.1.105', 'Recorded bedside vitals and calculated NEWS2 early warning score.', CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- 32. AUTO-INCREMENT / SEQUENCE RESTART STATEMENTS
-- ------------------------------------------------------------------------------
ALTER TABLE organizations ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE departments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE permissions ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE roles ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE users ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE patients ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE beds ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE patient_assignments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE encounters ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE location_history ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE break_glass_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE lab_orders ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE lab_results ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE imaging_orders ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE procedure_orders ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE flowsheet_entries ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE triage_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE allergies ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE diagnoses ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE medical_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE vitals ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE prescriptions ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE emar_records ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointments ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointment_cancellations ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointment_notes ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointment_lab_orders ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE appointment_billings ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE abac_policies ALTER COLUMN id RESTART WITH 3000;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 3000;
