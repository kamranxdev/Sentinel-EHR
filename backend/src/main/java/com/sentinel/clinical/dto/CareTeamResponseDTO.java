package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class CareTeamResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private String name;
    private String status;
    private OffsetDateTime createdAt;
    private List<MemberDTO> members;

    public CareTeamResponseDTO() {}

    public static class MemberDTO {
        private UUID id;
        private UUID practitionerId;
        private String practitionerName;
        private UUID userId;
        private String userName;
        private String role;
        private OffsetDateTime startedAt;
        private OffsetDateTime endedAt;

        public MemberDTO() {}

        public MemberDTO(UUID id, UUID practitionerId, String practitionerName, UUID userId, String userName, String role, OffsetDateTime startedAt, OffsetDateTime endedAt) {
            this.id = id;
            this.practitionerId = practitionerId;
            this.practitionerName = practitionerName;
            this.userId = userId;
            this.userName = userName;
            this.role = role;
            this.startedAt = startedAt;
            this.endedAt = endedAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getPractitionerId() { return practitionerId; }
        public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
        public String getPractitionerName() { return practitionerName; }
        public void setPractitionerName(String practitionerName) { this.practitionerName = practitionerName; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public OffsetDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
        public OffsetDateTime getEndedAt() { return endedAt; }
        public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<MemberDTO> getMembers() { return members; }
    public void setMembers(List<MemberDTO> members) { this.members = members; }
}
