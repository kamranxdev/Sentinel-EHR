package com.sentinel.vitals.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vitals")
public class Vitals {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recorded_by_id", nullable = false)
    private User recordedBy;

    private String bloodPressure;   // e.g. "120/80"
    private Integer heartRate;       // bpm
    private Double temperature;      // °C or °F
    private Integer oxygenSaturation;// %
    private Integer respiratoryRate; // breaths/min
    private Double weightKg;
    private Double heightCm;
    private Double bmi;
    private Integer bloodGlucose;    // mg/dL
    private Integer painScore;       // 0-10 pain scale
    private Integer fluidIntakeMl;   // mL
    private Integer fluidOutputMl;   // mL

    private LocalDateTime recordedAt = LocalDateTime.now();

    public Vitals() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Integer oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Integer respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
        calculateBmi();
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
        calculateBmi();
    }

    public Double getBmi() {
        return bmi;
    }

    public void setBmi(Double bmi) {
        this.bmi = bmi;
    }

    public Integer getBloodGlucose() {
        return bloodGlucose;
    }

    public void setBloodGlucose(Integer bloodGlucose) {
        this.bloodGlucose = bloodGlucose;
    }

    public Integer getPainScore() {
        return painScore;
    }

    public void setPainScore(Integer painScore) {
        this.painScore = painScore;
    }

    public Integer getFluidIntakeMl() {
        return fluidIntakeMl;
    }

    public void setFluidIntakeMl(Integer fluidIntakeMl) {
        this.fluidIntakeMl = fluidIntakeMl;
    }

    public Integer getFluidOutputMl() {
        return fluidOutputMl;
    }

    public void setFluidOutputMl(Integer fluidOutputMl) {
        this.fluidOutputMl = fluidOutputMl;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    private void calculateBmi() {
        if (weightKg != null && heightCm != null && heightCm > 0) {
            double heightM = heightCm / 100.0;
            this.bmi = Math.round((weightKg / (heightM * heightM)) * 10.0) / 10.0;
        }
    }

    public org.hl7.fhir.r4.model.Observation toFhirResource() {
        org.hl7.fhir.r4.model.Observation obs = new org.hl7.fhir.r4.model.Observation();
        if (id != null) {
            obs.setId("Observation/" + id);
        }

        obs.setStatus(org.hl7.fhir.r4.model.Observation.ObservationStatus.FINAL);

        org.hl7.fhir.r4.model.CodeableConcept category = obs.addCategory();
        category.addCoding(new org.hl7.fhir.r4.model.Coding(
                "http://terminology.hl7.org/CodeSystem/observation-category",
                "vital-signs",
                "Vital Signs"
        ));

        org.hl7.fhir.r4.model.CodeableConcept codeConcept = new org.hl7.fhir.r4.model.CodeableConcept();
        codeConcept.addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "85353-1", "Vital Signs Panel"));
        codeConcept.setText("Vital Signs Measurement");
        obs.setCode(codeConcept);

        if (patient != null && patient.getId() != null) {
            obs.setSubject(new org.hl7.fhir.r4.model.Reference("Patient/" + patient.getId()));
        }

        if (recordedBy != null && recordedBy.getId() != null) {
            obs.addPerformer(new org.hl7.fhir.r4.model.Reference("Practitioner/" + recordedBy.getId()));
        }

        if (recordedAt != null) {
            obs.setEffective(new org.hl7.fhir.r4.model.DateTimeType(java.sql.Timestamp.valueOf(recordedAt)));
        }

        // Components: Heart Rate (LOINC 8867-4)
        if (heartRate != null) {
            org.hl7.fhir.r4.model.Observation.ObservationComponentComponent comp = obs.addComponent();
            comp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "8867-4", "Heart rate")));
            comp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(heartRate).setUnit("beats/min").setCode("/min").setSystem("http://unitsofmeasure.org"));
        }

        // Component: SpO2 (LOINC 2708-6)
        if (oxygenSaturation != null) {
            org.hl7.fhir.r4.model.Observation.ObservationComponentComponent comp = obs.addComponent();
            comp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "2708-6", "Oxygen saturation")));
            comp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(oxygenSaturation).setUnit("%").setCode("%").setSystem("http://unitsofmeasure.org"));
        }

        // Component: Temperature (LOINC 8310-5)
        if (temperature != null) {
            org.hl7.fhir.r4.model.Observation.ObservationComponentComponent comp = obs.addComponent();
            comp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "8310-5", "Body temperature")));
            comp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(temperature).setUnit("Cel").setCode("Cel").setSystem("http://unitsofmeasure.org"));
        }

        // Component: Respiratory Rate (LOINC 9279-1)
        if (respiratoryRate != null) {
            org.hl7.fhir.r4.model.Observation.ObservationComponentComponent comp = obs.addComponent();
            comp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "9279-1", "Respiratory rate")));
            comp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(respiratoryRate).setUnit("breaths/min").setCode("/min").setSystem("http://unitsofmeasure.org"));
        }

        // Component: Blood Pressure (LOINC 8480-6 Systolic & LOINC 8462-4 Diastolic)
        if (bloodPressure != null && bloodPressure.contains("/")) {
            String[] parts = bloodPressure.split("/");
            try {
                double sys = Double.parseDouble(parts[0].trim());
                double dia = Double.parseDouble(parts[1].trim());

                org.hl7.fhir.r4.model.Observation.ObservationComponentComponent sysComp = obs.addComponent();
                sysComp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "8480-6", "Systolic blood pressure")));
                sysComp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(sys).setUnit("mmHg").setCode("mm[Hg]").setSystem("http://unitsofmeasure.org"));

                org.hl7.fhir.r4.model.Observation.ObservationComponentComponent diaComp = obs.addComponent();
                diaComp.setCode(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(new org.hl7.fhir.r4.model.Coding("http://loinc.org", "8462-4", "Diastolic blood pressure")));
                diaComp.setValue(new org.hl7.fhir.r4.model.Quantity().setValue(dia).setUnit("mmHg").setCode("mm[Hg]").setSystem("http://unitsofmeasure.org"));
            } catch (Exception ignored) {}
        }

        return obs;
    }
}

