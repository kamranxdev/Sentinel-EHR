package com.sentinel.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateLabOrderRequest {
    @NotBlank(message = "Test name is required")
    private String testName;
    private String loincCode;
    private String category;
    private String clinicalNotes;
    private List<String> testCodes;

    public CreateLabOrderRequest() {}

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getLoincCode() { return loincCode; }
    public void setLoincCode(String loincCode) { this.loincCode = loincCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    public List<String> getTestCodes() { return testCodes; }
    public void setTestCodes(List<String> testCodes) { this.testCodes = testCodes; }
}
