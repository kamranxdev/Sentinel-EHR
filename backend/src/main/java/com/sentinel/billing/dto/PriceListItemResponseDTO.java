package com.sentinel.billing.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PriceListItemResponseDTO {
    private UUID id;
    private UUID priceListId;
    private String serviceType;
    private String serviceCode;
    private String description;
    private BigDecimal amount;

    public PriceListItemResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPriceListId() { return priceListId; }
    public void setPriceListId(UUID priceListId) { this.priceListId = priceListId; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getServiceCode() { return serviceCode; }
    public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
