package com.sentinel.security.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    private String username;
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {}

    public LoginRequest(String username, String password) {
        this.username = username;
        this.usernameOrEmail = username;
        this.password = password;
    }

    public String getUsername() {
        return username != null && !username.isBlank() ? username : usernameOrEmail;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.usernameOrEmail == null || this.usernameOrEmail.isBlank()) {
            this.usernameOrEmail = username;
        }
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail != null && !usernameOrEmail.isBlank() ? usernameOrEmail : username;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
        if (this.username == null || this.username.isBlank()) {
            this.username = usernameOrEmail;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
