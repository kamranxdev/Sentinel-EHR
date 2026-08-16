package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AddAllergyRequest;
import com.sentinel.clinical.dto.AllergyResponseDTO;
import com.sentinel.clinical.dto.UpdateAllergyRequest;
import com.sentinel.clinical.service.AllergyService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Allergies", description = "Endpoints for managing patient allergies")
public class AllergyController {

    private final AllergyService allergyService;

    public AllergyController(AllergyService allergyService) {
        this.allergyService = allergyService;
    }

    @GetMapping("/api/v1/patients/{patientId}/allergies")
    @Operation(summary = "Get all allergies for a patient")
    public ResponseEntity<ApiResponse<List<AllergyResponseDTO>>> getAllergies(
            @PathVariable UUID patientId) {
        List<AllergyResponseDTO> response = allergyService.getAllergies(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/allergies")
    @Operation(summary = "Add an allergy for a patient")
    public ResponseEntity<ApiResponse<AllergyResponseDTO>> addAllergy(
            @PathVariable UUID patientId,
            @Valid @RequestBody AddAllergyRequest request) {
        AllergyResponseDTO response = allergyService.addAllergy(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Allergy recorded successfully", response), HttpStatus.CREATED);
    }

    @PatchMapping("/api/v1/allergies/{allergyId}")
    @Operation(summary = "Update allergy entry")
    public ResponseEntity<ApiResponse<AllergyResponseDTO>> updateAllergy(
            @PathVariable UUID allergyId,
            @Valid @RequestBody UpdateAllergyRequest request) {
        AllergyResponseDTO response = allergyService.updateAllergy(allergyId, request);
        return ResponseEntity.ok(ApiResponse.success("Allergy updated successfully", response));
    }

    @PostMapping("/api/v1/allergies/{allergyId}/verify")
    @Operation(summary = "Verify an allergy entry")
    public ResponseEntity<ApiResponse<AllergyResponseDTO>> verifyAllergy(
            @PathVariable UUID allergyId) {
        AllergyResponseDTO response = allergyService.verifyAllergy(allergyId);
        return ResponseEntity.ok(ApiResponse.success("Allergy verified successfully", response));
    }

    @PostMapping("/api/v1/allergies/{allergyId}/inactivate")
    @Operation(summary = "Inactivate an allergy entry")
    public ResponseEntity<ApiResponse<AllergyResponseDTO>> inactivateAllergy(
            @PathVariable UUID allergyId) {
        AllergyResponseDTO response = allergyService.inactivateAllergy(allergyId);
        return ResponseEntity.ok(ApiResponse.success("Allergy inactivated successfully", response));
    }
}
