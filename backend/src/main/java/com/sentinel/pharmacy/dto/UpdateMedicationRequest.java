package com.sentinel.pharmacy.dto;

public class UpdateMedicationRequest {
    private String name;
    private String genericName;
    private String rxNormCode;
    private String form;
    private String strength;

    public UpdateMedicationRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }
    public String getRxNormCode() { return rxNormCode; }
    public void setRxNormCode(String rxNormCode) { this.rxNormCode = rxNormCode; }
    public String getForm() { return form; }
    public void setForm(String form) { this.form = form; }
    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }
}
