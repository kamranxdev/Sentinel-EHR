package com.sentinel.security.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignPermissionRequest {
    @NotNull(message = "Permission ID is required")
    private UUID permissionId;

    public AssignPermissionRequest() {}

    public UUID getPermissionId() { return permissionId; }
    public void setPermissionId(UUID permissionId) { this.permissionId = permissionId; }
}
