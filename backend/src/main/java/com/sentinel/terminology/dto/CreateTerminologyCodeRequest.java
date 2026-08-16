package com.sentinel.terminology.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class CreateTerminologyCodeRequest {
    @NotBlank(message = "Code is required")
    private String code;
    private String display;
    private String parentCode;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean active;

    public CreateTerminologyCodeRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDisplay() { return display; }
    public void setDisplay(String display) { this.display = display; }
    public String getParentCode() { return parentCode; }
    public void setParentCode(String parentCode) { this.parentCode = parentCode; }
    public LocalDate getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
