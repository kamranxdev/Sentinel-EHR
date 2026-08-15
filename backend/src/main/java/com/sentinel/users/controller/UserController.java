package com.sentinel.users.controller;

import com.sentinel.users.dto.UserResponseDTO;
import com.sentinel.users.mapper.UserMapper;
import com.sentinel.users.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') or hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_NURSE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_ADMIN')")
    public List<UserResponseDTO> getDoctors() {
        return userService.getDoctors().stream()
                .map(userMapper::toResponseDTO)
                .toList();
    }
}
