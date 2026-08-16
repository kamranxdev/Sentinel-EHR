package com.sentinel.laboratory.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class LabResultResponseDTO {
    private UUID id;
    private Long labOrderId;
    private UUID patientId;
    private String testCode;
    private String testName;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String abnormalFlag;
    private Boolean isCritical;
    private String status;
    private OffsetDateTime resultAt;
    private List<LabResultComponentDTO> components;

    public LabResultResponseDTO() {}

    public static class LabResultComponentDTO {
        private UUID id;
        private String code;
        private String name;
        private BigDecimal valueNumeric;
        private String valueText;
        private String unit;
        private BigDecimal referenceLow;
        private BigDecimal referenceHigh;
        private String abnormalFlag;
        private Boolean critical;
        private String interpretation;

        public LabResultComponentDTO() {}

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
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

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Long getLabOrderId() { return labOrderId; }
    public void setLabOrderId(Long labOrderId) { this.labOrderId = labOrderId; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
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
    public Boolean getIsCritical() { return isCritical; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getResultAt() { return resultAt; }
    public void setResultAt(OffsetDateTime resultAt) { this.resultAt = resultAt; }
    public List<LabResultComponentDTO> getComponents() { return components; }
    public void setComponents(List<LabResultComponentDTO> components) { this.components = components; }
}
