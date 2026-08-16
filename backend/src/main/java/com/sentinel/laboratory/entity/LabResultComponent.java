package com.sentinel.laboratory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "lab_result_components", schema = "laboratory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LabResultComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lab_result_id", nullable = false)
    private LabResult labResult;

    @Column(length = 100)
    private String code;

    @Column(name = "code_system", length = 50)
    private String codeSystem = "LOINC";

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "value_numeric", precision = 18, scale = 6)
    private BigDecimal valueNumeric;

    @Column(name = "value_text", columnDefinition = "TEXT")
    private String valueText;

    @Column(length = 50)
    private String unit;

    @Column(name = "reference_low", precision = 18, scale = 6)
    private BigDecimal referenceLow;

    @Column(name = "reference_high", precision = 18, scale = 6)
    private BigDecimal referenceHigh;

    @Column(name = "abnormal_flag", length = 30)
    private String abnormalFlag;

    @Column(nullable = false)
    private Boolean critical = false;

    @Column(columnDefinition = "TEXT")
    private String interpretation;

    public LabResultComponent() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LabResult getLabResult() { return labResult; }
    public void setLabResult(LabResult labResult) { this.labResult = labResult; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCodeSystem() { return codeSystem; }
    public void setCodeSystem(String codeSystem) { this.codeSystem = codeSystem; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getValueNumeric() { return valueNumeric; }
    public void setValueNumeric(BigDecimal valueNumeric) { this.valueNumeric = valueNumeric; }

    public String getValueText() { return valueText; }
    public void setValueText(String valueText) { this.valueText = valueText; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getReferenceLow() { return referenceLow; }
    public void setReferenceLow(BigDecimal referenceLow) { this.referenceLow = referenceLow; }

    public BigDecimal getReferenceHigh() { return referenceHigh; }
    public void setReferenceHigh(BigDecimal referenceHigh) { this.referenceHigh = referenceHigh; }

    public String getAbnormalFlag() { return abnormalFlag; }
    public void setAbnormalFlag(String abnormalFlag) { this.abnormalFlag = abnormalFlag; }

    public Boolean getCritical() { return critical; }
    public void setCritical(Boolean critical) { this.critical = critical; }

    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
}
