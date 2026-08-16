package com.sentinel.scheduling.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointment_reschedules", schema = "scheduling")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AppointmentReschedule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "old_starts_at", nullable = false)
    private OffsetDateTime oldStartsAt;

    @Column(name = "old_ends_at", nullable = false)
    private OffsetDateTime oldEndsAt;

    @Column(name = "new_starts_at", nullable = false)
    private OffsetDateTime newStartsAt;

    @Column(name = "new_ends_at", nullable = false)
    private OffsetDateTime newEndsAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescheduled_by")
    private User rescheduledBy;

    @Column(nullable = false)
    private OffsetDateTime rescheduledAt = OffsetDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String reason;

    public AppointmentReschedule() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public OffsetDateTime getOldStartsAt() { return oldStartsAt; }
    public void setOldStartsAt(OffsetDateTime oldStartsAt) { this.oldStartsAt = oldStartsAt; }

    public OffsetDateTime getOldEndsAt() { return oldEndsAt; }
    public void setOldEndsAt(OffsetDateTime oldEndsAt) { this.oldEndsAt = oldEndsAt; }

    public OffsetDateTime getNewStartsAt() { return newStartsAt; }
    public void setNewStartsAt(OffsetDateTime newStartsAt) { this.newStartsAt = newStartsAt; }

    public OffsetDateTime getNewEndsAt() { return newEndsAt; }
    public void setNewEndsAt(OffsetDateTime newEndsAt) { this.newEndsAt = newEndsAt; }

    public User getRescheduledBy() { return rescheduledBy; }
    public void setRescheduledBy(User rescheduledBy) { this.rescheduledBy = rescheduledBy; }

    public OffsetDateTime getRescheduledAt() { return rescheduledAt; }
    public void setRescheduledAt(OffsetDateTime rescheduledAt) { this.rescheduledAt = rescheduledAt; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
