package com.sentinel.security;

import java.util.UUID;

public class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_ORGANIZATION_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> CURRENT_USER_ID = new ThreadLocal<>();

    public static UUID getCurrentOrganizationId() {
        return CURRENT_ORGANIZATION_ID.get();
    }

    public static UUID getOrganizationId() {
        return CURRENT_ORGANIZATION_ID.get();
    }

    public static void setCurrentOrganizationId(UUID organizationId) {
        CURRENT_ORGANIZATION_ID.set(organizationId);
    }

    public static UUID getCurrentUserId() {
        return CURRENT_USER_ID.get();
    }

    public static UUID getUserId() {
        return CURRENT_USER_ID.get();
    }

    public static void setCurrentUserId(UUID userId) {
        CURRENT_USER_ID.set(userId);
    }

    public static void clear() {
        CURRENT_ORGANIZATION_ID.remove();
        CURRENT_USER_ID.remove();
    }
}
