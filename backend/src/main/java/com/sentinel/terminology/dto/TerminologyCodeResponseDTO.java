package com.sentinel.terminology.dto;

import java.time.LocalDate;
import java.util.UUID;

public class TerminologyCodeResponseDTO {
    private UUID id;
    private UUID codeSystemId;
    private String codeSystemCode;
    private String code;
    private String display;
    private String parentCode;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean active;

    public TerminologyCodeResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCodeSystemId() { return codeSystemId; }
    public void setCodeSystemId(UUID codeSystemId) { this.codeSystemId = codeSystemId; }
    public String getCodeSystemCode() { return codeSystemCode; }
    public void setCodeSystemCode(String codeSystemCode) { this.codeSystemCode = codeSystemCode; }
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
