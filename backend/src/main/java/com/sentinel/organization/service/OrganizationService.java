package com.sentinel.organization.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.organization.dto.OrganizationRegistrationDTO;
import com.sentinel.organization.dto.OrganizationResponseDTO;
import com.sentinel.organization.dto.OrganizationStatusUpdateDTO;
import com.sentinel.organization.entity.Organization;
import com.sentinel.organization.mapper.OrganizationMapper;
import com.sentinel.organization.repository.OrganizationRepository;
import com.sentinel.users.entity.Role;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.RoleRepository;
import com.sentinel.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditTrailService auditTrailService;
    private final OrganizationMapper organizationMapper;

    public OrganizationService(OrganizationRepository organizationRepository,
                               UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               AuditTrailService auditTrailService,
                               OrganizationMapper organizationMapper) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditTrailService = auditTrailService;
        this.organizationMapper = organizationMapper;
    }

    @Transactional
    public OrganizationResponseDTO registerOrganization(OrganizationRegistrationDTO dto) {
        if (organizationRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
            throw new IllegalArgumentException("An organization with license number '" + dto.getLicenseNumber() + "' is already registered.");
        }

        if (userRepository.existsByUsername(dto.getAdminUsername())) {
            throw new IllegalArgumentException("Username '" + dto.getAdminUsername() + "' is already taken.");
        }

        if (userRepository.existsByEmail(dto.getAdminEmail())) {
            throw new IllegalArgumentException("Email '" + dto.getAdminEmail() + "' is already registered.");
        }

        String generatedCode = "ORG-" + (1000 + new Random().nextInt(9000));
        while (organizationRepository.existsByOrgCode(generatedCode)) {
            generatedCode = "ORG-" + (1000 + new Random().nextInt(9000));
        }

        Organization org = new Organization();
        org.setOrgCode(generatedCode);
        org.setName(dto.getOrgName());
        org.setLicenseNumber(dto.getLicenseNumber());
        org.setEmail(dto.getEmail());
        org.setPhone(dto.getPhone());
        org.setAddress(dto.getAddress());
        org.setStatus("PENDING_VERIFICATION");

        Organization savedOrg = organizationRepository.save(org);

        Role orgAdminRole = roleRepository.findByName("ROLE_ORG_ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("Default ROLE_ORG_ADMIN role not found."));

        User adminUser = new User();
        adminUser.setUsername(dto.getAdminUsername());
        adminUser.setPassword(passwordEncoder.encode(dto.getAdminPassword()));
        adminUser.setEmail(dto.getAdminEmail());
        adminUser.setFullName(dto.getAdminFullName());
        adminUser.setRoles(Collections.singleton(orgAdminRole));
        adminUser.setOrganization(savedOrg);
        adminUser.setDepartment("Platform Administration & Security");
        adminUser.setVerificationStatus("VERIFIED");

        userRepository.save(adminUser);

        auditTrailService.logAction(
                dto.getAdminUsername(),
                "ROLE_ORG_ADMIN",
                "REGISTER_ORGANIZATION",
                "ORGANIZATION",
                String.valueOf(savedOrg.getId()),
                "Self-registered new clinical facility '" + savedOrg.getName() + "' (Code: " + savedOrg.getOrgCode() + ") pending System Admin verification."
        );

        return organizationMapper.toResponseDTO(savedOrg);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponseDTO> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(organizationMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponseDTO getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization #" + id + " not found"));
        return organizationMapper.toResponseDTO(org);
    }

    @Transactional
    public OrganizationResponseDTO updateOrganizationStatus(Long id, OrganizationStatusUpdateDTO statusDto, Authentication auth) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization #" + id + " not found"));

        String oldStatus = org.getStatus();
        org.setStatus(statusDto.getStatus());
        Organization updated = organizationRepository.save(org);

        auditTrailService.logAction(
                auth,
                "UPDATE_ORGANIZATION_STATUS",
                "ORGANIZATION",
                String.valueOf(id),
                "System Admin updated status for facility '" + org.getName() + "' from " + oldStatus + " to " + statusDto.getStatus()
        );

        return organizationMapper.toResponseDTO(updated);
    }

    @Transactional
    public OrganizationResponseDTO updateOrganizationDetails(Long id, OrganizationResponseDTO dto, Authentication auth) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization #" + id + " not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) org.setName(dto.getName());
        if (dto.getEmail() != null) org.setEmail(dto.getEmail());
        if (dto.getPhone() != null) org.setPhone(dto.getPhone());
        if (dto.getAddress() != null) org.setAddress(dto.getAddress());

        Organization updated = organizationRepository.save(org);

        auditTrailService.logAction(
                auth,
                "UPDATE_ORGANIZATION_PROFILE",
                "ORGANIZATION",
                String.valueOf(id),
                "Updated organizational profile details for " + org.getName()
        );

        return organizationMapper.toResponseDTO(updated);
    }
}
