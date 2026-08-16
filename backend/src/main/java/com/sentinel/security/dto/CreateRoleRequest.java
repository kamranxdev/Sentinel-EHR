package com.sentinel.security.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public class CreateRoleRequest {
    @NotBlank(message = "Role name is required")
    private String name;
    private String description;
    private List<UUID> permissionIds;

    public CreateRoleRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<UUID> getPermissionIds() { return permissionIds; }
    public void setPermissionIds(List<UUID> permissionIds) { this.permissionIds = permissionIds; }
}
