package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.InpatientCareResponseDTO;
import com.sentinel.clinical.service.CareTeamService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Inpatients", description = "Organization-scoped endpoints for inpatient ward census, bedside care, and care team rosters")
public class InpatientController {

    private final CareTeamService careTeamService;

    public InpatientController(CareTeamService careTeamService) {
        this.careTeamService = careTeamService;
    }

    @GetMapping("/api/v1/organizations/{organizationId}/inpatients")
    @Operation(summary = "Get organization inpatient census with optional practitioner/user care team filtering")
    public ResponseEntity<ApiResponse<List<InpatientCareResponseDTO>>> getOrganizationInpatients(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) UUID practitionerId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String role) {
        List<InpatientCareResponseDTO> response = careTeamService.getPractitionerInpatients(practitionerId, userId, organizationId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/organizations/{organizationId}/practitioners/{practitionerId}/inpatients")
    @Operation(summary = "Get organization inpatients where specific practitioner is in the care team")
    public ResponseEntity<ApiResponse<List<InpatientCareResponseDTO>>> getPractitionerInpatients(
            @PathVariable UUID organizationId,
            @PathVariable UUID practitionerId,
            @RequestParam(required = false) String role) {
        List<InpatientCareResponseDTO> response = careTeamService.getPractitionerInpatients(practitionerId, null, organizationId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/organizations/{organizationId}/users/{userId}/inpatients")
    @Operation(summary = "Get organization inpatients where specific user (doctor/nurse) is in the care team")
    public ResponseEntity<ApiResponse<List<InpatientCareResponseDTO>>> getUserInpatients(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @RequestParam(required = false) String role) {
        List<InpatientCareResponseDTO> response = careTeamService.getPractitionerInpatients(null, userId, organizationId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/inpatients")
    @Operation(summary = "Get inpatient census across organizations (global view)")
    public ResponseEntity<ApiResponse<List<InpatientCareResponseDTO>>> getGlobalInpatients(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID practitionerId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String role) {
        List<InpatientCareResponseDTO> response = careTeamService.getPractitionerInpatients(practitionerId, userId, organizationId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
