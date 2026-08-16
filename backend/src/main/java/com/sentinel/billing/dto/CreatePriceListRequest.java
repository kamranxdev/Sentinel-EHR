package com.sentinel.billing.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CreatePriceListRequest {
    private UUID organizationId;
    @NotBlank(message = "Name is required")
    private String name;
    private String currency;

    public CreatePriceListRequest() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
