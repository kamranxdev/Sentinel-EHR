package com.sentinel.nursing.entity;

import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "flowsheet_entries")
public class FlowsheetEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_id", nullable = false)
    private User recordedBy;

    // Vitals Telemetry
    private Double bloodPressureSystolic;
    private Double bloodPressureDiastolic;
    private Double heartRate;
    private Double respiratoryRate;
    private Double temperature;
    private Double oxygenSaturation;
    private Double meanArterialPressure; // MAP

    // Fluid Balance (Intake vs Output)
    private Double fluidIntakeMl;
    private Double fluidOutputMl;
    private String intakeSource; // Oral, IV Normal Saline, Blood Product
    private String outputType; // Urine, Drain, Emesis

    // Pain & Neurological
    private Integer painScore; // 0-10
    private Integer glasgowComaScale; // 3-15 GCS
    private String pupilReactivity;

    // Respiratory Support
    private String oxygenDeliveryMethod; // Room Air, Nasal Cannula, Venturi Mask, Mechanical Vent
    private Double fio2Percent; // 21-100%
    private Double peepCmH2o;

    // Interventions & SBAR Shift Handoff
    @Column(length = 2000)
    private String nursingInterventions;

    @Column(length = 3000)
    private String sbarHandoffNote; // Situation, Background, Assessment, Recommendation

    private LocalDateTime recordedAt = LocalDateTime.now();

    public FlowsheetEntry() {}

    public FlowsheetEntry(Patient patient, Encounter encounter, User recordedBy) {
        this.patient = patient;
        this.encounter = encounter;
        this.recordedBy = recordedBy;
        this.recordedAt = LocalDateTime.now();
    }

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

    public Encounter getEncounter() {
        return encounter;
    }

    public void setEncounter(Encounter encounter) {
        this.encounter = encounter;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public Double getBloodPressureSystolic() {
        return bloodPressureSystolic;
    }

    public void setBloodPressureSystolic(Double bloodPressureSystolic) {
        this.bloodPressureSystolic = bloodPressureSystolic;
    }

    public Double getBloodPressureDiastolic() {
        return bloodPressureDiastolic;
    }

    public void setBloodPressureDiastolic(Double bloodPressureDiastolic) {
        this.bloodPressureDiastolic = bloodPressureDiastolic;
    }

    public Double getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Double heartRate) {
        this.heartRate = heartRate;
    }

    public Double getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Double respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Double oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public Double getMeanArterialPressure() {
        return meanArterialPressure;
    }

    public void setMeanArterialPressure(Double meanArterialPressure) {
        this.meanArterialPressure = meanArterialPressure;
    }

    public Double getFluidIntakeMl() {
        return fluidIntakeMl;
    }

    public void setFluidIntakeMl(Double fluidIntakeMl) {
        this.fluidIntakeMl = fluidIntakeMl;
    }

    public Double getFluidOutputMl() {
        return fluidOutputMl;
    }

    public void setFluidOutputMl(Double fluidOutputMl) {
        this.fluidOutputMl = fluidOutputMl;
    }

    public String getIntakeSource() {
        return intakeSource;
    }

    public void setIntakeSource(String intakeSource) {
        this.intakeSource = intakeSource;
    }

    public String getOutputType() {
        return outputType;
    }

    public void setOutputType(String outputType) {
        this.outputType = outputType;
    }

    public Integer getPainScore() {
        return painScore;
    }

    public void setPainScore(Integer painScore) {
        this.painScore = painScore;
    }

    public Integer getGlasgowComaScale() {
        return glasgowComaScale;
    }

    public void setGlasgowComaScale(Integer glasgowComaScale) {
        this.glasgowComaScale = glasgowComaScale;
    }

    public String getPupilReactivity() {
        return pupilReactivity;
    }

    public void setPupilReactivity(String pupilReactivity) {
        this.pupilReactivity = pupilReactivity;
    }

    public String getOxygenDeliveryMethod() {
        return oxygenDeliveryMethod;
    }

    public void setOxygenDeliveryMethod(String oxygenDeliveryMethod) {
        this.oxygenDeliveryMethod = oxygenDeliveryMethod;
    }

    public Double getFio2Percent() {
        return fio2Percent;
    }

    public void setFio2Percent(Double fio2Percent) {
        this.fio2Percent = fio2Percent;
    }

    public Double getPeepCmH2o() {
        return peepCmH2o;
    }

    public void setPeepCmH2o(Double peepCmH2o) {
        this.peepCmH2o = peepCmH2o;
    }

    public String getNursingInterventions() {
        return nursingInterventions;
    }

    public void setNursingInterventions(String nursingInterventions) {
        this.nursingInterventions = nursingInterventions;
    }

    public String getSbarHandoffNote() {
        return sbarHandoffNote;
    }

    public void setSbarHandoffNote(String sbarHandoffNote) {
        this.sbarHandoffNote = sbarHandoffNote;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
