package com.sentinel.patient.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.patient.dto.*;
import com.sentinel.patient.service.PatientHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Patient Histories", description = "Endpoints for medical, family, social, substance use, and dietary histories")
public class PatientHistoryController {

    private final PatientHistoryService patientHistoryService;

    public PatientHistoryController(PatientHistoryService patientHistoryService) {
        this.patientHistoryService = patientHistoryService;
    }

    // Medical History
    @GetMapping("/api/v1/patients/{patientId}/medical-history")
    @Operation(summary = "Get patient medical history")
    public ResponseEntity<ApiResponse<PatientMedicalHistoryResponseDTO>> getMedicalHistory(
            @PathVariable UUID patientId) {
        PatientMedicalHistoryResponseDTO response = patientHistoryService.getMedicalHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/medical-history")
    @Operation(summary = "Add patient medical history")
    public ResponseEntity<ApiResponse<PatientMedicalHistoryResponseDTO>> addMedicalHistory(
            @PathVariable UUID patientId,
            @Valid @RequestBody AddMedicalHistoryRequest request) {
        PatientMedicalHistoryResponseDTO response = patientHistoryService.addMedicalHistory(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Medical history recorded successfully", response), HttpStatus.CREATED);
    }

    // Family History
    @GetMapping("/api/v1/patients/{patientId}/family-history")
    @Operation(summary = "Get patient family history")
    public ResponseEntity<ApiResponse<List<FamilyHistoryResponseDTO>>> getFamilyHistory(
            @PathVariable UUID patientId) {
        List<FamilyHistoryResponseDTO> response = patientHistoryService.getFamilyHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/family-history")
    @Operation(summary = "Add patient family history")
    public ResponseEntity<ApiResponse<FamilyHistoryResponseDTO>> addFamilyHistory(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateFamilyHistoryRequest request) {
        FamilyHistoryResponseDTO response = patientHistoryService.addFamilyHistory(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Family history added successfully", response), HttpStatus.CREATED);
    }

    @PatchMapping("/api/v1/family-history/{id}")
    @Operation(summary = "Update family history entry")
    public ResponseEntity<ApiResponse<FamilyHistoryResponseDTO>> updateFamilyHistory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFamilyHistoryRequest request) {
        FamilyHistoryResponseDTO response = patientHistoryService.updateFamilyHistory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Family history updated successfully", response));
    }

    @DeleteMapping("/api/v1/family-history/{id}")
    @Operation(summary = "Delete family history entry")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyHistory(
            @PathVariable UUID id) {
        patientHistoryService.deleteFamilyHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Family history deleted successfully", null));
    }

    // Social History
    @GetMapping("/api/v1/patients/{patientId}/social-history")
    @Operation(summary = "Get patient social history")
    public ResponseEntity<ApiResponse<SocialHistoryResponseDTO>> getSocialHistory(
            @PathVariable UUID patientId) {
        SocialHistoryResponseDTO response = patientHistoryService.getSocialHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/v1/patients/{patientId}/social-history")
    @Operation(summary = "Update patient social history")
    public ResponseEntity<ApiResponse<SocialHistoryResponseDTO>> updateSocialHistory(
            @PathVariable UUID patientId,
            @Valid @RequestBody UpdateSocialHistoryRequest request) {
        SocialHistoryResponseDTO response = patientHistoryService.updateSocialHistory(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Social history updated successfully", response));
    }

    // Substance Use
    @GetMapping("/api/v1/patients/{patientId}/substance-use")
    @Operation(summary = "Get patient substance use records")
    public ResponseEntity<ApiResponse<List<SubstanceUseResponseDTO>>> getSubstanceUse(
            @PathVariable UUID patientId) {
        List<SubstanceUseResponseDTO> response = patientHistoryService.getSubstanceUse(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/substance-use")
    @Operation(summary = "Add patient substance use record")
    public ResponseEntity<ApiResponse<SubstanceUseResponseDTO>> addSubstanceUse(
            @PathVariable UUID patientId,
            @Valid @RequestBody AddSubstanceUseRequest request) {
        SubstanceUseResponseDTO response = patientHistoryService.addSubstanceUse(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Substance use recorded successfully", response), HttpStatus.CREATED);
    }

    // Dietary History
    @GetMapping("/api/v1/patients/{patientId}/dietary-history")
    @Operation(summary = "Get patient dietary history")
    public ResponseEntity<ApiResponse<DietaryHistoryResponseDTO>> getDietaryHistory(
            @PathVariable UUID patientId) {
        DietaryHistoryResponseDTO response = patientHistoryService.getDietaryHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/v1/patients/{patientId}/dietary-history")
    @Operation(summary = "Update patient dietary history")
    public ResponseEntity<ApiResponse<DietaryHistoryResponseDTO>> updateDietaryHistory(
            @PathVariable UUID patientId,
            @Valid @RequestBody UpdateDietaryHistoryRequest request) {
        DietaryHistoryResponseDTO response = patientHistoryService.updateDietaryHistory(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Dietary history updated successfully", response));
    }
}
