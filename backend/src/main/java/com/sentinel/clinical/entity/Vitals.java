package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vital_sign_sets", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vitals {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @Column(nullable = false)
    private OffsetDateTime recordedAt = OffsetDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    private BigDecimal systolicBp;
    private BigDecimal diastolicBp;
    private BigDecimal meanArterialPressure;
    private BigDecimal heartRate;
    private BigDecimal respiratoryRate;
    private BigDecimal temperature;
    private String temperatureUnit = "C";
    private BigDecimal oxygenSaturation;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private BigDecimal bmi;
    private BigDecimal bloodGlucose;
    private String glucoseUnit;
    private BigDecimal painScore;
    private String position;
    private String oxygenDeliveryMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Vitals() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public BigDecimal getSystolicBp() { return systolicBp; }
    public void setSystolicBp(BigDecimal systolicBp) { this.systolicBp = systolicBp; }

    public BigDecimal getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(BigDecimal diastolicBp) { this.diastolicBp = diastolicBp; }

    public BigDecimal getMeanArterialPressure() { return meanArterialPressure; }
    public void setMeanArterialPressure(BigDecimal meanArterialPressure) { this.meanArterialPressure = meanArterialPressure; }

    public BigDecimal getHeartRate() { return heartRate; }
    public void setHeartRate(BigDecimal heartRate) { this.heartRate = heartRate; }

    public BigDecimal getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(BigDecimal respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }

    public String getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }

    public BigDecimal getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(BigDecimal oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) {
        this.heightCm = heightCm;
        calculateBmi();
    }

    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        calculateBmi();
    }

    private void calculateBmi() {
        if (weightKg != null && heightCm != null && heightCm.doubleValue() > 0) {
            double heightM = heightCm.doubleValue() / 100.0;
            double bmiVal = weightKg.doubleValue() / (heightM * heightM);
            this.bmi = BigDecimal.valueOf(Math.round(bmiVal * 10.0) / 10.0);
        }
    }

    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }

    public BigDecimal getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(BigDecimal bloodGlucose) { this.bloodGlucose = bloodGlucose; }

    public String getGlucoseUnit() { return glucoseUnit; }
    public void setGlucoseUnit(String glucoseUnit) { this.glucoseUnit = glucoseUnit; }

    public BigDecimal getPainScore() { return painScore; }
    public void setPainScore(BigDecimal painScore) { this.painScore = painScore; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getOxygenDeliveryMethod() { return oxygenDeliveryMethod; }
    public void setOxygenDeliveryMethod(String oxygenDeliveryMethod) { this.oxygenDeliveryMethod = oxygenDeliveryMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
