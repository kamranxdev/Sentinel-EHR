package com.sentinel.pharmacy.dto;

import java.util.UUID;

public class MedicationResponseDTO {
    private UUID id;
    private String name;
    private String genericName;
    private String rxNormCode;
    private String form;
    private String strength;

    public MedicationResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
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
