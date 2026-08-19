package com.sentinel.identity.mapper;

import com.sentinel.identity.dto.UserResponseDTO;
import com.sentinel.identity.entity.User;
import com.sentinel.security.entity.Role;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponseDTO toResponseDTO(User user) {
        if (user == null) return null;
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setStatus(user.getStatus());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }
        return dto;
    }
}
