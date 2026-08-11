package com.sentinel.laboratory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    @Column(nullable = false)
    private String parameterName; // e.g. Hemoglobin, WBC, Serum Creatinine

    private String loincCode;

    @Column(nullable = false)
    private String resultValue; // e.g. 14.2, 8.5

    private String unit; // g/dL, 10^3/uL, mg/dL

    private String referenceRange; // 12.0-16.0 g/dL

    private Boolean isCritical = false; // Flag for critical lab alerts

    private String flag; // NORMAL, HIGH, LOW, CRITICAL_HIGH, CRITICAL_LOW

    private LocalDateTime recordedAt = LocalDateTime.now();

    public LabResult() {}

    public LabResult(LabOrder labOrder, String parameterName, String loincCode, String resultValue, String unit, String referenceRange, String flag, Boolean isCritical) {
        this.labOrder = labOrder;
        this.parameterName = parameterName;
        this.loincCode = loincCode;
        this.resultValue = resultValue;
        this.unit = unit;
        this.referenceRange = referenceRange;
        this.flag = flag;
        this.isCritical = isCritical != null ? isCritical : false;
        this.recordedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LabOrder getLabOrder() {
        return labOrder;
    }

    public void setLabOrder(LabOrder labOrder) {
        this.labOrder = labOrder;
    }

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public String getLoincCode() {
        return loincCode;
    }

    public void setLoincCode(String loincCode) {
        this.loincCode = loincCode;
    }

    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public Boolean getIsCritical() {
        return isCritical;
    }

    public void setIsCritical(Boolean isCritical) {
        this.isCritical = isCritical;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
