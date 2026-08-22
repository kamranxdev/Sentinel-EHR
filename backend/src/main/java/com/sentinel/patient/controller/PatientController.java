package com.sentinel.patient.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.patient.dto.PatientResponseDTO;
import com.sentinel.patient.dto.PatientSearchCriteria;
import com.sentinel.patient.dto.RegisterPatientRequest;
import com.sentinel.patient.dto.UpdatePatientRequest;
import com.sentinel.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@Tag(name = "Patients", description = "Endpoints for registering and managing patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @Operation(summary = "Register a new patient")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> registerPatient(
            @RequestParam(required = false) UUID organizationId,
            @Valid @RequestBody RegisterPatientRequest request) {
        PatientResponseDTO response = patientService.registerPatient(organizationId, request);
        return new ResponseEntity<>(ApiResponse.success("Patient registered successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated patient profile")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> getCurrentPatient(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        PatientResponseDTO response = patientService.getCurrentPatientProfile(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{patientId}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> getPatient(
            @PathVariable UUID patientId) {
        PatientResponseDTO response = patientService.getPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search patients by query, MRN, phone, or status")
    public ResponseEntity<ApiResponse<List<PatientResponseDTO>>> searchPatients(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String mrn,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID organizationId) {
        PatientSearchCriteria criteria = new PatientSearchCriteria(query, mrn, phone, status, organizationId);
        List<PatientResponseDTO> response = patientService.searchPatients(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{patientId}")
    @Operation(summary = "Update patient demographics and info")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> updatePatient(
            @PathVariable UUID patientId,
            @Valid @RequestBody UpdatePatientRequest request) {
        PatientResponseDTO response = patientService.updatePatient(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }
}
