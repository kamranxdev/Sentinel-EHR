package com.sentinel.scheduling.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "appointment_participants", schema = "scheduling")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AppointmentParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id")
    private Practitioner practitioner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "participant_type", length = 50)
    private String participantType;

    public AppointmentParticipant() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public Practitioner getPractitioner() { return practitioner; }
    public void setPractitioner(Practitioner practitioner) { this.practitioner = practitioner; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getParticipantType() { return participantType; }
    public void setParticipantType(String participantType) { this.participantType = participantType; }
}
