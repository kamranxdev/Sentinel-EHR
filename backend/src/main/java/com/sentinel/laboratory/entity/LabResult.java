package com.sentinel.laboratory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lab_results", schema = "laboratory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 100)
    private String testCode;

    private String testName;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String abnormalFlag;
    private Boolean isCritical = false;
    private String status = "FINAL";

    @Column(nullable = false)
    private OffsetDateTime resultAt = OffsetDateTime.now();

    public LabResult() {}

    public Boolean getIsCritical() { return isCritical; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LabOrder getLabOrder() { return labOrder; }
    public void setLabOrder(LabOrder labOrder) { this.labOrder = labOrder; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public String getResultValue() { return resultValue; }
    public void setResultValue(String resultValue) { this.resultValue = resultValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getReferenceRange() { return referenceRange; }
    public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }

    public String getAbnormalFlag() { return abnormalFlag; }
    public void setAbnormalFlag(String abnormalFlag) { this.abnormalFlag = abnormalFlag; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getResultAt() { return resultAt; }
    public void setResultAt(OffsetDateTime resultAt) { this.resultAt = resultAt; }
}
