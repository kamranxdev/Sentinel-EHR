package com.sentinel.security.auth.dto;

import java.util.Set;
import java.util.UUID;

public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private Set<String> permissions;
    private UUID id;
    private UUID userId;

    public JwtAuthResponse() {}

    public JwtAuthResponse(String accessToken, String username, String email, String fullName, Set<String> roles) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public JwtAuthResponse(String accessToken, String username, String fullName, Set<String> roles, Set<String> permissions, UUID id) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.username = username;
        this.fullName = fullName;
        this.roles = roles;
        this.permissions = permissions;
        this.id = id;
        this.userId = id;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; this.userId = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; this.id = userId; }
}
