package com.sentinel.security.dto;

import java.util.List;
import java.util.UUID;

public class RoleResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private List<PermissionDTO> permissions;

    public RoleResponseDTO() {}

    public static class PermissionDTO {
        private UUID id;
        private String code;
        private String name;
        private String category;

        public PermissionDTO() {}

        public PermissionDTO(UUID id, String code, String name, String category) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.category = category;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<PermissionDTO> getPermissions() { return permissions; }
    public void setPermissions(List<PermissionDTO> permissions) { this.permissions = permissions; }
}
