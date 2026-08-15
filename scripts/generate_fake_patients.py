#!/usr/bin/env python3
"""
==============================================================================
Sentinel EHR - Standalone Fake Realistic Patient Data Generator CLI
==============================================================================
This tool generates realistic fake patient data and associated clinical records
(Encounters, Diagnoses, Vitals, Allergies, Prescriptions, Lab Orders/Results,
and Medical Records) specifically formatted for the Sentinel EHR database schema.

- Independent CLI tool (No API dependencies, No Spring Boot coupling)
- Generates compliant SQL (PostgreSQL / H2 / MySQL) or JSON export
- Incorporates Indian demographics, ABDM ABHA IDs, Aadhaar-formatted IDs, ICD-10 & SNOMED CT codes

Usage Examples:
    python3 scripts/generate_fake_patients.py --count 10 --output scripts/seed_fake_patients.sql
    python3 scripts/generate_fake_patients.py --count 5 --format json --output scripts/patients.json
==============================================================================
"""

import argparse
import datetime
import json
import random
import sys

# ------------------------------------------------------------------------------
# Data Pools for Realistic Generation
# ------------------------------------------------------------------------------

MALE_FIRST_NAMES = [
    "Aarav", "Rohan", "Rahul", "Vikram", "Aditya", "Kabir", "Arjun", "Dev",
    "Kamran", "Siddharth", "Karan", "Vihaan", "Amit", "Rajesh", "Sanjay", "Pranav"
]

FEMALE_FIRST_NAMES = [
    "Ananya", "Priya", "Neha", "Meera", "Riya", "Pooja", "Sunita", "Kavita",
    "Ishita", "Sneha", "Anjali", "Diya", "Shreya", "Deepika", "Aditi", "Nisha"
]

LAST_NAMES = [
    "Sharma", "Patel", "Verma", "Gupta", "Singh", "Reddy", "Joshi", "Deshmukh",
    "Menon", "Khan", "Kumar", "Iyer", "Chowdhury", "Rao", "Nair", "Bhat"
]

CITIES = [
    ("Mumbai", "400001"), ("Delhi", "110001"), ("Bengaluru", "560001"),
    ("Hyderabad", "500001"), ("Ahmedabad", "380001"), ("Chennai", "600001"),
    ("Kolkata", "700001"), ("Pune", "411001")
]

INSURERS = [
    ("Star Health Insurance", "Comprehensive PM-JAY & Health Shield"),
    ("HDFC ERGO Health", "Optima Secure Comprehensive"),
    ("ICICI Lombard", "Complete Health Care Plan"),
    ("Care Health Insurance", "Care Supreme Gold Protection"),
    ("Bajaj Allianz", "Health Guard Platinum Plan")
]

DEPARTMENTS = [
    "Cardiovascular Medicine", "General Internal Medicine", "Orthopedic Surgery",
    "Pulmonology & Critical Care", "Neurology", "Gastroenterology", "Endocrinology"
]

CONDITIONS = [
    {"name": "Essential Hypertension", "icd": "I10", "snomed": "59621000", "notes": "Longitudinal blood pressure monitoring required. Prescribed ARB/ACEi therapy."},
    {"name": "Type 2 Diabetes Mellitus", "icd": "E11.9", "snomed": "44054006", "notes": "Glycemic control managed via metformin & lifestyle modifications. Quarterly HbA1c testing."},
    {"name": "Hyperlipidemia", "icd": "E78.5", "snomed": "55822004", "notes": "Elevated LDL cholesterol profile. Statin therapy prescribed with low-fat diet plan."},
    {"name": "Bronchial Asthma", "icd": "J45.909", "snomed": "195967001", "notes": "Reversible airway obstruction. Managed with ICS/LABA inhaler and trigger avoidance."},
    {"name": "Coronary Artery Disease", "icd": "I25.10", "snomed": "53741008", "notes": "History of exertional angina. Regular ECG and echocardiogram surveillance scheduled."},
    {"name": "Chronic Kidney Disease Stage 3", "icd": "N18.3", "snomed": "43314009", "notes": "Moderate GFR reduction (45-59 mL/min/1.73m2). Nephrology monitoring active."}
]

ALLERGIES = [
    {"name": "Penicillin G", "code": "RxNorm-70618", "category": "DRUG", "severity": "SEVERE", "reaction": "Acute urticaria, facial angioedema, and bronchospasm within 30 min of administration."},
    {"name": "Amoxicillin", "code": "RxNorm-723", "category": "DRUG", "severity": "MODERATE", "reaction": "Maculopapular cutaneous rash across trunk and upper limbs."},
    {"name": "Ibuprofen", "code": "RxNorm-5640", "category": "DRUG", "severity": "LIFE_THREATENING", "reaction": "Anaphylactic reaction with acute hypotension and airway compromise."},
    {"name": "Natural Rubber Latex", "code": "RxNorm-10255", "category": "ENVIRONMENTAL", "severity": "MODERATE", "reaction": "Contact dermatitis and localized erythema on contact."},
    {"name": "Peanuts", "code": "RxNorm-100234", "category": "FOOD", "severity": "SEVERE", "reaction": "Oropharyngeal swelling, throat tightness, and systemic histamine release."}
]

MEDICATIONS = [
    {"name": "Metformin HCl", "rxnorm": "RxNorm-6809", "dosage": "500mg", "route": "Oral", "frequency": "Twice Daily", "instructions": "Take with meals to reduce gastrointestinal discomfort."},
    {"name": "Lisinopril", "rxnorm": "RxNorm-29046", "dosage": "10mg", "route": "Oral", "frequency": "Once Daily", "instructions": "Take in the morning. Monitor serum potassium and blood pressure."},
    {"name": "Atorvastatin Calcium", "rxnorm": "RxNorm-83367", "dosage": "20mg", "route": "Oral", "frequency": "Once Daily", "instructions": "Take at bedtime with or without food."},
    {"name": "Amlodipine Besylate", "rxnorm": "RxNorm-17767", "dosage": "5mg", "route": "Oral", "frequency": "Once Daily", "instructions": "Take consistently every morning. Monitor for lower extremity edema."},
    {"name": "Pantoprazole Sodium", "rxnorm": "RxNorm-40790", "dosage": "40mg", "route": "Oral", "frequency": "Once Daily", "instructions": "Take 30 minutes before morning breakfast."}
]

CHIEF_COMPLAINTS = [
    "Acute retrosternal chest discomfort radiating to left arm during physical exertion.",
    "Persistent dry cough, mild dyspnea, and low-grade evening pyrexia for 5 days.",
    "Routine follow-up for Glycemic and Blood Pressure control evaluation.",
    "Acute severe right lower quadrant abdominal pain accompanied by nausea.",
    "Bilateral knee joint stiffness and localized swelling worse in the morning."
]

def escape_sql(text):
    if text is None:
        return "NULL"
    return "'" + str(text).replace("'", "''") + "'"

def generate_patients(count):
    patients = []
    encounters = []
    diagnoses = []
    vitals = []
    allergies = []
    prescriptions = []
    lab_orders = []
    lab_results = []
    medical_records = []

    start_date = datetime.date(2025, 1, 1)

    for i in range(1, count + 1):
        is_female = random.choice([True, False])
        gender = "Female" if is_female else "Male"
        first_name = random.choice(FEMALE_FIRST_NAMES if is_female else MALE_FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"

        patient_code = f"MRN-{random.randint(100000, 999999)}"
        abha_id = f"91-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        national_id = f"AADHAAR-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        
        dob_year = random.randint(1950, 2005)
        dob_month = random.randint(1, 12)
        dob_day = random.randint(1, 28)
        dob = datetime.date(dob_year, dob_month, dob_day)

        blood_type = random.choice(["A+", "B+", "O+", "AB+", "O-", "A-", "B-"])
        phone = f"+91 {random.randint(7000000000, 9999999999)}"
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 99)}@sentinel-health.in"

        city, pin_code = random.choice(CITIES)
        address = f"House No. {random.randint(1, 150)}, Block {random.choice(['A','B','C','D'])}, {city}"
        emergency_contact = f"Kin ({random.choice(['Spouse', 'Sibling', 'Parent'])}) - +91 {random.randint(7000000000, 9999999999)}"

        insurer_name, plan_name = random.choice(INSURERS)
        policy_num = f"POL-{random.randint(100000, 999999)}"
        group_num = f"GRP-{random.randint(1000, 9999)}"

        dept = random.choice(DEPARTMENTS)
        med_alert = f"High Fidelity Synthetic Record | Blood Type: {blood_type} | Dept: {dept}"

        patient = {
            "id": i,
            "patient_code": patient_code,
            "abha_id": abha_id,
            "national_id": national_id,
            "full_name": full_name,
            "date_of_birth": str(dob),
            "gender": gender,
            "blood_type": blood_type,
            "phone": phone,
            "email": email,
            "address": address,
            "pin_code": pin_code,
            "emergency_contact": emergency_contact,
            "insurance_provider": insurer_name,
            "insurance_policy_number": policy_num,
            "insurance_group_number": group_num,
            "coverage_plan": plan_name,
            "medical_alerts": med_alert,
            "user_id": None
        }
        patients.append(patient)

        # 1. Generate Encounters
        for e in range(1, 3):
            enc_id = len(encounters) + 1
            enc_type = random.choice(["OUTPATIENT", "INPATIENT", "EMERGENCY", "TELEHEALTH"])
            complaint = random.choice(CHIEF_COMPLAINTS)
            notes = f"Patient {full_name} presented with {complaint.lower()} Physical examination intact. Plan formulated."
            discharge = f"Patient stable at time of discharge. Advice given for compliance with medication."
            
            encounters.append({
                "id": enc_id,
                "patient_id": i,
                "attending_provider_id": 2, # Default Doctor user ID
                "encounter_type": enc_type,
                "chief_complaint": complaint,
                "clinical_notes": notes,
                "discharge_summary": discharge,
                "status": "COMPLETED"
            })

        # 2. Generate Diagnoses
        cond = random.choice(CONDITIONS)
        diag_id = len(diagnoses) + 1
        diagnoses.append({
            "id": diag_id,
            "patient_id": i,
            "doctor_id": 2,
            "condition_name": cond["name"],
            "icd_code": cond["icd"],
            "snomed_code": cond["snomed"],
            "onset_date": str(dob.replace(year=dob.year + 30)),
            "status": "ACTIVE",
            "notes": cond["notes"]
        })

        # 3. Generate Vitals
        vit_id = len(vitals) + 1
        sys_bp = random.randint(110, 145)
        dia_bp = random.randint(70, 92)
        hr = random.randint(60, 95)
        temp = round(36.3 + random.uniform(0.1, 1.2), 1)
        spo2 = random.randint(95, 100)
        resp = random.randint(14, 20)
        weight = round(55.0 + random.uniform(5.0, 35.0), 1)
        height = round(155.0 + random.uniform(5.0, 30.0), 1)
        bmi = round(weight / ((height / 100.0) ** 2), 1)
        glucose = random.randint(85, 140)

        vitals.append({
            "id": vit_id,
            "patient_id": i,
            "recorded_by_id": 3, # Default Nurse user ID
            "blood_pressure": f"{sys_bp}/{dia_bp}",
            "heart_rate": hr,
            "temperature": temp,
            "oxygen_saturation": spo2,
            "respiratory_rate": resp,
            "weight_kg": weight,
            "height_cm": height,
            "bmi": bmi,
            "blood_glucose": glucose
        })

        # 4. Generate Allergies
        if random.choice([True, False]):
            alg = random.choice(ALLERGIES)
            allergies.append({
                "id": len(allergies) + 1,
                "patient_id": i,
                "allergen_name": alg["name"],
                "allergen_code": alg["code"],
                "category": alg["category"],
                "severity": alg["severity"],
                "reaction_description": alg["reaction"],
                "status": "ACTIVE",
                "recorded_by_id": 2
            })

        # 5. Generate Prescriptions
        med = random.choice(MEDICATIONS)
        prescriptions.append({
            "id": len(prescriptions) + 1,
            "patient_id": i,
            "doctor_id": 2,
            "medication_name": med["name"],
            "rx_norm_code": med["rxnorm"],
            "dosage": med["dosage"],
            "route": med["route"],
            "frequency": med["frequency"],
            "duration_days": 30,
            "refills": 2,
            "instructions": med["instructions"],
            "status": "ACTIVE"
        })

        # 6. Generate Lab Orders & Results
        order_id = len(lab_orders) + 1
        lab_orders.append({
            "id": order_id,
            "patient_id": i,
            "encounter_id": (i * 2) - 1,
            "ordering_provider_id": 2,
            "test_name": "Comprehensive Metabolic & Lipid Panel",
            "loinc_code": "24331-1",
            "category": "LABORATORY",
            "status": "COMPLETED",
            "specimen_barcode": f"SP-{random.randint(100000,999999)}",
            "clinical_notes": "Routine baseline clinical panel evaluation."
        })

        lab_results.append({
            "id": len(lab_results) + 1,
            "lab_order_id": order_id,
            "parameter_name": "Fasting Blood Glucose",
            "loinc_code": "1558-6",
            "result_value": str(glucose),
            "unit": "mg/dL",
            "reference_range": "70-99 mg/dL",
            "is_critical": False,
            "flag": "NORMAL" if glucose < 100 else "ELEVATED"
        })

        # 7. Generate Medical Record
        medical_records.append({
            "id": len(medical_records) + 1,
            "patient_id": i,
            "doctor_id": 2,
            "diagnosis": cond["name"],
            "icd_code": cond["icd"],
            "symptoms": complaint,
            "treatment_plan": f"Initiated {med['name']} ({med['dosage']}). Recommended low sodium diet and 30 minutes daily light aerobic exercise.",
            "notes": f"Longitudinal care plan logged for {full_name}."
        })

    return {
        "patients": patients,
        "encounters": encounters,
        "diagnoses": diagnoses,
        "vitals": vitals,
        "allergies": allergies,
        "prescriptions": prescriptions,
        "lab_orders": lab_orders,
        "lab_results": lab_results,
        "medical_records": medical_records
    }

def format_sql(data):
    lines = []
    lines.append("-- ==============================================================================")
    lines.append("-- Sentinel EHR Synthetic Patient Data Seed Script")
    lines.append(f"-- Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"-- Total Patients Generated: {len(data['patients'])}")
    lines.append("-- ==============================================================================\n")

    # Patients
    lines.append("-- 1. Patients Table Seeding")
    for p in data["patients"]:
        lines.append(
            f"INSERT INTO patients (patient_code, abha_id, national_id, full_name, date_of_birth, gender, blood_type, phone, email, address, pin_code, emergency_contact, insurance_provider, insurance_policy_number, insurance_group_number, coverage_plan, medical_alerts) "
            f"VALUES ({escape_sql(p['patient_code'])}, {escape_sql(p['abha_id'])}, {escape_sql(p['national_id'])}, {escape_sql(p['full_name'])}, '{p['date_of_birth']}', {escape_sql(p['gender'])}, {escape_sql(p['blood_type'])}, {escape_sql(p['phone'])}, {escape_sql(p['email'])}, {escape_sql(p['address'])}, {escape_sql(p['pin_code'])}, {escape_sql(p['emergency_contact'])}, {escape_sql(p['insurance_provider'])}, {escape_sql(p['insurance_policy_number'])}, {escape_sql(p['insurance_group_number'])}, {escape_sql(p['coverage_plan'])}, {escape_sql(p['medical_alerts'])});"
        )

    lines.append("\n-- 2. Encounters Table Seeding")
    for e in data["encounters"]:
        lines.append(
            f"INSERT INTO encounters (patient_id, attending_provider_id, encounter_type, chief_complaint, clinical_notes, discharge_summary, status) "
            f"VALUES ({e['patient_id']}, {e['attending_provider_id']}, {escape_sql(e['encounter_type'])}, {escape_sql(e['chief_complaint'])}, {escape_sql(e['clinical_notes'])}, {escape_sql(e['discharge_summary'])}, {escape_sql(e['status'])});"
        )

    lines.append("\n-- 3. Diagnoses Table Seeding")
    for d in data["diagnoses"]:
        lines.append(
            f"INSERT INTO diagnoses (patient_id, doctor_id, condition_name, icd_code, snomed_code, onset_date, status, notes) "
            f"VALUES ({d['patient_id']}, {d['doctor_id']}, {escape_sql(d['condition_name'])}, {escape_sql(d['icd_code'])}, {escape_sql(d['snomed_code'])}, '{d['onset_date']}', {escape_sql(d['status'])}, {escape_sql(d['notes'])});"
        )

    lines.append("\n-- 4. Vitals Table Seeding")
    for v in data["vitals"]:
        lines.append(
            f"INSERT INTO vitals (patient_id, recorded_by_id, blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate, weight_kg, height_cm, bmi, blood_glucose) "
            f"VALUES ({v['patient_id']}, {v['recorded_by_id']}, {escape_sql(v['blood_pressure'])}, {v['heart_rate']}, {v['temperature']}, {v['oxygen_saturation']}, {v['respiratory_rate']}, {v['weight_kg']}, {v['height_cm']}, {v['bmi']}, {v['blood_glucose']});"
        )

    lines.append("\n-- 5. Allergies Table Seeding")
    for a in data["allergies"]:
        lines.append(
            f"INSERT INTO allergies (patient_id, allergen_name, allergen_code, category, severity, reaction_description, status, recorded_by_id) "
            f"VALUES ({a['patient_id']}, {escape_sql(a['allergen_name'])}, {escape_sql(a['allergen_code'])}, {escape_sql(a['category'])}, {escape_sql(a['severity'])}, {escape_sql(a['reaction_description'])}, {escape_sql(a['status'])}, {a['recorded_by_id']});"
        )

    lines.append("\n-- 6. Prescriptions Table Seeding")
    for rx in data["prescriptions"]:
        lines.append(
            f"INSERT INTO prescriptions (patient_id, doctor_id, medication_name, rx_norm_code, dosage, route, frequency, duration_days, refills, instructions, status) "
            f"VALUES ({rx['patient_id']}, {rx['doctor_id']}, {escape_sql(rx['medication_name'])}, {escape_sql(rx['rx_norm_code'])}, {escape_sql(rx['dosage'])}, {escape_sql(rx['route'])}, {escape_sql(rx['frequency'])}, {rx['duration_days']}, {rx['refills']}, {escape_sql(rx['instructions'])}, {escape_sql(rx['status'])});"
        )

    lines.append("\n-- 7. Lab Orders & Lab Results Seeding")
    for lo in data["lab_orders"]:
        lines.append(
            f"INSERT INTO lab_orders (patient_id, encounter_id, ordering_provider_id, test_name, loinc_code, category, status, specimen_barcode, clinical_notes) "
            f"VALUES ({lo['patient_id']}, {lo['encounter_id']}, {lo['ordering_provider_id']}, {escape_sql(lo['test_name'])}, {escape_sql(lo['loinc_code'])}, {escape_sql(lo['category'])}, {escape_sql(lo['status'])}, {escape_sql(lo['specimen_barcode'])}, {escape_sql(lo['clinical_notes'])});"
        )

    for lr in data["lab_results"]:
        lines.append(
            f"INSERT INTO lab_results (lab_order_id, parameter_name, loinc_code, result_value, unit, reference_range, is_critical, flag) "
            f"VALUES ({lr['lab_order_id']}, {escape_sql(lr['parameter_name'])}, {escape_sql(lr['loinc_code'])}, {escape_sql(lr['result_value'])}, {escape_sql(lr['unit'])}, {escape_sql(lr['reference_range'])}, {'TRUE' if lr['is_critical'] else 'FALSE'}, {escape_sql(lr['flag'])});"
        )

    lines.append("\n-- 8. Medical Records Seeding")
    for mr in data["medical_records"]:
        lines.append(
            f"INSERT INTO medical_records (patient_id, doctor_id, diagnosis, icd_code, symptoms, treatment_plan, notes) "
            f"VALUES ({mr['patient_id']}, {mr['doctor_id']}, {escape_sql(mr['diagnosis'])}, {escape_sql(mr['icd_code'])}, {escape_sql(mr['symptoms'])}, {escape_sql(mr['treatment_plan'])}, {escape_sql(mr['notes'])});"
        )

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Sentinel EHR Standalone Realistic Patient Data Generator")
    parser.add_argument("--count", type=int, default=10, help="Number of fake patients to generate (default: 10)")
    parser.add_argument("--format", choices=["sql", "json"], default="sql", help="Output format: sql or json (default: sql)")
    parser.add_argument("--output", type=str, default="scripts/seed_fake_patients.sql", help="Output file path (default: scripts/seed_fake_patients.sql)")

    args = parser.parse_args()

    print(f"🩺 Sentinel EHR Standalone Patient Data Generator")
    print(f"Generating {args.count} realistic fake patient profiles...")

    data = generate_patients(args.count)

    if args.format == "json":
        output_content = json.dumps(data, indent=2)
    else:
        output_content = format_sql(data)

    if args.output == "-":
        print(output_content)
    else:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_content)
        print(f"✅ Generated fake realistic patient data successfully! Output saved to: {args.output}")

if __name__ == "__main__":
    main()
