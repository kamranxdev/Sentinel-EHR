package com.sentinel.identity.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.dto.AddOrganizationMemberRequest;
import com.sentinel.identity.dto.UserOrganizationResponseDTO;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserOrganizationService {

    private final UserOrganizationRepository userOrganizationRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public UserOrganizationService(UserOrganizationRepository userOrganizationRepository,
                                   UserRepository userRepository,
                                   OrganizationRepository organizationRepository) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    public UserOrganizationResponseDTO addUserToOrganization(UUID organizationId, UUID userId, AddOrganizationMemberRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserOrganization membership = userOrganizationRepository.findByUserIdAndOrganizationId(userId, organizationId)
                .orElseGet(() -> {
                    UserOrganization uo = new UserOrganization();
                    uo.setOrganization(org);
                    uo.setUser(user);
                    return uo;
                });

        membership.setStatus("ACTIVE");
        if (request != null) {
            if (request.getEmployeeCode() != null) membership.setEmployeeCode(request.getEmployeeCode());
            if (request.getEmploymentType() != null) membership.setEmploymentType(request.getEmploymentType());
            membership.setJoinedAt(request.getJoinedAt() != null ? request.getJoinedAt() : LocalDate.now());
        } else {
            membership.setJoinedAt(LocalDate.now());
        }

        UserOrganization saved = userOrganizationRepository.save(membership);
        return mapToDTO(saved);
    }

    public void removeUserFromOrganization(UUID organizationId, UUID userId) {
        UserOrganization membership = userOrganizationRepository.findByUserIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("User organization membership not found"));
        membership.setStatus("INACTIVE");
        membership.setLeftAt(LocalDate.now());
        userOrganizationRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<UserOrganizationResponseDTO> getOrganizationUsers(UUID organizationId) {
        return userOrganizationRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserOrganizationResponseDTO mapToDTO(UserOrganization uo) {
        UserOrganizationResponseDTO dto = new UserOrganizationResponseDTO();
        dto.setId(uo.getId());
        if (uo.getUser() != null) {
            dto.setUserId(uo.getUser().getId());
            dto.setUserFullName(uo.getUser().getFullName());
            dto.setUserEmail(uo.getUser().getEmail());
        }
        if (uo.getOrganization() != null) {
            dto.setOrganizationId(uo.getOrganization().getId());
            dto.setOrganizationName(uo.getOrganization().getName());
        }
        dto.setEmployeeCode(uo.getEmployeeCode());
        dto.setEmploymentType(uo.getEmploymentType());
        dto.setStatus(uo.getStatus());
        dto.setJoinedAt(uo.getJoinedAt());
        dto.setLeftAt(uo.getLeftAt());
        return dto;
    }
}
