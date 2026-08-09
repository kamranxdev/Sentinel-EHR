package com.sentinel.users.controller;

import com.sentinel.users.entity.User;
import com.sentinel.users.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/users", "/api/users"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<User> getDoctors() {
        return userService.getDoctors();
    }
}
