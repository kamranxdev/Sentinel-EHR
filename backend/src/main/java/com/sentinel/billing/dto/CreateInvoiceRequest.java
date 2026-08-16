package com.sentinel.billing.dto;

import java.util.List;
import java.util.UUID;

public class CreateInvoiceRequest {
    private String invoiceNumber;
    private List<AddInvoiceItemRequest> items;

    public CreateInvoiceRequest() {}

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public List<AddInvoiceItemRequest> getItems() { return items; }
    public void setItems(List<AddInvoiceItemRequest> items) { this.items = items; }
}
