package com.sentinel.clinical.dto;

public class AddFlowsheetEntryRequest {
    private String itemKey;
    private String itemValue;

    public AddFlowsheetEntryRequest() {}

    public AddFlowsheetEntryRequest(String itemKey, String itemValue) {
        this.itemKey = itemKey;
        this.itemValue = itemValue;
    }

    public String getItemKey() { return itemKey; }
    public void setItemKey(String itemKey) { this.itemKey = itemKey; }
    public String getItemValue() { return itemValue; }
    public void setItemValue(String itemValue) { this.itemValue = itemValue; }
}
