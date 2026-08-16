package com.sentinel.identity.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.identity.dto.AddOrganizationMemberRequest;
import com.sentinel.identity.dto.UserOrganizationResponseDTO;
import com.sentinel.identity.service.UserOrganizationService;
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

    public UserOrganizationController(UserOrganizationService userOrganizationService) {
        this.userOrganizationService = userOrganizationService;
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
    public ResponseEntity<ApiResponse<List<UserOrganizationResponseDTO>>> getOrganizationUsers(
            @PathVariable UUID organizationId) {
        List<UserOrganizationResponseDTO> response = userOrganizationService.getOrganizationUsers(organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
