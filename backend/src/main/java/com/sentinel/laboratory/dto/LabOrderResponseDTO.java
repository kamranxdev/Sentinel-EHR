package com.sentinel.laboratory.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class LabOrderResponseDTO {
    private Long id;
    private UUID patientId;
    private UUID encounterId;
    private String orderingProviderEmail;
    private String testName;
    private String loincCode;
    private String category;
    private String status;
    private String specimenBarcode;
    private LocalDateTime orderedAt;
    private LocalDateTime specimenCollectedAt;
    private LocalDateTime resultedAt;
    private String clinicalNotes;
    private String patientFullName;
    private String patientMrn;
    private String patientGender;
    private String patientBirthDate;
    private String priority = "ROUTINE";
    private LocalDateTime inProcessAt;
    private LocalDateTime reviewedAt;
    private String reviewedByEmail;
    private List<LabOrderItemDTO> items;

    public LabOrderResponseDTO() {}

    public static class LabOrderItemDTO {
        private UUID id;
        private String testCode;
        private String testName;
        private String status;

        public LabOrderItemDTO() {}

        public LabOrderItemDTO(UUID id, String testCode, String testName, String status) {
            this.id = id;
            this.testCode = testCode;
            this.testName = testName;
            this.status = status;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getTestCode() { return testCode; }
        public void setTestCode(String testCode) { this.testCode = testCode; }
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getOrderingProviderEmail() { return orderingProviderEmail; }
    public void setOrderingProviderEmail(String orderingProviderEmail) { this.orderingProviderEmail = orderingProviderEmail; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getLoincCode() { return loincCode; }
    public void setLoincCode(String loincCode) { this.loincCode = loincCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSpecimenBarcode() { return specimenBarcode; }
    public void setSpecimenBarcode(String specimenBarcode) { this.specimenBarcode = specimenBarcode; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public LocalDateTime getSpecimenCollectedAt() { return specimenCollectedAt; }
    public void setSpecimenCollectedAt(LocalDateTime specimenCollectedAt) { this.specimenCollectedAt = specimenCollectedAt; }
    public LocalDateTime getInProcessAt() { return inProcessAt; }
    public void setInProcessAt(LocalDateTime inProcessAt) { this.inProcessAt = inProcessAt; }
    public LocalDateTime getResultedAt() { return resultedAt; }
    public void setResultedAt(LocalDateTime resultedAt) { this.resultedAt = resultedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getReviewedByEmail() { return reviewedByEmail; }
    public void setReviewedByEmail(String reviewedByEmail) { this.reviewedByEmail = reviewedByEmail; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    public String getPatientFullName() { return patientFullName; }
    public void setPatientFullName(String patientFullName) { this.patientFullName = patientFullName; }
    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }
    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }
    public String getPatientBirthDate() { return patientBirthDate; }
    public void setPatientBirthDate(String patientBirthDate) { this.patientBirthDate = patientBirthDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public List<LabOrderItemDTO> getItems() { return items; }
    public void setItems(List<LabOrderItemDTO> items) { this.items = items; }
}
