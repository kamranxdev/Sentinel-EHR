package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.CreateOrganizationRequest;
import com.sentinel.tenancy.dto.OrganizationResponseDTO;
import com.sentinel.tenancy.dto.OrganizationSearchCriteria;
import com.sentinel.tenancy.dto.UpdateOrganizationRequest;
import com.sentinel.tenancy.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@Tag(name = "Organizations", description = "Endpoints for managing healthcare organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping({"", "/register"})
    @Operation(summary = "Create or register an organization")
    public ResponseEntity<ApiResponse<OrganizationResponseDTO>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request) {
        OrganizationResponseDTO response = organizationService.createOrganization(request);
        return new ResponseEntity<>(ApiResponse.success("Organization created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get or search organizations")
    public ResponseEntity<ApiResponse<List<OrganizationResponseDTO>>> getOrganizations(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String organizationType) {
        OrganizationSearchCriteria criteria = new OrganizationSearchCriteria(query, status, organizationType);
        List<OrganizationResponseDTO> response = organizationService.getOrganizations(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{organizationId}")
    @Operation(summary = "Get organization by ID")
    public ResponseEntity<ApiResponse<OrganizationResponseDTO>> getOrganization(
            @PathVariable UUID organizationId) {
        OrganizationResponseDTO response = organizationService.getOrganization(organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{organizationId}")
    @Operation(summary = "Update organization")
    public ResponseEntity<ApiResponse<OrganizationResponseDTO>> updateOrganization(
            @PathVariable UUID organizationId,
            @Valid @RequestBody UpdateOrganizationRequest request) {
        OrganizationResponseDTO response = organizationService.updateOrganization(organizationId, request);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @DeleteMapping("/{organizationId}")
    @Operation(summary = "Deactivate organization")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(
            @PathVariable UUID organizationId) {
        organizationService.deactivateOrganization(organizationId);
        return ResponseEntity.ok(ApiResponse.success("Organization deactivated successfully", null));
    }
}
