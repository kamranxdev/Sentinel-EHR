package com.medvault.authorization.rbac;

import java.util.Set;

public class RolePermission {
    private String roleName;
    private Set<String> permissions;

    public RolePermission() {}

    public RolePermission(String roleName, Set<String> permissions) {
        this.roleName = roleName;
        this.permissions = permissions;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }
}
