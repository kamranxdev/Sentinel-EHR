package com.sentinel.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

public class RecordLabResultRequest {
    @NotBlank(message = "Test code is required")
    private String testCode;
    private String testName;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private String abnormalFlag;
    private Boolean isCritical;
    private List<LabComponentRequest> components;

    public RecordLabResultRequest() {}

    public static class LabComponentRequest {
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

        public LabComponentRequest() {}

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
    public List<LabComponentRequest> getComponents() { return components; }
    public void setComponents(List<LabComponentRequest> components) { this.components = components; }
}
