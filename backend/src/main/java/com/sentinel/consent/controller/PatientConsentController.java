package com.sentinel.consent.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.consent.dto.CreatePatientConsentRequest;
import com.sentinel.consent.dto.PatientConsentResponseDTO;
import com.sentinel.consent.dto.RevokeConsentRequest;
import com.sentinel.consent.service.PatientConsentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Patient Consents", description = "Endpoints for capturing, querying, and revoking patient consents")
public class PatientConsentController {

    private final PatientConsentService patientConsentService;

    public PatientConsentController(PatientConsentService patientConsentService) {
        this.patientConsentService = patientConsentService;
    }

    @PostMapping("/api/v1/patients/{patientId}/consents")
    @Operation(summary = "Grant/record consent for a patient")
    public ResponseEntity<ApiResponse<PatientConsentResponseDTO>> grantConsent(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreatePatientConsentRequest request) {
        PatientConsentResponseDTO response = patientConsentService.grantConsent(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Consent recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/consents")
    @Operation(summary = "Get all consents for a patient")
    public ResponseEntity<ApiResponse<List<PatientConsentResponseDTO>>> getPatientConsents(
            @PathVariable UUID patientId) {
        List<PatientConsentResponseDTO> response = patientConsentService.getPatientConsents(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patient-consents/{consentId}")
    @Operation(summary = "Get patient consent by ID")
    public ResponseEntity<ApiResponse<PatientConsentResponseDTO>> getConsent(
            @PathVariable UUID consentId) {
        PatientConsentResponseDTO response = patientConsentService.getConsent(consentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patient-consents/{consentId}/revoke")
    @Operation(summary = "Revoke a patient consent")
    public ResponseEntity<ApiResponse<PatientConsentResponseDTO>> revokeConsent(
            @PathVariable UUID consentId,
            @RequestBody(required = false) RevokeConsentRequest request) {
        PatientConsentResponseDTO response = patientConsentService.revokeConsent(consentId, request);
        return ResponseEntity.ok(ApiResponse.success("Consent revoked successfully", response));
    }
}
