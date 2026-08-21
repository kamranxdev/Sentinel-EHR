package com.sentinel.pharmacy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.pharmacy.dto.CreatePrescriptionRequest;
import com.sentinel.pharmacy.dto.PrescriptionResponseDTO;
import com.sentinel.pharmacy.dto.UpdatePrescriptionRequest;
import com.sentinel.pharmacy.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Prescriptions", description = "Endpoints for electronic prescribing and medication orders")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/prescriptions")
    @Operation(summary = "Create prescription for an encounter")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> createPrescription(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        PrescriptionResponseDTO response = prescriptionService.createPrescription(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Prescription created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/prescriptions")
    @Operation(summary = "Get all prescriptions with optional status and search filters")
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDTO>>> getAllPrescriptions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<PrescriptionResponseDTO> response = prescriptionService.getAllPrescriptions(status, search);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/prescriptions/{prescriptionId}/verify")
    @Operation(summary = "Pharmacist verification for a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> verifyPrescription(
            @PathVariable UUID prescriptionId,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        PrescriptionResponseDTO response = prescriptionService.verifyPrescription(prescriptionId, notes);
        return ResponseEntity.ok(ApiResponse.success("Prescription verified successfully", response));
    }

    @PostMapping("/api/v1/prescriptions/{prescriptionId}/reject")
    @Operation(summary = "Pharmacist rejection for a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> rejectPrescription(
            @PathVariable UUID prescriptionId,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Safety verification rejection";
        PrescriptionResponseDTO response = prescriptionService.rejectPrescription(prescriptionId, reason);
        return ResponseEntity.ok(ApiResponse.success("Prescription rejected", response));
    }

    @PostMapping("/api/v1/prescriptions/{prescriptionId}/dispense")
    @Operation(summary = "Pharmacist dispensation for a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> dispensePrescription(
            @PathVariable UUID prescriptionId,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        String notes = body != null && body.get("notes") != null ? String.valueOf(body.get("notes")) : null;
        PrescriptionResponseDTO response = prescriptionService.dispensePrescription(prescriptionId, notes);
        return ResponseEntity.ok(ApiResponse.success("Prescription dispensed successfully", response));
    }

    @GetMapping("/api/v1/encounters/{encounterId}/prescriptions")
    @Operation(summary = "Get prescriptions for an encounter")
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDTO>>> getEncounterPrescriptions(
            @PathVariable UUID encounterId) {
        List<PrescriptionResponseDTO> response = prescriptionService.getEncounterPrescriptions(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/prescriptions")
    @Operation(summary = "Get all prescriptions for a patient")
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDTO>>> getPatientPrescriptions(
            @PathVariable UUID patientId) {
        List<PrescriptionResponseDTO> response = prescriptionService.getPatientPrescriptions(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/prescriptions/{prescriptionId}")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> getPrescription(
            @PathVariable UUID prescriptionId) {
        PrescriptionResponseDTO response = prescriptionService.getPrescription(prescriptionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/prescriptions/{prescriptionId}")
    @Operation(summary = "Update prescription details")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> updatePrescription(
            @PathVariable UUID prescriptionId,
            @Valid @RequestBody UpdatePrescriptionRequest request) {
        PrescriptionResponseDTO response = prescriptionService.updatePrescription(prescriptionId, request);
        return ResponseEntity.ok(ApiResponse.success("Prescription updated successfully", response));
    }

    @PostMapping("/api/v1/prescriptions/{prescriptionId}/discontinue")
    @Operation(summary = "Discontinue prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> discontinuePrescription(
            @PathVariable UUID prescriptionId) {
        PrescriptionResponseDTO response = prescriptionService.discontinuePrescription(prescriptionId);
        return ResponseEntity.ok(ApiResponse.success("Prescription discontinued successfully", response));
    }
}
