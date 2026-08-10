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
@RequestMapping({"/api/v1/users", "/api/users"})
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(userMapper::toResponseDTO)
                .toList();
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<UserResponseDTO> getDoctors() {
        return userService.getDoctors().stream()
                .map(userMapper::toResponseDTO)
                .toList();
    }
}
