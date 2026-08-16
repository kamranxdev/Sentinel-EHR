package com.sentinel.patient.dto;

public class CreateFamilyHistoryRequest {
    private String relationship;
    private String conditionCode;
    private String conditionName;
    private Integer ageAtOnset;
    private Boolean deceased;
    private String causeOfDeath;
    private String notes;

    public CreateFamilyHistoryRequest() {}

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }
    public String getConditionCode() { return conditionCode; }
    public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }
    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }
    public Integer getAgeAtOnset() { return ageAtOnset; }
    public void setAgeAtOnset(Integer ageAtOnset) { this.ageAtOnset = ageAtOnset; }
    public Boolean getDeceased() { return deceased; }
    public void setDeceased(Boolean deceased) { this.deceased = deceased; }
    public String getCauseOfDeath() { return causeOfDeath; }
    public void setCauseOfDeath(String causeOfDeath) { this.causeOfDeath = causeOfDeath; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
