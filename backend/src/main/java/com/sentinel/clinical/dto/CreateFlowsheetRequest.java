package com.sentinel.clinical.dto;

import java.util.Map;

public class CreateFlowsheetRequest {
    private String flowsheetType;
    private Map<String, String> entries;

    public CreateFlowsheetRequest() {}

    public String getFlowsheetType() { return flowsheetType; }
    public void setFlowsheetType(String flowsheetType) { this.flowsheetType = flowsheetType; }
    public Map<String, String> getEntries() { return entries; }
    public void setEntries(Map<String, String> entries) { this.entries = entries; }
}
