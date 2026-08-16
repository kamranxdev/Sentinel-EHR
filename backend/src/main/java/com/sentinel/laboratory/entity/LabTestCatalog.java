package com.sentinel.laboratory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "lab_test_catalog", schema = "laboratory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LabTestCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String testCode;

    @Column(nullable = false, length = 255)
    private String testName;

    private String loincCode;
    private String category;
    private String referenceRange;
    private String unit;

    public LabTestCatalog() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public String getLoincCode() { return loincCode; }
    public void setLoincCode(String loincCode) { this.loincCode = loincCode; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getReferenceRange() { return referenceRange; }
    public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
