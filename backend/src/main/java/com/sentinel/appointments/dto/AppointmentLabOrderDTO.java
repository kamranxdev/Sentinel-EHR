package com.sentinel.appointments.dto;

import java.time.LocalDateTime;

public class AppointmentLabOrderDTO {

    private Long id;
    private Long appointmentId;
    private String testName;
    private String priority;
    private String clinicalIndications;
    private Long orderedById;
    private String orderedByName;
    private LocalDateTime orderedAt;

    public AppointmentLabOrderDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getClinicalIndications() {
        return clinicalIndications;
    }

    public void setClinicalIndications(String clinicalIndications) {
        this.clinicalIndications = clinicalIndications;
    }

    public Long getOrderedById() {
        return orderedById;
    }

    public void setOrderedById(Long orderedById) {
        this.orderedById = orderedById;
    }

    public String getOrderedByName() {
        return orderedByName;
    }

    public void setOrderedByName(String orderedByName) {
        this.orderedByName = orderedByName;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }
}
