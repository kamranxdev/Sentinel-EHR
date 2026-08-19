package com.sentinel.security.rbac;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.security.dto.AssignPermissionRequest;
import com.sentinel.security.dto.AssignUserRoleRequest;
import com.sentinel.security.dto.CreateRoleRequest;
import com.sentinel.security.dto.RoleResponseDTO;
import com.sentinel.security.entity.Permission;
import com.sentinel.security.entity.Role;
import com.sentinel.security.repository.PermissionRepository;
import com.sentinel.security.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public RbacService(RoleRepository roleRepository,
                       PermissionRepository permissionRepository,
                       UserRepository userRepository,
                       AuditService auditService) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public RoleResponseDTO createRole(CreateRoleRequest request) {
        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());

        if (request.getPermissionIds() != null) {
            List<Permission> perms = permissionRepository.findAllById(request.getPermissionIds());
            role.setPermissions(new HashSet<>(perms));
        }

        Role saved = roleRepository.save(role);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ROLE_CREATED", "Created security role: " + saved.getName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public RoleResponseDTO getRoleById(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return mapToDTO(role);
    }

    public RoleResponseDTO assignPermission(UUID roleId, AssignPermissionRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        Permission perm = permissionRepository.findById(request.getPermissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + request.getPermissionId()));

        role.getPermissions().add(perm);
        Role saved = roleRepository.save(role);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ROLE_PERMISSION_ASSIGNED", "Assigned permission " + perm.getCode() + " to role " + role.getName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RoleResponseDTO.PermissionDTO> getRolePermissions(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        return role.getPermissions().stream()
                .map(p -> new RoleResponseDTO.PermissionDTO(p.getId(), p.getCode(), p.getName(), p.getCategory()))
                .collect(Collectors.toList());
    }

    public void assignUserRole(UUID userId, AssignUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));

        user.getRoles().add(role);
        userRepository.save(user);

        if (auditService != null) {
            auditService.logEvent(user.getId(), "USER_ROLE_ASSIGNED", "Assigned role " + role.getName() + " to user " + user.getEmail());
        }
    }

    @Transactional(readOnly = true)
    public List<String> getUserRoles(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
    }

    public RoleResponseDTO mapToDTO(Role r) {
        RoleResponseDTO dto = new RoleResponseDTO();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setDescription(r.getDescription());
        if (r.getPermissions() != null) {
            dto.setPermissions(r.getPermissions().stream()
                    .map(p -> new RoleResponseDTO.PermissionDTO(p.getId(), p.getCode(), p.getName(), p.getCategory()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
