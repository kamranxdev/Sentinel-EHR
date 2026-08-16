package com.sentinel.security.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.security.dto.AssignPermissionRequest;
import com.sentinel.security.dto.AssignUserRoleRequest;
import com.sentinel.security.dto.CreateRoleRequest;
import com.sentinel.security.dto.RoleResponseDTO;
import com.sentinel.security.rbac.RbacService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Roles & RBAC", description = "Endpoints for managing role-based access control and user roles")
public class RbacController {

    private final RbacService rbacService;

    public RbacController(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    @PostMapping("/api/v1/roles")
    @Operation(summary = "Create a security role")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> createRole(
            @Valid @RequestBody CreateRoleRequest request) {
        RoleResponseDTO response = rbacService.createRole(request);
        return new ResponseEntity<>(ApiResponse.success("Role created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/roles")
    @Operation(summary = "Get all roles")
    public ResponseEntity<ApiResponse<List<RoleResponseDTO>>> getAllRoles() {
        List<RoleResponseDTO> response = rbacService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/roles/{roleId}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> getRole(
            @PathVariable UUID roleId) {
        RoleResponseDTO response = rbacService.getRoleById(roleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/roles/{roleId}/permissions")
    @Operation(summary = "Assign permission to role")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> assignPermission(
            @PathVariable UUID roleId,
            @Valid @RequestBody AssignPermissionRequest request) {
        RoleResponseDTO response = rbacService.assignPermission(roleId, request);
        return ResponseEntity.ok(ApiResponse.success("Permission assigned successfully", response));
    }

    @GetMapping("/api/v1/roles/{roleId}/permissions")
    @Operation(summary = "Get permissions of a role")
    public ResponseEntity<ApiResponse<List<RoleResponseDTO.PermissionDTO>>> getRolePermissions(
            @PathVariable UUID roleId) {
        List<RoleResponseDTO.PermissionDTO> response = rbacService.getRolePermissions(roleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/users/{userId}/roles")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<ApiResponse<Void>> assignUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody AssignUserRoleRequest request) {
        rbacService.assignUserRole(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Role assigned to user successfully", null));
    }

    @GetMapping("/api/v1/users/{userId}/roles")
    @Operation(summary = "Get user roles")
    public ResponseEntity<ApiResponse<List<String>>> getUserRoles(
            @PathVariable UUID userId) {
        List<String> response = rbacService.getUserRoles(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
