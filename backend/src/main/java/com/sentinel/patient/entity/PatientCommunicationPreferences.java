package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "patient_communication_preferences", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientCommunicationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    @Column(name = "preferred_channel", length = 30)
    private String preferredChannel;

    @Column(name = "allow_sms", nullable = false)
    private Boolean allowSms = true;

    @Column(name = "allow_email", nullable = false)
    private Boolean allowEmail = true;

    @Column(name = "allow_phone", nullable = false)
    private Boolean allowPhone = true;

    @Column(name = "allow_whatsapp", nullable = false)
    private Boolean allowWhatsapp = false;

    @Column(length = 100)
    private String language;

    public PatientCommunicationPreferences() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getPreferredChannel() { return preferredChannel; }
    public void setPreferredChannel(String preferredChannel) { this.preferredChannel = preferredChannel; }

    public Boolean getAllowSms() { return allowSms; }
    public void setAllowSms(Boolean allowSms) { this.allowSms = allowSms; }

    public Boolean getAllowEmail() { return allowEmail; }
    public void setAllowEmail(Boolean allowEmail) { this.allowEmail = allowEmail; }

    public Boolean getAllowPhone() { return allowPhone; }
    public void setAllowPhone(Boolean allowPhone) { this.allowPhone = allowPhone; }

    public Boolean getAllowWhatsapp() { return allowWhatsapp; }
    public void setAllowWhatsapp(Boolean allowWhatsapp) { this.allowWhatsapp = allowWhatsapp; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
