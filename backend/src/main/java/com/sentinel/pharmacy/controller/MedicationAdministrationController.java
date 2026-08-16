package com.sentinel.pharmacy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.pharmacy.dto.AdministerMedicationRequest;
import com.sentinel.pharmacy.dto.MedicationAdministrationResponseDTO;
import com.sentinel.pharmacy.service.MedicationAdministrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Medication Administrations (eMAR)", description = "Endpoints for administering medication and recording eMAR logs")
public class MedicationAdministrationController {

    private final MedicationAdministrationService administrationService;

    public MedicationAdministrationController(MedicationAdministrationService administrationService) {
        this.administrationService = administrationService;
    }

    @PostMapping("/api/v1/prescriptions/{prescriptionId}/administer")
    @Operation(summary = "Record medication administration against a prescription")
    public ResponseEntity<ApiResponse<MedicationAdministrationResponseDTO>> administerMedication(
            @PathVariable UUID prescriptionId,
            @Valid @RequestBody AdministerMedicationRequest request) {
        MedicationAdministrationResponseDTO response = administrationService.administerMedication(prescriptionId, request);
        return new ResponseEntity<>(ApiResponse.success("Medication administered successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/administrations")
    @Operation(summary = "Get all medication administrations during an encounter")
    public ResponseEntity<ApiResponse<List<MedicationAdministrationResponseDTO>>> getEncounterAdministrations(
            @PathVariable UUID encounterId) {
        List<MedicationAdministrationResponseDTO> response = administrationService.getEncounterAdministrations(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/administrations")
    @Operation(summary = "Get all medication administrations for a patient")
    public ResponseEntity<ApiResponse<List<MedicationAdministrationResponseDTO>>> getPatientAdministrations(
            @PathVariable UUID patientId) {
        List<MedicationAdministrationResponseDTO> response = administrationService.getPatientAdministrations(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
