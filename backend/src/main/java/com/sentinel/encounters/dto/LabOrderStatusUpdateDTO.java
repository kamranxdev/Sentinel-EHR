package com.sentinel.encounters.dto;

import jakarta.validation.constraints.NotBlank;

public class LabOrderStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    private String status;

    private String barcode;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
}
