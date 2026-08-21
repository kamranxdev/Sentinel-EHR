package com.sentinel.pharmacy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.pharmacy.dto.CreateMedicationRequest;
import com.sentinel.pharmacy.dto.MedicationResponseDTO;
import com.sentinel.pharmacy.dto.MedicationSearchCriteria;
import com.sentinel.pharmacy.dto.UpdateMedicationRequest;
import com.sentinel.pharmacy.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medications")
@Tag(name = "Medications", description = "Endpoints for managing formulary medications")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @PostMapping
    @Operation(summary = "Create a medication in formulary")
    public ResponseEntity<ApiResponse<MedicationResponseDTO>> createMedication(
            @Valid @RequestBody CreateMedicationRequest request) {
        MedicationResponseDTO response = medicationService.createMedication(request);
        return new ResponseEntity<>(ApiResponse.success("Medication created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{medicationId}")
    @Operation(summary = "Get medication by ID")
    public ResponseEntity<ApiResponse<MedicationResponseDTO>> getMedication(
            @PathVariable UUID medicationId) {
        MedicationResponseDTO response = medicationService.getMedication(medicationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping({"", "/search"})
    @Operation(summary = "Search or list all medications by name or form")
    public ResponseEntity<ApiResponse<List<MedicationResponseDTO>>> searchMedications(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String form) {
        MedicationSearchCriteria criteria = new MedicationSearchCriteria(query, form);
        List<MedicationResponseDTO> response = medicationService.searchMedications(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{medicationId}")
    @Operation(summary = "Update medication details")
    public ResponseEntity<ApiResponse<MedicationResponseDTO>> updateMedication(
            @PathVariable UUID medicationId,
            @Valid @RequestBody UpdateMedicationRequest request) {
        MedicationResponseDTO response = medicationService.updateMedication(medicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Medication updated successfully", response));
    }
}
