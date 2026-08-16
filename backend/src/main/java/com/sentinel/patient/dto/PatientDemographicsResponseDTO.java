package com.sentinel.patient.dto;

import java.util.UUID;

public class PatientDemographicsResponseDTO {
    private UUID id;
    private UUID patientId;
    private String race;
    private String ethnicity;
    private String religion;
    private String bloodGroup;
    private String rhFactor;

    public PatientDemographicsResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getRace() { return race; }
    public void setRace(String race) { this.race = race; }
    public String getEthnicity() { return ethnicity; }
    public void setEthnicity(String ethnicity) { this.ethnicity = ethnicity; }
    public String getReligion() { return religion; }
    public void setReligion(String religion) { this.religion = religion; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getRhFactor() { return rhFactor; }
    public void setRhFactor(String rhFactor) { this.rhFactor = rhFactor; }
}
