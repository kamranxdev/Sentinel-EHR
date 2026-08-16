package com.sentinel.clinical.dto;

import java.time.LocalDate;

public class AddProblemRequest {
    private String codeSystem;
    private String code;
    private String problemName;
    private LocalDate onsetDate;
    private String notes;

    public AddProblemRequest() {}

    public String getCodeSystem() { return codeSystem; }
    public void setCodeSystem(String codeSystem) { this.codeSystem = codeSystem; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getProblemName() { return problemName; }
    public void setProblemName(String problemName) { this.problemName = problemName; }
    public LocalDate getOnsetDate() { return onsetDate; }
    public void setOnsetDate(LocalDate onsetDate) { this.onsetDate = onsetDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
