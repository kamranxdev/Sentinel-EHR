package com.sentinel.users.mapper;

import com.sentinel.users.dto.UserResponseDTO;
import com.sentinel.users.entity.Role;
import com.sentinel.users.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponseDTO toResponseDTO(User entity) {
        if (entity == null) return null;

        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setFullName(entity.getFullName());
        dto.setSpecialization(entity.getSpecialization());
        dto.setDepartment(entity.getDepartment());
        dto.setLicenseNumber(entity.getLicenseNumber());
        dto.setQualifications(entity.getQualifications());
        dto.setYearsOfExperience(entity.getYearsOfExperience());
        dto.setMedicalBoardState(entity.getMedicalBoardState());
        dto.setVerificationStatus(entity.getVerificationStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getRoles() != null) {
            dto.setRoles(entity.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet()));
        }

        return dto;
    }
}
