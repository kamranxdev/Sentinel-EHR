package com.sentinel.clinical.entity;

import com.sentinel.patient.entity.Patient;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "triage_records", schema = "clinical")
public class TriageEwsRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

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

    private OffsetDateTime recordedAt = OffsetDateTime.now();

    public TriageEwsRecord() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getTriagePriority() { return triagePriority; }
    public void setTriagePriority(String triagePriority) { this.triagePriority = triagePriority; }

    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
