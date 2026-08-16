package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.CreateFacilityRequest;
import com.sentinel.tenancy.dto.FacilityResponseDTO;
import com.sentinel.tenancy.dto.UpdateFacilityRequest;
import com.sentinel.tenancy.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Facilities", description = "Endpoints for managing healthcare facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping("/api/v1/organizations/{organizationId}/facilities")
    @Operation(summary = "Create a facility for an organization")
    public ResponseEntity<ApiResponse<FacilityResponseDTO>> createFacility(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateFacilityRequest request) {
        FacilityResponseDTO response = facilityService.createFacility(organizationId, request);
        return new ResponseEntity<>(ApiResponse.success("Facility created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/organizations/{organizationId}/facilities")
    @Operation(summary = "Get all facilities for an organization")
    public ResponseEntity<ApiResponse<List<FacilityResponseDTO>>> getFacilities(
            @PathVariable UUID organizationId) {
        List<FacilityResponseDTO> response = facilityService.getFacilities(organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/facilities/{facilityId}")
    @Operation(summary = "Get facility by ID")
    public ResponseEntity<ApiResponse<FacilityResponseDTO>> getFacility(
            @PathVariable UUID facilityId) {
        FacilityResponseDTO response = facilityService.getFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/facilities/{facilityId}")
    @Operation(summary = "Update facility")
    public ResponseEntity<ApiResponse<FacilityResponseDTO>> updateFacility(
            @PathVariable UUID facilityId,
            @Valid @RequestBody UpdateFacilityRequest request) {
        FacilityResponseDTO response = facilityService.updateFacility(facilityId, request);
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", response));
    }

    @DeleteMapping("/api/v1/facilities/{facilityId}")
    @Operation(summary = "Deactivate facility")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(
            @PathVariable UUID facilityId) {
        facilityService.deactivateFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success("Facility deactivated successfully", null));
    }
}
