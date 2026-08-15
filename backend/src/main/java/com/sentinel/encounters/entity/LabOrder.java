package com.sentinel.encounters.entity;

import com.sentinel.vitals.entity.LabResult;
import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_orders")
public class LabOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ordering_provider_id", nullable = false)
    private User orderingProvider;

    @Column(nullable = false)
    private String testName;

    private String loincCode;

    @Column(nullable = false)
    private String category = "LABORATORY";

    @Column(nullable = false)
    private String status = "ORDERED";

    private String specimenBarcode;

    private LocalDateTime orderedAt = LocalDateTime.now();
    private LocalDateTime specimenCollectedAt;
    private LocalDateTime inProcessAt;
    private LocalDateTime resultedAt;
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(length = 1000)
    private String clinicalNotes;

    @OneToMany(mappedBy = "labOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LabResult> results = new ArrayList<>();

    public LabOrder() {}

    public LabOrder(Patient patient, Encounter encounter, User orderingProvider, String testName, String loincCode, String clinicalNotes) {
        this.patient = patient;
        this.encounter = encounter;
        this.orderingProvider = orderingProvider;
        this.testName = testName;
        this.loincCode = loincCode;
        this.clinicalNotes = clinicalNotes;
        this.status = "ORDERED";
        this.orderedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Encounter getEncounter() {
        return encounter;
    }

    public void setEncounter(Encounter encounter) {
        this.encounter = encounter;
    }

    public User getOrderingProvider() {
        return orderingProvider;
    }

    public void setOrderingProvider(User orderingProvider) {
        this.orderingProvider = orderingProvider;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getLoincCode() {
        return loincCode;
    }

    public void setLoincCode(String loincCode) {
        this.loincCode = loincCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSpecimenBarcode() {
        return specimenBarcode;
    }

    public void setSpecimenBarcode(String specimenBarcode) {
        this.specimenBarcode = specimenBarcode;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public LocalDateTime getSpecimenCollectedAt() {
        return specimenCollectedAt;
    }

    public void setSpecimenCollectedAt(LocalDateTime specimenCollectedAt) {
        this.specimenCollectedAt = specimenCollectedAt;
    }

    public LocalDateTime getInProcessAt() {
        return inProcessAt;
    }

    public void setInProcessAt(LocalDateTime inProcessAt) {
        this.inProcessAt = inProcessAt;
    }

    public LocalDateTime getResultedAt() {
        return resultedAt;
    }

    public void setResultedAt(LocalDateTime resultedAt) {
        this.resultedAt = resultedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public List<LabResult> getResults() {
        return results;
    }

    public void setResults(List<LabResult> results) {
        this.results = results;
    }
}
