package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AddCareTeamMemberRequest;
import com.sentinel.clinical.dto.CareTeamResponseDTO;
import com.sentinel.clinical.dto.CreateCareTeamRequest;
import com.sentinel.clinical.service.CareTeamService;
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
@Tag(name = "Care Teams", description = "Endpoints for multidisciplinary care teams")
public class CareTeamController {

    private final CareTeamService careTeamService;

    public CareTeamController(CareTeamService careTeamService) {
        this.careTeamService = careTeamService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/care-team")
    @Operation(summary = "Create care team for encounter")
    public ResponseEntity<ApiResponse<CareTeamResponseDTO>> createCareTeam(
            @PathVariable UUID encounterId,
            @Valid @RequestBody(required = false) CreateCareTeamRequest request) {
        CareTeamResponseDTO response = careTeamService.createCareTeam(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Care team created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/care-team")
    @Operation(summary = "Get care teams for encounter")
    public ResponseEntity<ApiResponse<List<CareTeamResponseDTO>>> getEncounterCareTeams(
            @PathVariable UUID encounterId) {
        List<CareTeamResponseDTO> response = careTeamService.getEncounterCareTeams(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/care-teams/{careTeamId}/members")
    @Operation(summary = "Add member to care team")
    public ResponseEntity<ApiResponse<CareTeamResponseDTO>> addMember(
            @PathVariable UUID careTeamId,
            @Valid @RequestBody AddCareTeamMemberRequest request) {
        CareTeamResponseDTO response = careTeamService.addMember(careTeamId, request);
        return new ResponseEntity<>(ApiResponse.success("Member added to care team", response), HttpStatus.CREATED);
    }

    @PostMapping("/api/v1/encounters/{encounterId}/care-team/members")
    @Operation(summary = "Add member directly to an encounter care team")
    public ResponseEntity<ApiResponse<CareTeamResponseDTO>> addEncounterMember(
            @PathVariable UUID encounterId,
            @Valid @RequestBody AddCareTeamMemberRequest request) {
        CareTeamResponseDTO response = careTeamService.addEncounterMember(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Member added to encounter care team", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/api/v1/care-teams/{careTeamId}/members/{memberId}")
    @Operation(summary = "Remove member from care team")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID careTeamId,
            @PathVariable UUID memberId) {
        careTeamService.removeMember(careTeamId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from care team", null));
    }
}


