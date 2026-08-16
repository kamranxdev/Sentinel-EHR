package com.sentinel.clinical.dto;

public class RecordObservationRequest {
    private String observationCode;
    private String observationName;
    private String valueString;
    private String valueUnit;

    public RecordObservationRequest() {}

    public String getObservationCode() { return observationCode; }
    public void setObservationCode(String observationCode) { this.observationCode = observationCode; }
    public String getObservationName() { return observationName; }
    public void setObservationName(String observationName) { this.observationName = observationName; }
    public String getValueString() { return valueString; }
    public void setValueString(String valueString) { this.valueString = valueString; }
    public String getValueUnit() { return valueUnit; }
    public void setValueUnit(String valueUnit) { this.valueUnit = valueUnit; }
}
