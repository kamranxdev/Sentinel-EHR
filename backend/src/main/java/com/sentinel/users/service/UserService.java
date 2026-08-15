package com.sentinel.users.service;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.users.dto.UserUpdateRequestDTO;
import com.sentinel.users.entity.Role;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.RoleRepository;
import com.sentinel.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       AuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public List<User> getDoctors() {
        return userRepository.findByRolesName("ROLE_DOCTOR");
    }

    @Transactional
    public User updateUser(Long id, UserUpdateRequestDTO payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (payload.getFullName() != null) user.setFullName(payload.getFullName());
        if (payload.getEmail() != null) user.setEmail(payload.getEmail());
        if (payload.getDepartment() != null) user.setDepartment(payload.getDepartment());
        if (payload.getSpecialization() != null) user.setSpecialization(payload.getSpecialization());
        if (payload.getLicenseNumber() != null) user.setLicenseNumber(payload.getLicenseNumber());
        if (payload.getQualifications() != null) user.setQualifications(payload.getQualifications());
        if (payload.getVerificationStatus() != null) user.setVerificationStatus(payload.getVerificationStatus());

        if (payload.getRoles() != null) {
            Set<Role> updatedRoles = new HashSet<>();
            for (String r : payload.getRoles()) {
                String roleName = r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase();
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role " + roleName + " not found"));
                updatedRoles.add(role);
            }
            user.setRoles(updatedRoles);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setVerificationStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public User resetUserPassword(Long id, String rawPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String passwordToSet = rawPassword;
        if (passwordToSet == null || passwordToSet.trim().length() < 6) {
            passwordToSet = "Sentinel#" + (1000 + (int)(Math.random() * 9000));
        }

        user.setPassword(passwordEncoder.encode(passwordToSet));
        return userRepository.save(user);
    }

    @Transactional
    public String deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        String targetUsername = user.getUsername();
        userRepository.delete(user);
        return targetUsername;
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByOrganization(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId);
    }

    @Transactional(readOnly = true)
    public List<User> getDoctorsByOrganization(Long organizationId) {
        return userRepository.findByOrganizationIdAndRolesName(organizationId, "ROLE_DOCTOR");
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return auditLogRepository.searchAuditLogs(search.trim());
        }
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForOrganization(Long organizationId, String search) {
        List<String> orgUsernames = userRepository.findByOrganizationId(organizationId).stream()
                .map(User::getUsername)
                .toList();

        List<AuditLog> allLogs = getAuditLogs(search);
        if (orgUsernames.isEmpty()) {
            return Collections.emptyList();
        }
        return allLogs.stream()
                .filter(log -> orgUsernames.contains(log.getUsername()))
                .toList();
    }
}

