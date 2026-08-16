package com.sentinel.identity.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.identity.dto.*;
import com.sentinel.identity.service.PractitionerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/practitioners")
@Tag(name = "Practitioners", description = "Endpoints for managing healthcare practitioners")
public class PractitionerController {

    private final PractitionerService practitionerService;

    public PractitionerController(PractitionerService practitionerService) {
        this.practitionerService = practitionerService;
    }

    @PostMapping
    @Operation(summary = "Create a new practitioner")
    public ResponseEntity<ApiResponse<PractitionerResponseDTO>> createPractitioner(
            @Valid @RequestBody CreatePractitionerRequest request) {
        PractitionerResponseDTO response = practitionerService.createPractitioner(request);
        return new ResponseEntity<>(ApiResponse.success("Practitioner created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get or search practitioners")
    public ResponseEntity<ApiResponse<List<PractitionerResponseDTO>>> getPractitioners(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID organizationId) {
        PractitionerSearchCriteria criteria = new PractitionerSearchCriteria(query, specialty, status, organizationId);
        List<PractitionerResponseDTO> response = practitionerService.searchPractitioners(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{practitionerId}")
    @Operation(summary = "Get practitioner by ID")
    public ResponseEntity<ApiResponse<PractitionerResponseDTO>> getPractitioner(
            @PathVariable UUID practitionerId) {
        PractitionerResponseDTO response = practitionerService.getPractitioner(practitionerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{practitionerId}")
    @Operation(summary = "Update practitioner")
    public ResponseEntity<ApiResponse<PractitionerResponseDTO>> updatePractitioner(
            @PathVariable UUID practitionerId,
            @Valid @RequestBody UpdatePractitionerRequest request) {
        PractitionerResponseDTO response = practitionerService.updatePractitioner(practitionerId, request);
        return ResponseEntity.ok(ApiResponse.success("Practitioner updated successfully", response));
    }

    @PostMapping("/{practitionerId}/specialties")
    @Operation(summary = "Add specialty to practitioner")
    public ResponseEntity<ApiResponse<PractitionerResponseDTO>> addSpecialty(
            @PathVariable UUID practitionerId,
            @Valid @RequestBody AddSpecialtyRequest request) {
        PractitionerResponseDTO response = practitionerService.addSpecialty(practitionerId, request);
        return ResponseEntity.ok(ApiResponse.success("Specialty added successfully", response));
    }

    @PostMapping("/{practitionerId}/licenses")
    @Operation(summary = "Add license to practitioner")
    public ResponseEntity<ApiResponse<PractitionerResponseDTO>> addLicense(
            @PathVariable UUID practitionerId,
            @Valid @RequestBody AddLicenseRequest request) {
        PractitionerResponseDTO response = practitionerService.addLicense(practitionerId, request);
        return ResponseEntity.ok(ApiResponse.success("License added successfully", response));
    }
}
