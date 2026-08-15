package com.sentinel.vitals.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_records")
public class TriageEwsRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recorded_by_id", nullable = false)
    private User recordedBy;

    private String chiefComplaint;
    private String triagePriority = "ROUTINE";
    private String vitalsSummary;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public TriageEwsRecord() {}

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

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getTriagePriority() {
        return triagePriority;
    }

    public void setTriagePriority(String triagePriority) {
        this.triagePriority = triagePriority;
    }

    public String getVitalsSummary() {
        return vitalsSummary;
    }

    public void setVitalsSummary(String vitalsSummary) {
        this.vitalsSummary = vitalsSummary;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
