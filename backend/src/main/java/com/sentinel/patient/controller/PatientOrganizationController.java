package com.sentinel.patient.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.patient.dto.PatientOrganizationResponseDTO;
import com.sentinel.patient.dto.RegisterPatientOrganizationRequest;
import com.sentinel.patient.service.PatientOrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Patient Organizations", description = "Endpoints for managing patient organization memberships and MRNs")
public class PatientOrganizationController {

    private final PatientOrganizationService patientOrganizationService;

    public PatientOrganizationController(PatientOrganizationService patientOrganizationService) {
        this.patientOrganizationService = patientOrganizationService;
    }

    @PostMapping("/api/v1/patients/{patientId}/organizations/{organizationId}")
    @Operation(summary = "Register patient with organization and assign MRN")
    public ResponseEntity<ApiResponse<PatientOrganizationResponseDTO>> registerPatientWithOrganization(
            @PathVariable UUID patientId,
            @PathVariable UUID organizationId,
            @Valid @RequestBody(required = false) RegisterPatientOrganizationRequest request) {
        PatientOrganizationResponseDTO response = patientOrganizationService.registerPatientWithOrganization(patientId, organizationId, request);
        return new ResponseEntity<>(ApiResponse.success("Patient registered with organization", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/organizations")
    @Operation(summary = "Get all organizations a patient is registered with")
    public ResponseEntity<ApiResponse<List<PatientOrganizationResponseDTO>>> getPatientOrganizations(
            @PathVariable UUID patientId) {
        List<PatientOrganizationResponseDTO> response = patientOrganizationService.getPatientOrganizations(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/organizations/{organizationId}/patients/{patientId}")
    @Operation(summary = "Get patient record in a specific organization")
    public ResponseEntity<ApiResponse<PatientOrganizationResponseDTO>> getOrganizationPatient(
            @PathVariable UUID organizationId,
            @PathVariable UUID patientId) {
        PatientOrganizationResponseDTO response = patientOrganizationService.getOrganizationPatient(organizationId, patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
