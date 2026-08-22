package com.sentinel.identity.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.identity.dto.AddOrganizationMemberRequest;
import com.sentinel.identity.dto.UserOrganizationResponseDTO;
import com.sentinel.identity.service.UserOrganizationService;
import com.sentinel.identity.dto.UserResponseDTO;
import com.sentinel.identity.service.UserService;
import com.sentinel.security.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "User Organization Membership", description = "Endpoints for managing user organization assignments")
public class UserOrganizationController {

    private final UserOrganizationService userOrganizationService;
    private final UserService userService;

    public UserOrganizationController(UserOrganizationService userOrganizationService,
                                    UserService userService) {
        this.userOrganizationService = userOrganizationService;
        this.userService = userService;
    }

    @PostMapping("/api/v1/organizations/{organizationId}/users/{userId}")
    @Operation(summary = "Add user to organization")
    public ResponseEntity<ApiResponse<UserOrganizationResponseDTO>> addUserToOrganization(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @Valid @RequestBody(required = false) AddOrganizationMemberRequest request) {
        UserOrganizationResponseDTO response = userOrganizationService.addUserToOrganization(organizationId, userId, request);
        return new ResponseEntity<>(ApiResponse.success("User added to organization", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/api/v1/organizations/{organizationId}/users/{userId}")
    @Operation(summary = "Remove user from organization")
    public ResponseEntity<ApiResponse<Void>> removeUserFromOrganization(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId) {
        userOrganizationService.removeUserFromOrganization(organizationId, userId);
        return ResponseEntity.ok(ApiResponse.success("User removed from organization", null));
    }

    @GetMapping("/api/v1/organizations/{organizationId}/users")
    @Operation(summary = "Get all users in an organization")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getOrganizationUsers(
            @PathVariable UUID organizationId) {
        List<UserResponseDTO> response = userService.getUsersByOrganization(organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/organizations/current/users")
    @Operation(summary = "Get all users in the current active organization context")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getCurrentOrganizationUsers() {
        UUID currentOrgId = TenantContext.getCurrentOrganizationId();
        if (currentOrgId == null) {
            throw new IllegalArgumentException("No active organization context found in session");
        }
        List<UserResponseDTO> response = userService.getUsersByOrganization(currentOrgId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
