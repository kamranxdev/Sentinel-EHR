package com.sentinel.users.controller;

import com.sentinel.audit.dto.AuditLogResponseDTO;
import com.sentinel.audit.mapper.AuditLogMapper;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.organization.dto.OrganizationResponseDTO;
import com.sentinel.organization.entity.Organization;
import com.sentinel.organization.mapper.OrganizationMapper;
import com.sentinel.organization.service.OrganizationService;
import com.sentinel.users.dto.UserPasswordResetRequestDTO;
import com.sentinel.users.dto.UserResponseDTO;
import com.sentinel.users.dto.UserStatusUpdateRequestDTO;
import com.sentinel.users.dto.UserUpdateRequestDTO;
import com.sentinel.users.entity.Role;
import com.sentinel.users.entity.User;
import com.sentinel.users.mapper.UserMapper;
import com.sentinel.users.repository.RoleRepository;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Dedicated Organization Administrator Controller.
 * Scoped strictly to the authenticated user's organization (multi-tenant facility boundaries).
 */
@RestController
@RequestMapping("/api/v1/org-admin")
@PreAuthorize("hasAuthority('ROLE_ORG_ADMIN')")
public class OrgAdminController {

    private final OrganizationService organizationService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditTrailService auditTrailService;
    private final UserMapper userMapper;
    private final AuditLogMapper auditLogMapper;
    private final OrganizationMapper organizationMapper;

    public OrgAdminController(OrganizationService organizationService,
                              UserService userService,
                              UserRepository userRepository,
                              RoleRepository roleRepository,
                              PasswordEncoder passwordEncoder,
                              AuditTrailService auditTrailService,
                              UserMapper userMapper,
                              AuditLogMapper auditLogMapper,
                              OrganizationMapper organizationMapper) {
        this.organizationService = organizationService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditTrailService = auditTrailService;
        this.userMapper = userMapper;
        this.auditLogMapper = auditLogMapper;
        this.organizationMapper = organizationMapper;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userService.getUserByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + auth.getName()));
    }

    private Organization getAuthenticatedOrganization(Authentication auth) {
        User admin = getAuthenticatedUser(auth);
        if (admin.getOrganization() == null) {
            throw new ResourceNotFoundException("User '" + auth.getName() + "' is not linked to any registered Organization.");
        }
        return admin.getOrganization();
    }

    @GetMapping("/facility")
    public ResponseEntity<OrganizationResponseDTO> getFacilityDetails(Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        return ResponseEntity.ok(organizationMapper.toResponseDTO(org));
    }

    @PutMapping("/facility")
    public ResponseEntity<OrganizationResponseDTO> updateFacilityDetails(@RequestBody OrganizationResponseDTO payload, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        return ResponseEntity.ok(organizationService.updateOrganizationDetails(org.getId(), payload, auth));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getFacilityUsers(Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        List<User> orgUsers = userService.getUsersByOrganization(org.getId());
        return ResponseEntity.ok(orgUsers.stream().map(userMapper::toResponseDTO).toList());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponseDTO> onboardFacilityStaff(@Valid @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);

        if (userRepository.existsByUsername(payload.getUsername())) {
            throw new IllegalArgumentException("Username '" + payload.getUsername() + "' is already taken.");
        }

        User newUser = new User();
        newUser.setUsername(payload.getUsername());
        newUser.setPassword(passwordEncoder.encode(payload.getPassword() != null ? payload.getPassword() : "Sentinel#1234"));
        newUser.setEmail(payload.getEmail());
        newUser.setFullName(payload.getFullName());
        newUser.setDepartment(payload.getDepartment() != null ? payload.getDepartment() : "Clinical Operations");
        newUser.setSpecialization(payload.getSpecialization());
        newUser.setLicenseNumber(payload.getLicenseNumber());
        newUser.setQualifications(payload.getQualifications());
        newUser.setOrganization(org);
        newUser.setVerificationStatus("VERIFIED");

        if (payload.getRoles() != null && !payload.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String r : payload.getRoles()) {
                String roleName = r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase();
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role " + roleName + " not found"));
                roles.add(role);
            }
            newUser.setRoles(roles);
        } else {
            Role defaultRole = roleRepository.findByName("ROLE_DOCTOR")
                    .orElseThrow(() -> new ResourceNotFoundException("Default ROLE_DOCTOR not found"));
            newUser.setRoles(Set.of(defaultRole));
        }

        User saved = userRepository.save(newUser);
        auditTrailService.logAction(auth, "ORG_ADMIN_ONBOARD_STAFF", "USER", String.valueOf(saved.getId()),
                "Org Admin onboarded staff user " + saved.getUsername() + " into facility " + org.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponseDTO(saved));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> updateFacilityStaff(@PathVariable Long id, @Valid @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        User target = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user #" + id + " not found"));

        if (target.getOrganization() == null || !target.getOrganization().getId().equals(org.getId())) {
            throw new SecurityException("Access Denied: Cannot modify staff user outside your organization.");
        }

        User saved = userService.updateUser(id, payload);
        auditTrailService.logAction(auth, "ORG_ADMIN_UPDATE_STAFF", "USER", String.valueOf(saved.getId()),
                "Org Admin updated staff details for " + saved.getUsername());
        return ResponseEntity.ok(userMapper.toResponseDTO(saved));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateFacilityStaffStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequestDTO payload, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        User target = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user #" + id + " not found"));

        if (target.getOrganization() == null || !target.getOrganization().getId().equals(org.getId())) {
            throw new SecurityException("Access Denied: Cannot modify staff user status outside your organization.");
        }

        String newStatus = payload.getStatus() != null ? payload.getStatus() : "VERIFIED";
        User saved = userService.updateUserStatus(id, newStatus);
        auditTrailService.logAction(auth, "ORG_ADMIN_UPDATE_STAFF_STATUS", "USER", String.valueOf(saved.getId()),
                "Org Admin changed status for staff user " + saved.getUsername() + " to " + newStatus);
        return ResponseEntity.ok(Map.of("message", "Staff status updated successfully", "status", newStatus));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetFacilityStaffPassword(@PathVariable Long id, @Valid @RequestBody UserPasswordResetRequestDTO payload, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        User target = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user #" + id + " not found"));

        if (target.getOrganization() == null || !target.getOrganization().getId().equals(org.getId())) {
            throw new SecurityException("Access Denied: Cannot reset password for user outside your organization.");
        }

        User user = userService.resetUserPassword(id, payload.getNewPassword());
        auditTrailService.logAction(auth, "ORG_ADMIN_RESET_PASSWORD", "USER", String.valueOf(user.getId()),
                "Org Admin reset password for staff user " + user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Notification sent to registered email."));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteFacilityStaff(@PathVariable Long id, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        User target = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user #" + id + " not found"));

        if (target.getOrganization() == null || !target.getOrganization().getId().equals(org.getId())) {
            throw new SecurityException("Access Denied: Cannot delete staff user outside your organization.");
        }

        String targetUsername = userService.deleteUser(id);
        auditTrailService.logAction(auth, "ORG_ADMIN_DELETE_STAFF", "USER", String.valueOf(id),
                "Org Admin deleted staff user account " + targetUsername + " from facility " + org.getName());
        return ResponseEntity.ok(Map.of("message", "Staff user account deleted successfully"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponseDTO>> getFacilityAuditLogs(@RequestParam(value = "search", required = false) String search, Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        return ResponseEntity.ok(userService.getAuditLogsForOrganization(org.getId(), search).stream()
                .map(auditLogMapper::toResponseDTO)
                .toList());
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getFacilityDashboardStats(Authentication auth) {
        Organization org = getAuthenticatedOrganization(auth);
        List<User> orgUsers = userService.getUsersByOrganization(org.getId());

        long doctorCount = orgUsers.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()))).count();
        long nurseCount = orgUsers.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_NURSE".equals(r.getName()))).count();
        long receptionCount = orgUsers.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_RECEPTIONIST".equals(r.getName()))).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("organizationId", org.getId());
        stats.put("organizationName", org.getName());
        stats.put("orgCode", org.getOrgCode());
        stats.put("licenseNumber", org.getLicenseNumber());
        stats.put("status", org.getStatus());
        stats.put("totalStaff", orgUsers.size());
        stats.put("doctorCount", doctorCount);
        stats.put("nurseCount", nurseCount);
        stats.put("receptionCount", receptionCount);

        return ResponseEntity.ok(stats);
    }
}
