package com.sentinel.laboratory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "lab_order_items", schema = "laboratory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LabOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    @Column(nullable = false, length = 100)
    private String testCode;

    private String testName;
    private String status = "ORDERED";

    public LabOrderItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LabOrder getLabOrder() { return labOrder; }
    public void setLabOrder(LabOrder labOrder) { this.labOrder = labOrder; }

    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
