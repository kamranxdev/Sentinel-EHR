package com.sentinel.patient.dto;

public class UpdateDemographicsRequest {
    private String race;
    private String ethnicity;
    private String religion;
    private String bloodGroup;
    private String rhFactor;

    public UpdateDemographicsRequest() {}

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
