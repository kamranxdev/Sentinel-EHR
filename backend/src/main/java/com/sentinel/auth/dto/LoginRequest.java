package com.sentinel.auth.dto;

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
        return username != null ? username : usernameOrEmail;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail != null ? usernameOrEmail : username;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
