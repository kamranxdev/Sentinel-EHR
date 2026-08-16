package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AdmissionResponseDTO;
import com.sentinel.clinical.dto.AdmitPatientRequest;
import com.sentinel.clinical.service.AdmissionService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Admissions", description = "Endpoints for inpatient admissions")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/admission")
    @Operation(summary = "Admit a patient (assign inpatient bed and change encounter type)")
    public ResponseEntity<ApiResponse<AdmissionResponseDTO>> admitPatient(
            @PathVariable UUID encounterId,
            @Valid @RequestBody AdmitPatientRequest request) {
        AdmissionResponseDTO response = admissionService.admitPatient(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Patient admitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/admission")
    @Operation(summary = "Get admission details for an encounter")
    public ResponseEntity<ApiResponse<AdmissionResponseDTO>> getAdmission(
            @PathVariable UUID encounterId) {
        AdmissionResponseDTO response = admissionService.getAdmission(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/admissions/{admissionId}/cancel")
    @Operation(summary = "Cancel an admission and release bed")
    public ResponseEntity<ApiResponse<Void>> cancelAdmission(
            @PathVariable UUID admissionId) {
        admissionService.cancelAdmission(admissionId);
        return ResponseEntity.ok(ApiResponse.success("Admission cancelled successfully", null));
    }
}
