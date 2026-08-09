package com.sentinel.fhir.dto;

import java.util.List;
import java.util.Map;

public class FhirEncounterResource {
    private String resourceType = "Encounter";
    private String id;
    private String status;
    private Map<String, Object> clazz;
    private Map<String, Object> subject;
    private List<Map<String, Object>> participant;
    private Map<String, Object> period;
    private List<Map<String, Object>> reasonCode;

    public FhirEncounterResource() {}

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Object> getClazz() {
        return clazz;
    }

    public void setClazz(Map<String, Object> clazz) {
        this.clazz = clazz;
    }

    public Map<String, Object> getSubject() {
        return subject;
    }

    public void setSubject(Map<String, Object> subject) {
        this.subject = subject;
    }

    public List<Map<String, Object>> getParticipant() {
        return participant;
    }

    public void setParticipant(List<Map<String, Object>> participant) {
        this.participant = participant;
    }

    public Map<String, Object> getPeriod() {
        return period;
    }

    public void setPeriod(Map<String, Object> period) {
        this.period = period;
    }

    public List<Map<String, Object>> getReasonCode() {
        return reasonCode;
    }

    public void setReasonCode(List<Map<String, Object>> reasonCode) {
        this.reasonCode = reasonCode;
    }
}
