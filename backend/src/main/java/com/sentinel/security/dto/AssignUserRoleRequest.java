package com.sentinel.security.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignUserRoleRequest {
    @NotNull(message = "Role ID is required")
    private UUID roleId;

    public AssignUserRoleRequest() {}

    public UUID getRoleId() { return roleId; }
    public void setRoleId(UUID roleId) { this.roleId = roleId; }
}
